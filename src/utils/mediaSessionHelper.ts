/**
 * Global Lock Screen & Background MediaSession Helper
 * Configures the W3C Web MediaSession API (navigator.mediaSession)
 * so that whenever any audio, Gita, Rabindra Sangeet, Mahalaya,
 * or Prayer is playing, the user gets:
 * 1. Lock screen notification with Bengali track title & club branding
 * 2. Lock screen Play/Pause & Next/Prev physical / OS controls
 * 3. Uninterrupted background audio playback even when phone screen is locked
 */

export interface MediaSessionConfig {
  title: string;
  artist?: string;
  album?: string;
  artworkUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

let silentAudioCarrier: HTMLAudioElement | null = null;

/**
 * Initializes a microscopic silent audio carrier that prevents mobile OS
 * (Android Chrome, iOS Safari) from killing audio when screen is turned off.
 */
function getSilentAudioCarrier(): HTMLAudioElement {
  if (!silentAudioCarrier && typeof window !== 'undefined') {
    silentAudioCarrier = new Audio();
    // 1-second silent MP3 base64
    silentAudioCarrier.src =
      'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD/';
    silentAudioCarrier.loop = true;
    silentAudioCarrier.volume = 0.01;
  }
  return silentAudioCarrier!;
}

export function updateLockScreenMediaMetadata(config: MediaSessionConfig): void {
  if (typeof window === 'undefined') return;

  const title = config.title || '11 স্টার ক্লাব অডিও';
  const artist = config.artist || '11 স্টার ক্লাব';
  const album = config.album || 'শ্রীমদ্ভগবদ্গীতা ও পবিত্র প্রার্থনা';
  const artworkUrl = config.artworkUrl || '/icon.png';

  // 1. Configure Navigator MediaSession API
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/png' },
          { src: artworkUrl, sizes: '128x128', type: 'image/png' },
          { src: artworkUrl, sizes: '192x192', type: 'image/png' },
          { src: artworkUrl, sizes: '256x256', type: 'image/png' },
          { src: artworkUrl, sizes: '384x384', type: 'image/png' },
          { src: artworkUrl, sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.playbackState = 'playing';

      if (config.onPlay) {
        navigator.mediaSession.setActionHandler('play', () => {
          navigator.mediaSession.playbackState = 'playing';
          config.onPlay?.();
        });
      } else {
        try { navigator.mediaSession.setActionHandler('play', null); } catch {}
      }

      if (config.onPause) {
        navigator.mediaSession.setActionHandler('pause', () => {
          navigator.mediaSession.playbackState = 'paused';
          config.onPause?.();
        });
      } else {
        try { navigator.mediaSession.setActionHandler('pause', null); } catch {}
      }

      // Explicitly disable / clear all other controls to show ONLY Play/Pause on lockscreen
      try { navigator.mediaSession.setActionHandler('nexttrack', null); } catch {}
      try { navigator.mediaSession.setActionHandler('previoustrack', null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekto', null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekbackward', null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekforward', null); } catch {}
      try { navigator.mediaSession.setActionHandler('stop', null); } catch {}
    } catch (err) {
      console.warn('Lockscreen media session setup notice:', err);
    }
  }

  // 2. Start silent carrier to hold audio focus on mobile background/lockscreen
  try {
    const carrier = getSilentAudioCarrier();
    if (carrier.paused) {
      carrier.play().catch(() => {});
    }
  } catch {}
}

export function pauseLockScreenMediaSession(): void {
  if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'paused';
    } catch {}
  }
  if (silentAudioCarrier && !silentAudioCarrier.paused) {
    try {
      silentAudioCarrier.pause();
    } catch {}
  }
}

export function clearLockScreenMediaMetadata(): void {
  if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    } catch {}
  }
  if (silentAudioCarrier) {
    try {
      silentAudioCarrier.pause();
      silentAudioCarrier.currentTime = 0;
    } catch {}
  }
}
