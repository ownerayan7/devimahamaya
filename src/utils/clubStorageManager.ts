import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, setDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { savePersistentItems, loadPersistentItems, mergeItemsWithLocal } from './persistentStorage';

export interface ClubStoredItem {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'audio' | 'document' | 'other';
  source: 'gallery' | 'online' | 'device' | 'drive';
  url: string;
  thumbnailUrl?: string;
  authorName?: string;
  description?: string;
  category?: string;
  createdAt: number;
  dateAdded: string;
}

const STORAGE_KEY = 'eleven_star_club_permanent_storage_v2';
const DELETED_STORAGE_IDS_KEY = 'eleven_star_club_deleted_storage_ids_v1';

export const getDeletedStorageIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addDeletedStorageId = (id: string): void => {
  try {
    const existing = getDeletedStorageIds();
    if (!existing.includes(id)) {
      const updated = [...existing, id];
      localStorage.setItem(DELETED_STORAGE_IDS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error saving deleted ID:', e);
  }
};

export const getStoredClubItems = async (): Promise<ClubStoredItem[]> => {
  const deletedIds = getDeletedStorageIds();
  const items = await loadPersistentItems<ClubStoredItem>(STORAGE_KEY);
  
  // Filter out any previously deleted items
  const filtered = items.filter(item => !deletedIds.includes(item.id) && item.id !== 'store-2');

  if (filtered.length === 0 && items.length === 0 && !deletedIds.includes('store-1')) {
    const defaultItems: ClubStoredItem[] = [
      {
        id: 'store-1',
        title: 'দুর্গাপূজা ২০২৬ মণ্ডপ প্রাঙ্গণ',
        type: 'photo',
        source: 'gallery',
        url: 'https://images.unsplash.com/photo-1603228254117-e9a7e1e5e466?auto=format&fit=crop&q=80&w=1000',
        authorName: 'ক্লাব কমিটি',
        description: 'অফিসিয়াল মণ্ডপ সজ্জা ও আলোকসজ্জা ছবি।',
        category: 'puja',
        createdAt: Date.now() - 86400000,
        dateAdded: '27 আগস্ট ২০২৬'
      }
    ];
    await savePersistentItems(STORAGE_KEY, defaultItems);
    return defaultItems;
  }
  
  if (filtered.length !== items.length) {
    await savePersistentItems(STORAGE_KEY, filtered);
  }
  
  return filtered;
};

export const saveClubStoredItem = async (item: Omit<ClubStoredItem, 'id' | 'createdAt' | 'dateAdded'>): Promise<ClubStoredItem> => {
  const newItem: ClubStoredItem = {
    ...item,
    id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    createdAt: Date.now(),
    dateAdded: new Date().toLocaleDateString('bn-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  };

  // 1. Save to IndexedDB & LocalStorage
  const existing = await getStoredClubItems();
  const updated = [newItem, ...existing];
  await savePersistentItems(STORAGE_KEY, updated);
  window.dispatchEvent(new Event('club_storage_updated'));

  // 2. Save to Firestore for permanent cloud persistence across devices and sessions
  try {
    if (db) {
      await setDoc(doc(db, 'clubDataStorage', newItem.id), newItem);
    }
  } catch (e) {
    console.warn('Firestore cloud sync warning (falling back to local):', e);
  }

  return newItem;
};

export const fetchCloudClubItems = async (): Promise<ClubStoredItem[]> => {
  const deletedIds = getDeletedStorageIds();
  const localItems = await getStoredClubItems();
  try {
    if (!db) return localItems;
    const q = query(collection(db, 'clubDataStorage'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const cloudItems: ClubStoredItem[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data() as ClubStoredItem;
      if (d && !deletedIds.includes(d.id) && d.id !== 'store-2') {
        cloudItems.push(d);
      }
    });

    const filteredLocal = localItems.filter(i => !deletedIds.includes(i.id) && i.id !== 'store-2');
    const merged = mergeItemsWithLocal(cloudItems, filteredLocal);
    await savePersistentItems(STORAGE_KEY, merged);
    return merged;
  } catch (e) {
    console.warn('Could not fetch from cloud, using local storage:', e);
  }
  return localItems.filter(i => !deletedIds.includes(i.id) && i.id !== 'store-2');
};

export const subscribeCloudClubItems = (onItemsUpdated: (items: ClubStoredItem[]) => void): (() => void) => {
  if (!db) {
    fetchCloudClubItems().then(onItemsUpdated);
    return () => {};
  }

  const q = query(collection(db, 'clubDataStorage'), orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const deletedIds = getDeletedStorageIds();
    const cloudItems: ClubStoredItem[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data() as ClubStoredItem;
      if (d && !deletedIds.includes(d.id) && d.id !== 'store-2') {
        cloudItems.push(d);
      }
    });

    const localItems = await getStoredClubItems();
    const filteredLocal = localItems.filter(i => !deletedIds.includes(i.id) && i.id !== 'store-2');
    const merged = mergeItemsWithLocal(cloudItems, filteredLocal);
    await savePersistentItems(STORAGE_KEY, merged);
    onItemsUpdated(merged);
  }, (err) => {
    console.warn('Firestore clubDataStorage subscription warning:', err);
    fetchCloudClubItems().then(onItemsUpdated);
  });

  return unsubscribe;
};

export const deleteClubStoredItem = async (id: string): Promise<void> => {
  // 1. Mark ID permanently as deleted so it can never be resurrected by sync
  addDeletedStorageId(id);
  if (id === 'store-2') {
    addDeletedStorageId('মহালয়া বিশেষ চণ্ডীপাঠ ও গান');
  }

  // 2. Remove from local persistent storage
  const existing = await getStoredClubItems();
  const updated = existing.filter(item => item.id !== id && (id !== 'store-2' || item.title !== 'মহালয়া বিশেষ চণ্ডীপাঠ ও গান'));
  await savePersistentItems(STORAGE_KEY, updated);
  window.dispatchEvent(new Event('club_storage_updated'));

  // 3. Remove from Firestore
  try {
    if (db) {
      await deleteDoc(doc(db, 'clubDataStorage', id));
    }
  } catch (e) {
    console.warn('Firestore delete warning:', e);
  }
};
