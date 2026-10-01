import { getAppStorage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadFileToStorage(id: string, file: Blob | File, folder: 'videos' | 'thumbnails'): Promise<string> {
  const storage = getAppStorage();
  if (!storage) throw new Error('Storage service unavailable');
  
  const storageRef = ref(storage, `${folder}/${id}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
