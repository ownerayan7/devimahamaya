/**
 * Persistent Storage Engine using IndexedDB & LocalStorage Fallback.
 * Solves LocalStorage 5MB QuotaExceededError and Firestore latency issue
 * ensuring uploaded media (photos, videos, notices, audio) never disappear on page refresh.
 */

const DB_NAME = '11StarClubPersistentDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_key_value_store';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
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

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbSet<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('IDB write warning:', e);
  }
}

/**
 * Saves items reliably to both IndexedDB and LocalStorage.
 */
export async function savePersistentItems<T extends { id: string }>(key: string, items: T[]): Promise<void> {
  // 1. Save to IndexedDB (unlimited quota)
  await idbSet(key, items);

  // 2. Save to LocalStorage (try-catch against QuotaExceededError)
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.warn(`LocalStorage quota reached for key ${key}, relying on IndexedDB persistence.`);
  }
}

/**
 * Loads items reliably from LocalStorage and IndexedDB, returning merged non-duplicate list.
 */
export async function loadPersistentItems<T extends { id: string }>(key: string): Promise<T[]> {
  let localItems: T[] = [];
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        localItems = parsed;
      }
    }
  } catch (e) {
    console.warn(e);
  }

  const idbItems = (await idbGet<T[]>(key)) || [];

  // Merge items by ID preserving uniqueness
  const map = new Map<string, T>();
  for (const item of idbItems) {
    if (item && item.id) map.set(item.id, item);
  }
  for (const item of localItems) {
    if (item && item.id && !map.has(item.id)) map.set(item.id, item);
  }

  const merged = Array.from(map.values());

  // Ensure IndexedDB and LocalStorage are updated with merged result
  if (merged.length > 0) {
    await idbSet(key, merged);
    try {
      localStorage.setItem(key, JSON.stringify(merged));
    } catch {}
  }

  return merged;
}

/**
 * Utility to merge items from Firestore snapshot with local items, ensuring newly added local items are never overwritten.
 */
export function mergeItemsWithLocal<T extends { id: string; createdAt?: number }>(
  firestoreItems: T[],
  localItems: T[]
): T[] {
  const map = new Map<string, T>();
  // First add local items
  for (const item of localItems) {
    if (item && item.id) map.set(item.id, item);
  }
  // Then add/overwrite with Firestore items
  for (const item of firestoreItems) {
    if (item && item.id) map.set(item.id, item);
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return merged;
}
