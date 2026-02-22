import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { Router } from "express";
import * as db from "./db";
import { storagePut } from "./storage";

const router = Router();

// Register fonts (system fonts should be available)
try {
  GlobalFonts.registerFromPath("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVu Sans Bold");
  GlobalFonts.registerFromPath("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "DejaVu Sans");
} catch (error) {
  console.warn("[OG Image] Font registration failed, using fallback fonts");
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

interface OGImageOptions {
  title: string;
  category?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  streamerName?: string;
}

async function generateOGImage(options: OGImageOptions): Promise<Buffer> {
  const canvas = createCanvas(OG_WIDTH, OG_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background gradient (PROUDY.TV brand colors)
  const gradient = ctx.createLinearGradient(0, 0, OG_WIDTH, OG_HEIGHT);
  gradient.addColorStop(0, "#1a0b2e");
  gradient.addColorStop(0.5, "#2d1b4e");
  gradient.addColorStop(1, "#1a0b2e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT);

  // Try to add thumbnail if available (skip if video or loading fails)
  let thumbnailLoaded = false;
  if (options.thumbnailUrl && !options.thumbnailUrl.endsWith('.mp4')) {
    try {
      // Fetch image as buffer first (canvas can't load JPEG from HTTP directly)
      const response = await fetch(options.thumbnailUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const imageBuffer = await response.arrayBuffer();
      const thumbnail = await loadImage(Buffer.from(imageBuffer));
      // Draw thumbnail on left side with rounded corners
      const thumbWidth = 500;
      const thumbHeight = 400;
      const thumbX = 50;
      const thumbY = (OG_HEIGHT - thumbHeight) / 2;
      
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(thumbX, thumbY, thumbWidth, thumbHeight, 16);
      ctx.clip();
      ctx.drawImage(thumbnail, thumbX, thumbY, thumbWidth, thumbHeight);
      ctx.restore();
      
      // Add border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(thumbX, thumbY, thumbWidth, thumbHeight, 16);
      ctx.stroke();
      
      thumbnailLoaded = true;
    } catch (error) {
      console.warn("[OG Image] Failed to load thumbnail, using fallback layout:", error);
    }
  }

  // Text area (centered if no thumbnail, right side if thumbnail loaded)
  const textX = thumbnailLoaded ? 600 : 100;
  const textWidth = OG_WIDTH - textX - 100;

  // PROUDY.TV logo text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px 'DejaVu Sans Bold', sans-serif";
  ctx.fillText("PROUDY", textX, 120);
  
  // Gradient text for .TV
  const tvGradient = ctx.createLinearGradient(textX + 220, 0, textX + 320, 0);
  tvGradient.addColorStop(0, "#00d9ff");
  tvGradient.addColorStop(0.5, "#a855f7");
  tvGradient.addColorStop(1, "#ec4899");
  ctx.fillStyle = tvGradient;
  ctx.fillText(".TV", textX + 220, 120);

  // Stream title (word wrap)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px 'DejaVu Sans Bold', sans-serif";
  const words = options.title.split(" ");
  let line = "";
  let y = 220;
  const lineHeight = 55;
  const maxLines = 3;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > textWidth && line !== "") {
      ctx.fillText(line, textX, y);
      line = words[i] + " ";
      y += lineHeight;
      lineCount++;
      
      if (lineCount >= maxLines - 1) {
        // Truncate with ellipsis
        const remaining = words.slice(i).join(" ");
        if (remaining.length > 30) {
          line = remaining.substring(0, 27) + "...";
        } else {
          line = remaining;
        }
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, textX, y);

  // Category badge
  if (options.category) {
    const badgeY = y + 80;
    const categoryIcons: Record<string, string> = {
      gaming: "🎮",
      music: "🎵",
      asmr: "🎧",
      "chill-talk": "💬",
    };
    
    const icon = categoryIcons[options.category.toLowerCase()] || "📺";
    const categoryText = `${icon} ${options.category}`;
    
    ctx.font = "28px 'DejaVu Sans', sans-serif";
    const categoryMetrics = ctx.measureText(categoryText);
    const badgeWidth = categoryMetrics.width + 40;
    const badgeHeight = 45;
    
    // Badge background
    ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
    ctx.beginPath();
    ctx.roundRect(textX, badgeY, badgeWidth, badgeHeight, 8);
    ctx.fill();
    
    // Badge text
    ctx.fillStyle = "#ffffff";
    ctx.fillText(categoryText, textX + 20, badgeY + 32);
  }

  // Viewer count
  if (options.viewerCount !== undefined) {
    const viewerY = options.category ? y + 160 : y + 80;
    ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
    ctx.font = "bold 32px 'DejaVu Sans Bold', sans-serif";
    ctx.fillText(`🔴 ${options.viewerCount.toLocaleString()} watching`, textX, viewerY);
  }

  // Streamer name
  if (options.streamerName) {
    const streamerY = OG_HEIGHT - 80;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "28px 'DejaVu Sans', sans-serif";
    ctx.fillText(`by ${options.streamerName}`, textX, streamerY);
  }

  // Footer line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, OG_HEIGHT - 40);
  ctx.lineTo(OG_WIDTH - 50, OG_HEIGHT - 40);
  ctx.stroke();

  return canvas.toBuffer("image/png");
}

// Endpoint: /api/og-image/:streamId
router.get("/:streamId", async (req, res) => {
  try {
    const streamId = parseInt(req.params.streamId);
    
    if (isNaN(streamId)) {
      return res.status(400).json({ error: "Invalid stream ID" });
    }

    // Check if OG image already exists in S3
    const cacheKey = `og-images/stream-${streamId}.png`;
    
    // Fetch stream data
    const stream = await db.getStreamById(streamId);
    
    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Log stream data for debugging
    console.log(`[OG Image] Stream data:`, {
      id: streamId,
      title: stream.title,
      category: stream.category,
      viewerCount: stream.viewerCount,
      thumbnailUrl: stream.thumbnailUrl,
      streamerName: stream.streamerName
    });

    // Generate OG image
    const imageBuffer = await generateOGImage({
      title: stream.title,
      category: stream.category || undefined,
      viewerCount: stream.viewerCount,
      thumbnailUrl: stream.thumbnailUrl || undefined,
      streamerName: stream.streamerName || undefined,
    });

    // Upload to S3 (skip cache check for now to always generate fresh)
    const { url } = await storagePut(cacheKey, imageBuffer, "image/png");

    // Return image
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(imageBuffer);
    
    console.log(`[OG Image] Generated for stream ${streamId}, cached at ${url}`);
  } catch (error) {
    console.error("[OG Image] Generation failed:", error);
    res.status(500).json({ error: "Failed to generate OG image" });
  }
});

export default router;
