/**
 * RTMP Ingest Server for OBS Streaming
 * Handles RTMP stream ingestion, authentication, and HLS transcoding
 */

import NodeMediaServer from 'node-media-server';
import ffmpeg from 'fluent-ffmpeg';
import { getDb } from './db';
import { streams, multistreamConnections, multistreamSettings } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { storagePut } from './storage';
import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';

// Track active restream processes: streamKey -> Map<platform, process>
const restreamProcesses = new Map<string, Map<string, ChildProcess>>();

// Platform RTMP ingest URLs (defaults if not set by user)
const PLATFORM_INGEST_URLS: Record<string, string> = {
  twitch: 'rtmp://live.twitch.tv/app',
  kick: 'rtmp://fa723fc1b171.global-contribute.live-video.net/app',
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
  facebook: 'rtmps://live-api-s.facebook.com:443/rtmp',
};

const RTMP_PORT = 1935;
const HTTP_PORT = 8000; // For HLS serving
const HLS_PATH = '/tmp/hls'; // Temporary HLS storage before S3 upload

// Ensure HLS directory exists
if (!fs.existsSync(HLS_PATH)) {
  fs.mkdirSync(HLS_PATH, { recursive: true });
}

const config = {
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: HTTP_PORT,
    mediaroot: HLS_PATH,
    allow_origin: '*',
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: false, // Don't keep segments after stream ends
        dash: false,
      },
    ],
  },
};

export const nms = new NodeMediaServer(config);

/**
 * Validate stream key and authenticate streamer
 */
async function validateStreamKey(streamKey: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    
    const result = await db
      .select()
      .from(streams)
      .where(eq(streams.streamKey, streamKey))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('[RTMP] Stream key validation error:', error);
    return false;
  }
}

/**
 * Start restreaming to all enabled platforms for a streamer
 */
async function startRestreaming(streamKey: string, streamerId: number) {
  try {
    const db = await getDb();
    if (!db) return;

    // Get multistream settings
    const [settings] = await db
      .select()
      .from(multistreamSettings)
      .where(eq(multistreamSettings.streamerId, streamerId))
      .limit(1);

    // If exclusive mode, no redistribution
    if (settings?.mode === 'exclusive') {
      console.log('[RTMP] Exclusive mode - no redistribution for:', streamKey);
      return;
    }

    // Get enabled connections
    const connections = await db
      .select()
      .from(multistreamConnections)
      .where(and(
        eq(multistreamConnections.streamerId, streamerId),
        eq(multistreamConnections.enabled, true)
      ));

    if (connections.length === 0) {
      console.log('[RTMP] No enabled multistream connections for:', streamKey);
      return;
    }

    const processMap = new Map<string, ChildProcess>();
    const sourceUrl = `rtmp://localhost:${RTMP_PORT}/live/${streamKey}`;

    for (const conn of connections) {
      // Partner mode: skip Twitch if they are a Twitch Partner
      if (settings?.mode === 'partner' && conn.platform === 'twitch' && conn.isTwitchPartner) {
        console.log('[RTMP] Skipping Twitch restream (Partner mode + Twitch Partner):', streamKey);
        continue;
      }

      if (!conn.streamKey) {
        console.warn('[RTMP] No stream key for platform:', conn.platform);
        continue;
      }

      const ingestUrl = conn.ingestUrl || PLATFORM_INGEST_URLS[conn.platform];
      const destUrl = `${ingestUrl}/${conn.streamKey}`;

      console.log(`[RTMP] Starting restream to ${conn.platform}:`, destUrl);

      // Use FFmpeg to restream: copy video/audio without re-encoding
      const proc = spawn('ffmpeg', [
        '-re',
        '-i', sourceUrl,
        '-c', 'copy',
        '-f', 'flv',
        destUrl,
      ], { stdio: 'pipe' });

      proc.stderr?.on('data', (data: Buffer) => {
        const msg = data.toString();
        if (msg.includes('error') || msg.includes('Error')) {
          console.error(`[RTMP] Restream error (${conn.platform}):`, msg.slice(0, 200));
        }
      });

      proc.on('exit', (code) => {
        console.log(`[RTMP] Restream ended (${conn.platform}), exit code:`, code);
        processMap.delete(conn.platform);
      });

      processMap.set(conn.platform, proc);
    }

    if (processMap.size > 0) {
      restreamProcesses.set(streamKey, processMap);
      console.log(`[RTMP] Restreaming to ${processMap.size} platform(s) for:`, streamKey);
    }
  } catch (error) {
    console.error('[RTMP] Failed to start restreaming:', error);
  }
}

/**
 * Stop all restream processes for a stream key
 */
function stopRestreaming(streamKey: string) {
  const processMap = restreamProcesses.get(streamKey);
  if (!processMap) return;

  processMap.forEach((proc, platform) => {
    console.log(`[RTMP] Stopping restream to ${platform}`);
    proc.kill('SIGTERM');
  });
  restreamProcesses.delete(streamKey);
}

/**
 * Handle stream publish (OBS starts streaming)
 */
nms.on('prePublish', async (id: string, StreamPath: string, args: any) => {
  console.log('[RTMP] Publish attempt:', { id, StreamPath, args });

  // Extract stream key from path: /live/STREAM_KEY
  const streamKey = StreamPath.split('/').pop();
  if (!streamKey) {
    console.error('[RTMP] No stream key in path');
    const session = nms.getSession(id);
    session?.reject();
    return;
  }

  // Validate stream key
  const isValid = await validateStreamKey(streamKey);
  if (!isValid) {
    console.error('[RTMP] Invalid stream key:', streamKey);
    const session = nms.getSession(id);
    session?.reject();
    return;
  }

  console.log('[RTMP] Stream key validated:', streamKey);

  // Update stream status to live
  try {
    const hlsUrl = `${process.env.VITE_FRONTEND_FORGE_API_URL || 'http://localhost:8000'}/live/${streamKey}/index.m3u8`;
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    await db
      .update(streams)
      .set({
        isLive: true,
        hlsUrl,
        startedAt: new Date(),
        viewerCount: 0,
      })
      .where(eq(streams.streamKey, streamKey));

    console.log('[RTMP] Stream started:', { streamKey, hlsUrl });

    // Get streamer ID and start restreaming
    const streamRecord = await db
      .select({ streamerId: streams.streamerId })
      .from(streams)
      .where(eq(streams.streamKey, streamKey))
      .limit(1);

    if (streamRecord.length > 0) {
      // Small delay to ensure RTMP stream is ready before restreaming
      setTimeout(() => startRestreaming(streamKey, streamRecord[0].streamerId), 3000);
    }
  } catch (error) {
    console.error('[RTMP] Failed to update stream status:', error);
  }
});

/**
 * Handle stream stop (OBS stops streaming)
 */
nms.on('donePublish', async (id: string, StreamPath: string, args: any) => {
  console.log('[RTMP] Stream ended:', { id, StreamPath });

  const streamKey = StreamPath.split('/').pop();
  if (!streamKey) return;

  try {
    // Update stream status to offline
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    await db
      .update(streams)
      .set({
        isLive: false,
        hlsUrl: null,
        viewerCount: 0,
      })
      .where(eq(streams.streamKey, streamKey));

    console.log('[RTMP] Stream stopped:', streamKey);

    // Stop restreaming processes
    stopRestreaming(streamKey);

    // Clean up HLS files
    const streamDir = path.join(HLS_PATH, 'live', streamKey);
    if (fs.existsSync(streamDir)) {
      fs.rmSync(streamDir, { recursive: true, force: true });
      console.log('[RTMP] Cleaned up HLS files:', streamDir);
    }
  } catch (error) {
    console.error('[RTMP] Failed to update stream status on stop:', error);
  }
});

/**
 * Start RTMP server
 */
export function startRTMPServer() {
  try {
    nms.run();
    console.log(`[RTMP] Server started on port ${RTMP_PORT}`);
    console.log(`[RTMP] HLS HTTP server started on port ${HTTP_PORT}`);
    console.log(`[RTMP] Stream URL: rtmp://localhost:${RTMP_PORT}/live`);
    console.log(`[RTMP] Stream Key: Use your unique stream key from dashboard`);
  } catch (error) {
    console.error('[RTMP] Failed to start server:', error);
  }
}

/**
 * Stop RTMP server
 */
export function stopRTMPServer() {
  try {
    nms.stop();
    console.log('[RTMP] Server stopped');
  } catch (error) {
    console.error('[RTMP] Failed to stop server:', error);
  }
}
