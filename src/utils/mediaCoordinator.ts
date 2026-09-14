/**
 * Global Media Coordinator for 11 Star Club
 * Enforces strictly MUTUAL EXCLUSIVE playback across the entire web application:
 * When ANY video, audio, YouTube clip, Mahalaya chant, Rabindra Sangeet,
 * member video, or prayer item begins playing, all other media in the app
 * automatically and immediately stops / pauses!
 * (Gita page layout and flow is preserved as requested).
 */

export type MediaType = 'audio' | 'video' | 'youtube' | 'gita' | 'prayer' | 'rabindra' | 'mahalaya' | 'radio' | 'general';

interface MediaPlayEventDetail {
  sourceId: string;
  mediaType: MediaType;
  timestamp: number;
}

const MEDIA_PLAY_EVENT = '11starclub-media-play-started';
let currentActiveMediaId: string | null = null;
let isInitialized = false;

export function getActiveMediaId(): string | null {
  return currentActiveMediaId;
}

/**
 * Pause all other HTML5 <video> and <audio> elements across the document.
 */
export function pauseAllHtmlMediaElements(excludeElement?: HTMLMediaElement | null, excludeId?: string | null): void {
  if (typeof document === 'undefined') return;

  try {
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio) => {
      try {
        if (audio !== excludeElement && (!excludeId || (audio as any).__mediaId !== excludeId) && !audio.paused) {
          audio.pause();
        }
      } catch {}
    });

    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      try {
        if (video !== excludeElement && (!excludeId || (video as any).__mediaId !== excludeId) && !video.paused) {
          video.pause();
        }
      } catch {}
    });
  } catch {}
}

/**
 * Pause all iframes (YouTube, Facebook, Drive, etc.) on the page safely.
 */
export function pauseAllIframeMedia(excludeSourceWindow?: WindowProxy | null, excludeId?: string | null): void {
  if (typeof document === 'undefined') return;

  try {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        const win = iframe.contentWindow;
        if (!win) return;
        
        try {
          if (excludeSourceWindow && win === excludeSourceWindow) return;
        } catch {}

        if (excludeId && (iframe as any).__mediaId === excludeId) return;

        // YouTube API Pause Command
        win.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
        // Standard HTML5 / generic embed pause message fallbacks
        win.postMessage(JSON.stringify({ method: 'pause' }), '*');
        win.postMessage(JSON.stringify({ action: 'pause' }), '*');
      } catch {}
    });
  } catch {}
}

/**
 * Broadcast that a specific media element or player has started playback.
 * This triggers automatic and immediate pause on all other active media across the site.
 */
export function broadcastMediaPlaybackStarted(
  sourceId: string,
  mediaType: MediaType = 'general',
  sourceElement?: HTMLMediaElement | null,
  sourceWindow?: WindowProxy | null
): void {
  currentActiveMediaId = sourceId;

  // 1. Dispatch custom event for React components & subscribers
  const detail: MediaPlayEventDetail = {
    sourceId,
    mediaType,
    timestamp: Date.now(),
  };
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(MEDIA_PLAY_EVENT, { detail }));
    }
  } catch {}

  // 2. Pause all other HTML5 media elements
  pauseAllHtmlMediaElements(sourceElement, sourceId);

  // 3. Pause all other iframes
  pauseAllIframeMedia(sourceWindow, sourceId);
}

/**
 * Manually stop all media playing across the entire application.
 */
export function stopAllGlobalMedia(): void {
  broadcastMediaPlaybackStarted('global-stop-sentinel', 'general');
}

/**
 * Subscribe to the media play event to receive a callback when OTHER media begins playing.
 * Returns an unsubscription cleanup function.
 */
export function subscribeToMediaStop(currentSourceId: string, onStop: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    try {
      const customEvt = event as CustomEvent<MediaPlayEventDetail>;
      if (customEvt.detail && customEvt.detail.sourceId !== currentSourceId) {
        onStop();
      }
    } catch {}
  };

  window.addEventListener(MEDIA_PLAY_EVENT, handler);
  return () => {
    try {
      window.removeEventListener(MEDIA_PLAY_EVENT, handler);
    } catch {}
  };
}

/**
 * Helper hook / binder for native HTML5 <audio> or <video> elements.
 * Automatically tags element and handles mutual-exclusion pausing.
 */
export function registerHtmlMediaElement(
  element: HTMLMediaElement | null,
  sourceId: string,
  mediaType: MediaType = 'audio'
): () => void {
  if (!element) return () => {};

  (element as any).__mediaId = sourceId;

  const handlePlay = () => {
    try {
      broadcastMediaPlaybackStarted(sourceId, mediaType, element);
    } catch {}
  };

  try {
    element.addEventListener('play', handlePlay);
  } catch {}

  const unsubscribe = subscribeToMediaStop(sourceId, () => {
    try {
      if (!element.paused) {
        element.pause();
      }
    } catch {}
  });

  return () => {
    try {
      element.removeEventListener('play', handlePlay);
    } catch {}
    unsubscribe();
  };
}

/**
 * Global Automatic Listener Setup
 * Installs window-level capture event listeners for HTML5 media and YouTube iframe postMessages.
 * Automatically pauses any previous video when a new video starts.
 */
export function initGlobalMediaCoordinator(): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  // 1. Global Capture on HTML5 'play' events (video / audio)
  try {
    document.addEventListener(
      'play',
      (event: Event) => {
        try {
          const target = event.target as HTMLMediaElement;
          if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
            let mediaId = (target as any).__mediaId;
            if (!mediaId) {
              mediaId = `auto-html5-${target.tagName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
              (target as any).__mediaId = mediaId;
            }
            broadcastMediaPlaybackStarted(mediaId, target.tagName.toLowerCase() as MediaType, target);
          }
        } catch {}
      },
      true // Capture phase to catch all un-bubbled play events!
    );
  } catch {}

  // 2. Global YouTube postMessage listener
  try {
    window.addEventListener('message', (event: MessageEvent) => {
      try {
        if (!event.data) return;
        let data: any = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }

        // YouTube player state change: 1 = PLAYING
        const isPlayingState =
          (data && data.event === 'onStateChange' && data.info === 1) ||
          (data && data.event === 'infoDelivery' && data.info && data.info.playerState === 1);

        if (isPlayingState) {
          const sourceWin = event.source as WindowProxy;
          broadcastMediaPlaybackStarted('youtube-embed-playing', 'youtube', null, sourceWin);
        }
      } catch {}
    });
  } catch {}
}

// Auto-initialize coordinator when imported in browser environment
if (typeof window !== 'undefined') {
  initGlobalMediaCoordinator();
}
