import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp({
  ...firebaseConfig,
  storageBucket: firebaseConfig.storageBucket
});

// Configure Firestore with persistent offline caching and auto long-polling for seamless iframe & web connectivity
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // Fallback if already initialized in development re-renders
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = dbInstance;
export const auth = getAuth(app);

let _storageInstance: FirebaseStorage | null = null;
export function getAppStorage(): FirebaseStorage | null {
  if (!_storageInstance) {
    try {
      _storageInstance = getStorage(app);
    } catch (e) {
      console.warn('Storage service notice:', e);
      return null;
    }
  }
  return _storageInstance;
}

export const storage = null as FirebaseStorage | null;

// Function to get FCM token safely
export async function getFCMToken() {
  try {
    if (typeof window === 'undefined') return null;
    const { getMessaging, getToken } = await import('firebase/messaging');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { 
      vapidKey: 'BMQo9H_44u-dK7Z4G6z8z4eE7aZ_s8H7YJ5d4I4V4O4N4j0L4k4h4l4L4H4D4j0L4k4h4l4L4H4D4j0'
    });
    return token;
  } catch (error) {
    console.warn('FCM token retrieval notice:', error);
    return null;
  }
}
