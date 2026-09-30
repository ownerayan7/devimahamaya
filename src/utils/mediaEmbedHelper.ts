/**
 * Universal Media Embed & Helper Utility for 11 Star Club
 * Supports YouTube Videos, Facebook Videos, Google Drive Files, and Local Media
 */
import { extractYouTubeId, getYouTubeThumbnail } from './youtubeHelper';
import { extractDriveFileId, getDriveVideoEmbedUrl, getDriveDirectImageUrl } from './driveHelper';

export interface ParsedMedia {
  type: 'youtube' | 'facebook' | 'drive' | 'direct-video' | 'local' | 'audio' | 'image' | 'unknown';
  embedUrl: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  isDirectVideo?: boolean;
  isValid: boolean;
}

export function getPublicMediaUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  
  if (trimmed.startsWith('/uploads/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${trimmed}`;
    }
    return trimmed;
  }
  
  if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
    const idx = trimmed.indexOf('/uploads/');
    if (idx !== -1 && typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${trimmed.substring(idx)}`;
    }
  }
  return trimmed;
}

export function isFacebookVideoUrl(url: string): boolean {
  if (!url) return false;
  return /facebook\.com\/(?:.+?\/videos\/\d+|reel\/\d+|watch\/\?v=\d+|watch|video\.php\?v=\d+)|fb\.watch\//i.test(url.trim());
}

export function getFacebookVideoEmbedUrl(url: string): string {
  const cleanUrl = url.trim();
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&t=0`;
}

export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('blob:') ||
    clean.startsWith('data:video') ||
    clean.includes('/uploads/') ||
    /\.(mp4|webm|mov|m4v|ogv|mkv|3gp|avi)(\?.*)?$/i.test(clean)
  );
}

export function parseUniversalMedia(input: string, explicitType?: 'video' | 'audio' | 'photo'): ParsedMedia {
  if (!input) {
    return { type: 'unknown', embedUrl: '', isValid: false };
  }

  const rawTrimmed = input.trim();
  const trimmed = getPublicMediaUrl(rawTrimmed);

  // 1. YouTube
  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`,
      thumbnailUrl: getYouTubeThumbnail(youtubeId),
      sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      isDirectVideo: false,
      isValid: true,
    };
  }

  // 2. Facebook Video
  if (isFacebookVideoUrl(trimmed)) {
    return {
      type: 'facebook',
      embedUrl: getFacebookVideoEmbedUrl(trimmed),
      sourceUrl: trimmed,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
      isDirectVideo: false,
      isValid: true,
    };
  }

  // 3. Google Drive
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    if (explicitType === 'photo') {
      const imgUrl = getDriveDirectImageUrl(trimmed);
      return {
        type: 'drive',
        embedUrl: imgUrl,
        thumbnailUrl: imgUrl,
        sourceUrl: trimmed,
        isDirectVideo: false,
        isValid: true,
      };
    }
    const previewUrl = getDriveVideoEmbedUrl(trimmed);
    return {
      type: 'drive',
      embedUrl: previewUrl,
      sourceUrl: trimmed,
      thumbnailUrl: getDriveDirectImageUrl(trimmed),
      isDirectVideo: false,
      isValid: true,
    };
  }

  // 4. Audio format (mp3, wav, ogg, etc.)
  if (explicitType === 'audio' || /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('data:audio/')) {
    return {
      type: 'audio',
      embedUrl: trimmed,
      sourceUrl: trimmed,
      isDirectVideo: false,
      isValid: true,
    };
  }

  // 5. Direct Video file, Blob, or /uploads/ server video
  if (isDirectVideoUrl(trimmed) || trimmed.includes('/uploads/') || (explicitType === 'video' && (trimmed.startsWith('blob:') || trimmed.startsWith('data:')))) {
    return {
      type: 'direct-video',
      embedUrl: trimmed,
      sourceUrl: trimmed,
      isDirectVideo: true,
      isValid: true,
    };
  }

  // 6. Image
  if (explicitType === 'photo' || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('data:image/')) {
    return {
      type: 'image',
      embedUrl: trimmed,
      thumbnailUrl: trimmed,
      sourceUrl: trimmed,
      isDirectVideo: false,
      isValid: true,
    };
  }

  // 7. Generic URL / fallback
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'local',
      embedUrl: trimmed,
      sourceUrl: trimmed,
      isDirectVideo: false,
      isValid: true,
    };
  }

  return {
    type: 'unknown',
    embedUrl: trimmed,
    sourceUrl: trimmed,
    isDirectVideo: false,
    isValid: false,
  };
}

