import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface LiveThumbnailProps {
  hlsUrl?: string;
  thumbnailUrl?: string;
  alt: string;
  className?: string;
}

export default function LiveThumbnail({ hlsUrl, thumbnailUrl, alt, className = '' }: LiveThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl || error) return;

    // Only initialize HLS when hovered for performance
    if (!isHovered) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => {
          console.error('[LiveThumbnail] Autoplay failed:', err);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('[LiveThumbnail] Fatal error:', data);
          setError(true);
          hls.destroy();
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
      video.play().catch((err) => {
        console.error('[LiveThumbnail] Autoplay failed:', err);
      });
    } else {
      setError(true);
    }
  }, [hlsUrl, error, isHovered]);

  // Show static thumbnail if HLS fails or not hovered
  if (error || !hlsUrl || !isHovered) {
    if (thumbnailUrl) {
      return (
        <img
          src={thumbnailUrl}
          alt={alt}
          className={className}
          onMouseEnter={() => setIsHovered(true)}
        />
      );
    }
    return (
      <div 
        className={`${className} flex items-center justify-center bg-muted`}
        onMouseEnter={() => setIsHovered(true)}
      >
        <span className="text-muted-foreground text-sm">No preview</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      onMouseLeave={() => setIsHovered(false)}
    />
  );
}
