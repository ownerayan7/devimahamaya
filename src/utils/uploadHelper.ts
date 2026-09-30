import { getAppStorage } from '../lib/firebase';
import { convertFileToDataUrl } from './fileConverter';
import { getPublicMediaUrl } from './mediaEmbedHelper';

/**
 * Universal fail-proof media upload helper for all pages.
 * 1. Tries direct binary upload to Express server /api/upload-binary (Fastest, handles up to 500MB without base64 overhead).
 * 2. Tries Firebase Storage (with 5s timeout).
 * 3. Falls back to Express Base64 endpoint /api/upload-media.
 * 4. Falls back to Data URL if offline.
 */
export async function uploadMediaFile(
  file: File,
  folderName: string = 'media'
): Promise<string> {
  if (!file) return '';

  // 1. Primary Strategy: Direct Binary Stream Upload to Express Server
  try {
    const res = await fetch(`/api/upload-binary?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });
    if (res.ok) {
      const result = await res.json();
      if (result.url || result.relativeUrl) {
        const publicUrl = getPublicMediaUrl(result.url || result.relativeUrl);
        console.log(`[Upload Success] Uploaded binary file directly to Express server: ${publicUrl}`);
        return publicUrl;
      }
    }
  } catch (expressErr) {
    console.warn('[Upload Notice] Direct binary upload fallback triggered:', expressErr);
  }

  // 2. Secondary Strategy: Express Base64 Endpoint /api/upload-media
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
      if (result.url || result.relativeUrl) {
        const publicUrl = getPublicMediaUrl(result.url || result.relativeUrl);
        console.log(`[Upload Success] Uploaded to Express server via Base64: ${publicUrl}`);
        return publicUrl;
      }
    }
  } catch (expressErr) {
    console.warn('[Upload Notice] Express Base64 upload fallback triggered:', expressErr);
  }

  // 3. Tertiary Strategy: Firebase Storage with a 10-second timeout
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
        setTimeout(() => reject(new Error('Firebase Storage timeout')), 10000)
      );

      const firebaseUrl = await Promise.race([storagePromise, timeoutPromise]);
      if (firebaseUrl) {
        console.log(`[Upload Success] Uploaded to Firebase Storage: ${firebaseUrl}`);
        return firebaseUrl;
      }
    } catch (firebaseErr) {
      console.warn('[Upload Notice] Firebase Storage upload fallback triggered:', firebaseErr);
    }
  }

  // 4. Final Fallback: Return a clean fallback Data URL if small enough, or error
  try {
    const dataUrl = await convertFileToDataUrl(file);
    // If small enough (< 800KB), safe for Firestore
    if (dataUrl && dataUrl.length < 800000) {
      return dataUrl;
    }
  } catch (dataErr) {
    console.error('[Upload Error] Data URL conversion failed:', dataErr);
  }

  console.error('[Upload Error] All server upload strategies failed for:', file.name);
  return '';
}
