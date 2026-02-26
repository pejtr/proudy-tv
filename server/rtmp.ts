/**
 * RTMP Ingest Server for OBS Streaming
 * Handles RTMP stream ingestion, authentication, and HLS transcoding
 */

import NodeMediaServer from 'node-media-server';
import ffmpeg from 'fluent-ffmpeg';
import { getDb } from './db';
import { streams } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { storagePut } from './storage';
import * as fs from 'fs';
import * as path from 'path';

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
