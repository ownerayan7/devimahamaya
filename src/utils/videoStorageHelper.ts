/**
 * Helper utilities for handling, storing, and generating thumbnails for local/gallery videos using IndexedDB
 */

const DB_NAME = '11star_club_media_db';
const STORE_NAME = 'video_blobs';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVideoBlob(id: string, blob: Blob | File | string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save video to IndexedDB:', err);
  }
}

export async function getVideoBlob(id: string): Promise<Blob | File | string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not get video from IndexedDB:', err);
    return null;
  }
}

export async function deleteVideoBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete video from IndexedDB:', err);
  }
}

/**
 * Generates a thumbnail image DataURL and computes formatted duration from a video File
 */
export function generateVideoThumbnail(
  file: File
): Promise<{ thumbnailUrl: string; durationStr: string }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    let hasResolved = false;

    const cleanupAndResolve = (result: { thumbnailUrl: string; durationStr: string }) => {
      if (!hasResolved) {
        hasResolved = true;
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      }
    };

    video.onloadedmetadata = () => {
      const dur = video.duration || 0;
      const minutes = Math.floor(dur / 60);
      const seconds = Math.floor(dur % 60);
      const durationStr = `${minutes > 0 ? minutes + ':' : '00:'}${seconds < 10 ? '0' : ''}${seconds} মিনিট`;

      // Seek to either 1s or midpoint
      video.currentTime = Math.min(1.5, dur > 1 ? dur / 3 : 0.5);

      setTimeout(() => {
        // Fallback if seeked doesn't fire
        cleanupAndResolve({ thumbnailUrl: '', durationStr });
      }, 2500);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(640, video.videoWidth || 640);
        canvas.height = Math.min(360, video.videoHeight || 360);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
          const dur = video.duration || 0;
          const minutes = Math.floor(dur / 60);
          const seconds = Math.floor(dur % 60);
          const durationStr = `${minutes > 0 ? minutes + ':' : '00:'}${seconds < 10 ? '0' : ''}${seconds} মিনিট`;
          cleanupAndResolve({ thumbnailUrl, durationStr });
          return;
        }
      } catch (e) {
        console.warn('Canvas capture error:', e);
      }
      cleanupAndResolve({ thumbnailUrl: '', durationStr: 'গ্যালারি ভিডিও' });
    };

    video.onerror = () => {
      cleanupAndResolve({ thumbnailUrl: '', durationStr: 'গ্যালারি ভিডিও' });
    };
  });
}
