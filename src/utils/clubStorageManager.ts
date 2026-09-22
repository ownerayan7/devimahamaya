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

export const getStoredClubItems = async (): Promise<ClubStoredItem[]> => {
  const items = await loadPersistentItems<ClubStoredItem>(STORAGE_KEY);
  if (items.length === 0) {
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
      },
      {
        id: 'store-2',
        title: 'মহালয়া বিশেষ চণ্ডীপাঠ ও গান',
        type: 'audio',
        source: 'online',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        authorName: 'বীরেন্দ্রকৃষ্ণ ভদ্র',
        description: 'মহিষাসুরমর্দিনী অডিও সম্প্রচার।',
        category: 'mahalaya',
        createdAt: Date.now() - 43200000,
        dateAdded: '27 আগস্ট ২০২৬'
      }
    ];
    await savePersistentItems(STORAGE_KEY, defaultItems);
    return defaultItems;
  }
  return items;
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
  const localItems = await getStoredClubItems();
  try {
    if (!db) return localItems;
    const q = query(collection(db, 'clubDataStorage'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const cloudItems: ClubStoredItem[] = [];
    snapshot.forEach((docSnap) => {
      cloudItems.push(docSnap.data() as ClubStoredItem);
    });

    const merged = mergeItemsWithLocal(cloudItems, localItems);
    await savePersistentItems(STORAGE_KEY, merged);
    return merged;
  } catch (e) {
    console.warn('Could not fetch from cloud, using local storage:', e);
  }
  return localItems;
};

export const subscribeCloudClubItems = (onItemsUpdated: (items: ClubStoredItem[]) => void): (() => void) => {
  if (!db) {
    fetchCloudClubItems().then(onItemsUpdated);
    return () => {};
  }

  const q = query(collection(db, 'clubDataStorage'), orderBy('createdAt', 'desc'));
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const cloudItems: ClubStoredItem[] = [];
    snapshot.forEach((docSnap) => {
      cloudItems.push(docSnap.data() as ClubStoredItem);
    });

    const localItems = await getStoredClubItems();
    const merged = mergeItemsWithLocal(cloudItems, localItems);
    await savePersistentItems(STORAGE_KEY, merged);
    onItemsUpdated(merged);
  }, (err) => {
    console.warn('Firestore clubDataStorage subscription warning:', err);
    fetchCloudClubItems().then(onItemsUpdated);
  });

  return unsubscribe;
};

export const deleteClubStoredItem = async (id: string): Promise<void> => {
  const existing = await getStoredClubItems();
  const updated = existing.filter(item => item.id !== id);
  await savePersistentItems(STORAGE_KEY, updated);
  window.dispatchEvent(new Event('club_storage_updated'));

  try {
    if (db) {
      await deleteDoc(doc(db, 'clubDataStorage', id));
    }
  } catch (e) {
    console.warn('Firestore delete warning:', e);
  }
};
