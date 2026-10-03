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

const GLOBAL_DELETED_IDS_KEY = 'eleven_star_club_global_deleted_ids_v1';

export function getDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem(GLOBAL_DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addDeletedId(id: string | number): void {
  try {
    const strId = String(id);
    const existing = getDeletedIds();
    if (!existing.includes(strId)) {
      const updated = [...existing, strId];
      localStorage.setItem(GLOBAL_DELETED_IDS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error saving deleted ID:', e);
  }
}

export function isDeleted(id: string | number): boolean {
  if (!id) return false;
  const deletedList = getDeletedIds();
  return deletedList.includes(String(id));
}

/**
 * Saves items reliably to both IndexedDB and LocalStorage.
 */
export async function savePersistentItems<T extends { id: string | number }>(key: string, items: T[]): Promise<void> {
  const deletedList = getDeletedIds();
  const filtered = items.filter((item) => item && !deletedList.includes(String(item.id)));

  // 1. Save to IndexedDB (unlimited quota)
  await idbSet(key, filtered);

  // 2. Save to LocalStorage (try-catch against QuotaExceededError)
  try {
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.warn(`LocalStorage quota reached for key ${key}, relying on IndexedDB persistence.`);
  }
}

/**
 * Loads items reliably from LocalStorage and IndexedDB, returning merged non-duplicate list.
 */
export async function loadPersistentItems<T extends { id: string | number }>(key: string): Promise<T[]> {
  const deletedList = getDeletedIds();
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
  const map = new Map<string | number, T>();
  for (const item of idbItems) {
    if (item && item.id !== undefined && item.id !== null && !deletedList.includes(String(item.id))) {
      map.set(item.id, item);
    }
  }
  for (const item of localItems) {
    if (item && item.id !== undefined && item.id !== null && !deletedList.includes(String(item.id)) && !map.has(item.id)) {
      map.set(item.id, item);
    }
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
 * Utility to merge items from Firestore snapshot with local items.
 * Guarantees that:
 * 1. Newly uploaded local unsynced items are preserved and synced.
 * 2. Items deleted from Firestore by an Admin on any device are automatically purged from local storage on all other devices!
 */
export function mergeItemsWithLocal<T extends { id: string | number; createdAt?: any }>(
  firestoreItems: T[],
  localItems: T[]
): T[] {
  const deletedList = getDeletedIds();
  const firestoreIds = new Set(firestoreItems.map((f) => String(f.id)));
  const map = new Map<string | number, T>();

  // 1. Process local items
  for (const item of localItems) {
    if (!item || item.id === undefined || item.id === null) continue;
    const strId = String(item.id);

    // If item was explicitly deleted, skip
    if (deletedList.includes(strId)) continue;

    // SAFE DELETION DETECTED: If item was previously synced to cloud, but is now missing from cloud snapshot,
    // it was deleted by an Admin on another device. Purge it locally!
    if ((item as any).synced === true && !firestoreIds.has(strId)) {
      addDeletedId(strId);
      continue;
    }

    map.set(item.id, item);
  }

  // 2. Process Firestore cloud items
  for (const item of firestoreItems) {
    if (!item || item.id === undefined || item.id === null) continue;
    const strId = String(item.id);

    // If item was explicitly deleted on this device, skip
    if (deletedList.includes(strId)) continue;

    // Mark as synced since it exists in Firestore
    const syncedItem = { ...item, synced: true };
    map.set(item.id, syncedItem);
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return merged;
}

/**
 * Uploads items to PostgreSQL Cloud SQL backend as a reliable fallback when Firebase is offline/blocked.
 */
export async function uploadToFallbackServer(category: string, title: string, description: string, item: any): Promise<any> {
  try {
    const res = await fetch('/api/dual-sync/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        category, // This goes to club_records.category
        description,
        metadata: item, // Store the full object in metadata
        entityType: category, // This goes to sync_logs.entity_type
        uploadedBy: item.authorName || item.uploadedBy || 'Admin/User',
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Fallback server upload failed for category ${category}:`, err);
  }
  return null;
}

/**
 * Fetches items from PostgreSQL Cloud SQL backend as a fallback when Firebase is down/empty.
 */
export async function fetchFromFallbackServer<T>(category: string): Promise<T[]> {
  try {
    const res = await fetch('/api/club-records');
    if (res.ok) {
      const records = await res.json();
      if (Array.isArray(records)) {
        const deletedList = getDeletedIds();
        // Filter records of this specific category AND exclude deleted items
        const filtered = records.filter((r: any) => {
          if (r.category !== category) return false;
          const itemId = String(r.metadata?.id || r.id);
          return !deletedList.includes(itemId);
        });

        // Map metadata or format back to T
        return filtered.map((r: any) => {
          if (r.metadata) {
            return {
              ...r.metadata,
              id: r.metadata.id || String(r.id), // Ensure it has a stable id
              sqlId: r.id, // Store postgres ID
            };
          }
          return {
            id: String(r.id),
            title: r.title,
            description: r.description,
            isCustom: true,
            createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
          } as unknown as T;
        });
      }
    }
  } catch (err) {
    console.warn(`Fallback server fetch failed for category ${category}:`, err);
  }
  return [];
}

