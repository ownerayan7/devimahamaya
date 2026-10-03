import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HlsVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  className?: string;
}

export const HlsVideoPlayer: React.FC<HlsVideoPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  onPlay,
  className = "w-full h-full object-contain bg-black rounded-xl"
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    setHasError(false);

    if (!video || !src) return;

    const cleanSrc = src.trim();
    const lower = cleanSrc.toLowerCase();

    // Check if URL is an HLS stream (Cloudflare Stream, Bunny Stream, m3u8, manifest, etc.)
    const isStreamUrl =
      lower.includes('.m3u8') ||
      lower.includes('cloudflarestream.com') ||
      lower.includes('videodelivery.net') ||
      lower.includes('bunny') ||
      lower.includes('b-cdn.net') ||
      lower.includes('manifest') ||
      lower.includes('playlist.m3u8') ||
      lower.includes('hls');

    if (isStreamUrl) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 60,
          startLevel: -1, // Auto quality selection
          capLevelToPlayerSize: true,
        });

        hls.loadSource(cleanSrc);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) {
            video.play().catch(() => {});
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[HlsVideoPlayer] Network error encountered, attempting recovery...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[HlsVideoPlayer] Media error encountered, recovering media...');
                hls?.recoverMediaError();
                break;
              default:
                console.warn('[HlsVideoPlayer] Unrecoverable error, falling back to native src:', data);
                if (hls) hls.destroy();
                video.src = cleanSrc;
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari / iOS HLS support
        video.src = cleanSrc;
        if (autoPlay) {
          video.play().catch(() => {});
        }
      } else {
        video.src = cleanSrc;
      }
    } else {
      video.src = cleanSrc;
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hls) {
        try {
          hls.destroy();
        } catch {}
      }
    };
  }, [src, autoPlay]);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        poster={poster}
        onPlay={onPlay}
        onError={() => setHasError(true)}
        className={className}
      />

      {hasError && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-center text-stone-300 text-xs gap-2">
          <span className="text-red-400 font-bold">ভিডিও স্ট্রিম লোড করা সম্ভব হয়নি</span>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition-all font-semibold"
          >
            সরাসরি ব্রাউজারে খুলুন ↗
          </a>
        </div>
      )}
    </div>
  );
};
