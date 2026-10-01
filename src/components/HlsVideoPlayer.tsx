import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  className?: string;
}

export const HlsVideoPlayer: React.FC<HlsVideoPlayerProps> = ({ src, poster, autoPlay, onPlay, className = "w-full h-full object-contain bg-black" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let hls: Hls;
    const video = videoRef.current;
    if (!video) return;

    const isStreamUrl = src.endsWith('.m3u8') || src.includes('cloudflare') || src.includes('bunny');
    if (isStreamUrl) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }
    } else {
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      preload="metadata"
      autoPlay={autoPlay}
      poster={poster}
      onPlay={onPlay}
      className={className}
    />
  );
};
