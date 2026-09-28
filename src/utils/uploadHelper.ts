import { getAppStorage } from '../lib/firebase';
import { convertFileToDataUrl } from './fileConverter';

/**
 * Universal fail-proof media upload helper for all pages.
 * Tries Firebase Storage first (with 4s timeout).
 * Falls back to Express server /api/upload-media endpoint.
 * Falls back to Data URL if server is unavailable.
 */
export async function uploadMediaFile(
  file: File,
  folderName: string = 'media'
): Promise<string> {
  if (!file) return '';

  // 1. Try Firebase Storage with a 4-second timeout
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
        setTimeout(() => reject(new Error('Firebase Storage timeout')), 4000)
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

  // 2. Fallback to Express backend /api/upload-media
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
        console.log(`[Upload Success] Uploaded to Express server: ${result.url}`);
        return result.url;
      }
    }
  } catch (expressErr) {
    console.warn('[Upload Notice] Express backend upload fallback triggered:', expressErr);
  }

  // 3. Fallback to local Data URL
  try {
    return await convertFileToDataUrl(file);
  } catch (dataErr) {
    console.error('[Upload Error] All upload strategies failed:', dataErr);
    return '';
  }
}
