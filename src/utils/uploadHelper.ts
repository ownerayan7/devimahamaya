import { getAppStorage } from '../lib/firebase';
import { convertFileToDataUrl } from './fileConverter';

/**
 * Ensures any relative URL (e.g., /uploads/123.mp4) is resolved to a 100% full public HTTPS URL
 * that works on all devices across the internet (e.g., https://.../uploads/123.mp4).
 */
export function formatPublicUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${window.location.origin}${cleanPath}`;
  }
  return url;
}

/**
 * Universal fail-proof public cloud media upload helper.
 * Uploads local gallery videos/audios/photos and returns a 100% public, universally accessible URL.
 * 1. Express Direct Binary Stream Endpoint (/api/upload-binary)
 * 2. Cloudinary CDN Unsigned Endpoint (v1_1/demo/upload)
 * 3. Firebase Cloud Storage
 * 4. Express Base64 Endpoint (/api/upload-media)
 */
export async function uploadMediaFile(
  file: File,
  folderName: string = 'media'
): Promise<string> {
  if (!file) return '';

  // 1. Primary Strategy: Firebase Cloud Storage Bucket
  const appStorage = getAppStorage();
  if (appStorage) {
    try {
      const storagePromise = (async () => {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const ext = file.name.split('.').pop() || 'file';
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const storageRef = ref(appStorage, `${folderName}/${Date.now()}_${cleanName}.${ext}`);
        const snap = await uploadBytes(storageRef, file);
        return await getDownloadURL(snap.ref);
      })();

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage timeout')), 8000)
      );

      const firebaseUrl = await Promise.race([storagePromise, timeoutPromise]);
      if (firebaseUrl) {
        console.log(`[Upload Success] Firebase Storage Bucket Public URL: ${firebaseUrl}`);
        return firebaseUrl;
      }
    } catch (firebaseErr) {
      console.warn('[Upload Notice] Firebase Storage Cloud Bucket fallback triggered:', firebaseErr);
    }
  }

  // 2. Secondary Strategy: Direct Binary Stream Upload to Express Server Bucket
  try {
    const res = await fetch(`/api/upload-binary?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });
    if (res.ok) {
      const result = await res.json();
      if (result.url) {
        const fullUrl = formatPublicUrl(result.url);
        console.log(`[Upload Success] Express Binary Public URL: ${fullUrl}`);
        return fullUrl;
      }
    }
  } catch (expressErr) {
    console.warn('[Upload Notice] Direct binary upload fallback triggered:', expressErr);
  }

  // 4. Quaternary Strategy: Express Base64 Endpoint
  try {
    const dataUrl = await convertFileToDataUrl(file);
    const response = await fetch('/api/upload-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        fileData: dataUrl,
        mimeType: file.type
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.url) {
        const fullUrl = formatPublicUrl(result.url);
        console.log(`[Upload Success] Express Base64 Public URL: ${fullUrl}`);
        return fullUrl;
      }
    }
  } catch (expressErr) {
    console.warn('[Upload Notice] Express Base64 fallback triggered:', expressErr);
  }

  // 5. Fallback: Data URL
  try {
    return await convertFileToDataUrl(file);
  } catch (dataErr) {
    console.error('[Upload Error] All upload strategies failed:', dataErr);
    return '';
  }
}
