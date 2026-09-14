import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Music,
  Video,
  Play,
  Volume2,
  BellRing,
  BookOpen,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
  Sparkles,
  Radio,
  RefreshCw
} from 'lucide-react';
import { PrayerItem } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AddPrayerItemModal } from '../components/AddPrayerItemModal';
import { NotificationSettingsModal } from '../components/NotificationSettingsModal';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { CustomPrayerCard } from '../components/CustomPrayerCard';
import { LivePrayerSettingsModal } from '../components/LivePrayerSettingsModal';
import { deleteVideoBlob, getVideoBlob } from '../utils/videoStorageHelper';
import { isDirectVideoUrl } from '../utils/mediaEmbedHelper';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, collection, addDoc, deleteDoc } from 'firebase/firestore';

const INITIAL_PRAYER_ITEMS: PrayerItem[] = [
  {
    id: 'prayer-aguner-paroshmoni',
    title: 'আগুনের পরশমণি ছোঁয়াও প্রাণে',
    bengaliTitle: 'প্রার্থনা',
    type: 'video',
    mediaSource: 'youtube',
    mediaUrl: 'https://youtu.be/wm1OtR2kEVc',
    embedUrl: 'https://www.youtube-nocookie.com/embed/wm1OtR2kEVc?enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    thumbnailUrl: 'https://img.youtube.com/vi/wm1OtR2kEVc/hqdefault.jpg',
    description: '11 স্টার ক্লাবের পবিত্র প্রার্থনা সঙ্গীত "আগুনের পরশমণি ছোঁয়াও প্রাণে"।',
    lyrics: `আগুনের পরশমণি ছোঁয়াও প্রাণে।
এ জীবন পুণ্য করো দহন-দানে॥
আমার এ অঙ্গখানি করো হে বীণা,
তোমার ওই পরশ দিয়ে তোলো সুধা॥
সকল গান মোর দিয়ে তোমারে ভরি,
মুছে যাক যত আঁধার, যত কলুষ হরি।
আগুনের পরশমণি ছোঁয়াও প্রাণে...`,
    authorName: '11 স্টার ক্লাব প্রার্থনা পরিষদ',
    scheduledTime: '',
    dateAdded: 'মূল প্রার্থনা'
  }
];

const LOCAL_STORAGE_KEY = '11starclub_prayer_items_v1';
const LIVE_CONFIG_KEY = '11starclub_live_prayer_config_v1';

const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((d) => bengaliDigits[parseInt(d, 10)] || d)
    .join('');
};

export const SundayPrayerPage: React.FC = () => {
  const [items, setItems] = useState<PrayerItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_PRAYER_ITEMS, ...parsed.filter((p: PrayerItem) => !INITIAL_PRAYER_ITEMS.some(i => i.id === p.id))];
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_PRAYER_ITEMS;
  });

  const [liveConfig, setLiveConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(LIVE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      isLiveActive: false,
      liveUrl: 'https://www.youtube-nocookie.com/embed/wm1OtR2kEVc?enablejsapi=1&autoplay=1',
      fallbackTitle: 'রবিবার বিশেষ প্রার্থনা ও কীর্তন (রেকর্ডড / গ্যালারি)',
      fallbackUrl: 'https://www.youtube-nocookie.com/embed/wm1OtR2kEVc?enablejsapi=1&rel=0',
      blobId: '',
      isLocalBlob: false
    };
  });

  const [resolvedFallbackBlobUrl, setResolvedFallbackBlobUrl] = useState<string | null>(null);

  // Sync Live Config with Firestore in Real-Time
  useEffect(() => {
    const configDocRef = doc(db, 'appSettings', 'prayerLiveConfig');
    const unsub = onSnapshot(configDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setLiveConfig(prev => ({
          ...prev,
          ...data
        }));
        try {
          localStorage.setItem(LIVE_CONFIG_KEY, JSON.stringify(data));
        } catch (e) {}
      }
    }, (err) => {
      console.warn('Live config Firestore listener bypassed:', err);
    });

    return () => unsub();
  }, []);

  // Sync Custom Prayer Items with Firestore in Real-Time
  useEffect(() => {
    const itemsColRef = collection(db, 'prayerItems');
    const unsub = onSnapshot(itemsColRef, (snap) => {
      const firestoreItems: PrayerItem[] = [];
      snap.forEach((d) => {
        firestoreItems.push({ ...(d.data() as PrayerItem), id: d.id });
      });

      firestoreItems.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems([...INITIAL_PRAYER_ITEMS, ...firestoreItems.filter(p => !INITIAL_PRAYER_ITEMS.some(i => i.id === p.id))]);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firestoreItems));
      } catch (e) {}
    }, (err) => {
      console.warn('Prayer items Firestore listener notice:', err);
    });

    return () => unsub();
  }, []);

  // Resolve Local IndexedDB video blob for fallback player if configured
  useEffect(() => {
    let active = true;
    let objUrl: string | null = null;

    async function loadFallbackVideo() {
      if (liveConfig.blobId || liveConfig.isLocalBlob) {
        const blobKey = liveConfig.blobId || 'prayer-live-fallback-permanent';
        try {
          const blobData: any = await getVideoBlob(blobKey);
          if (blobData && typeof blobData === 'object') {
            objUrl = URL.createObjectURL(blobData);
            setResolvedFallbackBlobUrl(objUrl);
            return;
          } else if (typeof blobData === 'string' && active) {
            setResolvedFallbackBlobUrl(blobData);
            return;
          }
        } catch (err) {
          console.warn('Error loading fallback blob:', err);
        }
      }
      if (active) {
        setResolvedFallbackBlobUrl(null);
      }
    }

    loadFallbackVideo();

    return () => {
      active = false;
      if (objUrl) {
        URL.revokeObjectURL(objUrl);
      }
    };
  }, [liveConfig.blobId, liveConfig.isLocalBlob]);

  const corePrayer = INITIAL_PRAYER_ITEMS[0];
  const [showCoreLyrics, setShowCoreLyrics] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isLiveSettingsOpen, setIsLiveSettingsOpen] = useState(false);

  // Security gate states: password requested on every admin action
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isNotifAuthModalOpen, setIsNotifAuthModalOpen] = useState(false);
  const [isLiveAuthOpen, setIsLiveAuthOpen] = useState(false);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

  const { isAdminLoggedIn } = useAdminAuth();

  const handleAddPrayerItem = async (newItem: PrayerItem) => {
    const itemWithTime: PrayerItem = {
      ...newItem,
      createdAt: Date.now()
    } as any;
    const updated = [...items, itemWithTime];
    setItems(updated);
    try {
      const customItems = updated.filter((i) => i.isCustom);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customItems));
    } catch (e) {
      console.warn(e);
    }
    try {
      await setDoc(doc(db, 'prayerItems', itemWithTime.id), itemWithTime);
    } catch (e) {
      console.warn('Failed to add prayer item to Firestore:', e);
    }
  };

  const handleSaveLiveConfig = async (newCfg: typeof liveConfig) => {
    setLiveConfig(newCfg);
    try {
      localStorage.setItem(LIVE_CONFIG_KEY, JSON.stringify(newCfg));
    } catch (e) {}
    try {
      await setDoc(doc(db, 'appSettings', 'prayerLiveConfig'), newCfg, { merge: true });
    } catch (e) {
      console.warn('Failed to save live config to Firestore:', e);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (itemToDeleteId) {
      const updated = items.filter((i) => i.id !== itemToDeleteId);
      setItems(updated);
      try {
        await deleteVideoBlob(itemToDeleteId);
      } catch (e) {
        console.warn('Error deleting video blob:', e);
      }
      try {
        const customItems = updated.filter((i) => i.isCustom);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customItems));
      } catch (err) {
        console.warn(err);
      }
      try {
        await deleteDoc(doc(db, 'prayerItems', itemToDeleteId));
      } catch (err) {
        console.warn('Failed to delete prayer from Firestore:', err);
      }
    }
    setIsDeleteAuthOpen(false);
    setItemToDeleteId(null);
  };

  const customItems = items.filter((i) => i.isCustom);

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Devotional Hero Header - Strictly "প্রার্থনা" */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-b from-[#1c1208] via-[#120b05] to-[#0a0603] border border-amber-500/30 p-6 sm:p-8 text-center space-y-4 shadow-[0_0_35px_rgba(245,158,11,0.15)] relative overflow-hidden"
      >
        <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
          {/* Top Badge: strictly "প্রার্থনা" */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold shadow">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>প্রার্থনা</span>
            </div>
          </div>

          {/* Title: strictly "প্রার্থনা" */}
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
            প্রার্থনা
          </h1>

          <p className="text-xs sm:text-sm text-amber-100/85 leading-relaxed">
            আগুনের পরশমণি ছোঁয়াও প্রাণে — 11 স্টার ক্লাবের সমবেত ও পবিত্র প্রার্থনা। অন্তরের সকল মলিনতা দূর করে পুণ্যের আলোয় জীবনকে উদ্ভাসিত করার নিবেদন।
          </p>

          {/* Admin Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              id="prayer-alert-trigger-btn"
              onClick={() => setIsNotifAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400 text-amber-200 text-xs font-bold transition-all shadow active:scale-95"
            >
              <BellRing className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>প্রার্থনার অ্যালার্ট সেট করুন (অ্যাডমিন)</span>
            </button>

            <button
              id="live-settings-trigger-btn"
              onClick={() => setIsLiveAuthOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/40 border border-red-500 text-red-200 text-xs font-bold transition-all shadow active:scale-95"
            >
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>⚙️ লাইভ ও গ্যালারি ব্যাকআপ সেটিংস</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ================= Live Prayer / Gallery Fallback Stream Section ================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#180d07] via-[#100704] to-[#0a0402] border-2 border-red-500/40 p-5 sm:p-8 shadow-[0_0_40px_rgba(239,68,68,0.2)] space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 animate-pulse">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold font-serif-bengali text-white">
                  {liveConfig.isLiveActive ? '🔴 লাইভ প্রার্থনা সম্প্রচার (Live Prayer)' : '🎥 প্রার্থনা ভিডিও — গ্যালারি ও রেকর্ডড প্লেয়ার'}
                </h2>
                {liveConfig.isLiveActive && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold animate-ping-slow">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {liveConfig.isLiveActive
                  ? 'বর্তমানে প্রার্থনা কক্ষ থেকে সরাসরি লাইভ সম্প্রচার চলছে।'
                  : 'আজ লাইভ সম্প্রচার না থাকায় রেকর্ডড বা গ্যালারি থেকে আপলোড করা প্রার্থনা ভিডিও প্রদর্শিত হচ্ছে।'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLiveAuthOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>লাইভ / গ্যালারি পরিবর্তন</span>
          </button>
        </div>

        {/* Live or Fallback Player */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-red-500/30 bg-black shadow-2xl relative">
          {liveConfig.isLiveActive ? (
            <iframe
              src={liveConfig.liveUrl}
              title="Live Prayer Broadcast"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : resolvedFallbackBlobUrl ? (
            <video
              controls
              playsInline
              src={resolvedFallbackBlobUrl}
              className="w-full h-full object-contain bg-black"
            />
          ) : isDirectVideoUrl(liveConfig.fallbackUrl) ? (
            <video
              controls
              playsInline
              src={liveConfig.fallbackUrl}
              className="w-full h-full object-contain bg-black"
            />
          ) : liveConfig.fallbackUrl ? (
            <iframe
              src={liveConfig.fallbackUrl}
              title={liveConfig.fallbackTitle || 'Prayer Video'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-950 text-amber-100/90 space-y-3">
              <Flame className="w-12 h-12 text-amber-400 animate-pulse" />
              <h3 className="text-xl font-bold font-serif-bengali text-amber-200">
                {liveConfig.fallbackTitle || 'রবিবার বিশেষ প্রার্থনা'}
              </h3>
              <p className="text-xs text-stone-300 max-w-md">
                লাইভ বা গ্যালারি ভিডিও চালু করতে উপরের বাটনে ক্লিক করুন অথবা ডিফল্ট প্রার্থনা ভিডিও উপভোগ করুন।
              </p>
              <button
                onClick={() => handleSaveLiveConfig({
                  ...liveConfig,
                  fallbackUrl: 'https://www.youtube-nocookie.com/embed/wm1OtR2kEVc?enablejsapi=1&rel=0'
                })}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-transform active:scale-95 shadow cursor-pointer"
              >
                মূল প্রার্থনা ভিডিও চালু করুন
              </button>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-black/60 border border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-stone-300">
            <span className="font-bold text-amber-200 font-serif-bengali block">
              {liveConfig.isLiveActive ? 'সরাসরি লাইভ সম্প্রচার চলছে' : `রেকর্ডড প্রার্থনা: ${liveConfig.fallbackTitle}`}
            </span>
            <span>যবে যবে প্রার্থনা হবে এখানে সরাসরি লাইভ অথবা গ্যালারি ভিডিও দেখতে পাবেন।</span>
          </div>
          <button
            onClick={() => setIsLiveAuthOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow shrink-0 active:scale-95"
          >
            লাইভ অন/অফ করুন
          </button>
        </div>
      </section>

      {/* Core Devotional Player & Lyrics (Permanent Top Section) */}
      <section className="rounded-3xl bg-[#110b06] border border-amber-500/35 p-5 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Flame className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-2xl font-bold font-serif-bengali text-white">
                {corePrayer.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCoreLyrics(!showCoreLyrics)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                showCoreLyrics
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showCoreLyrics ? 'লিরিক্স লুকান' : 'লিরিক্স দেখুন'}</span>
            </button>

            {/* Admin Add Prayer Button (always prompts for password) */}
            <button
              id="add-prayer-item-btn"
              onClick={() => setIsAdminAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রার্থনা যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black shadow-lg relative">
          <iframe
            src={corePrayer.embedUrl}
            title={corePrayer.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Lyrics & Prayer Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className={`${showCoreLyrics ? 'md:col-span-7' : 'md:col-span-12'} space-y-3`}>
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/25 space-y-2">
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-bold">
                <Volume2 className="w-4 h-4 text-amber-400" />
                প্রার্থনা
              </span>
              <h3 className="text-lg font-bold font-serif-bengali text-white">
                {corePrayer.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {corePrayer.description}
              </p>
            </div>
          </div>

          {showCoreLyrics && corePrayer.lyrics && (
            <div className="md:col-span-5 p-5 rounded-2xl bg-[#160e08] border border-amber-500/25 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-serif-bengali">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  প্রার্থনার বাণী / লিরিক্স
                </span>
              </div>
              <div className="text-xs sm:text-sm font-serif-bengali leading-relaxed text-amber-100/90 whitespace-pre-line">
                {corePrayer.lyrics}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Admin Added Custom Prayers Section */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>অ্যাডমিন কর্তৃক যুক্ত প্রার্থনা সমূহ</span>
              {customItems.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  {toBengaliNumber(customItems.length)} টি প্রার্থনা
                </span>
              )}
            </h3>
            <p className="text-xs text-amber-100/75 mt-1">
              {customItems.length > 0
                ? 'অ্যাডমিন কর্তৃক যুক্ত প্রতিটি প্রার্থনার সম্পূর্ণ ভিডিও/অডিও প্লেয়ার, বিস্তারিত বিবরণ ও বাণী নিচে প্রদর্শিত হলো:'
                : 'ক্লাবের পূজার্চনা ও বিশেষ প্রার্থনার জন্য অতিরিক্ত কোনো ভিডিও বা অডিও প্রার্থনা এখানে সম্পূর্ণ প্লেয়ারসহ প্রদর্শিত হবে।'}
            </p>
          </div>

          <button
            id="add-custom-prayer-btn"
            onClick={() => setIsAdminAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন প্রার্থনা যোগ করুন</span>
          </button>
        </div>

        {customItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-black/40 border border-amber-500/20 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-amber-200 font-serif-bengali">
              অ্যাডমিন কর্তৃক অতিরিক্ত কোনো প্রার্থনা এখনো যুক্ত করা হয়নি
            </h4>
            <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
              উপরের &quot;নতুন প্রার্থনা যোগ করুন&quot; বোতামে ক্লিক করে অ্যাডমিন পাসওয়ার্ড প্রদানপূর্বক নতুন ভিডিও বা অডিও প্রার্থনা যুক্ত করতে পারেন। যুক্ত করার পর প্রতিটি প্রার্থনার সম্পূর্ণ প্লেয়ার, লিরিক্স ও বিবরণ নিচে সরাসরি দৃশ্যমান হবে।
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {customItems.map((item, idx) => (
              <CustomPrayerCard
                key={item.id}
                item={item}
                index={idx + 1}
                onDeleteRequest={(id) => {
                  setItemToDeleteId(id);
                  setIsDeleteAuthOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Admin Add Prayer Modal */}
      <AddPrayerItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPrayerItem={handleAddPrayerItem}
      />

      {/* Admin Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Live Prayer & Gallery Backup Settings Modal */}
      <LivePrayerSettingsModal
        isOpen={isLiveSettingsOpen}
        onClose={() => setIsLiveSettingsOpen(false)}
        currentConfig={liveConfig}
        onSaveConfig={handleSaveLiveConfig}
      />

      {/* Gate 1: Password Prompt for Adding Prayer (Requested Every Time) */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthModalOpen(false);
          setIsAddModalOpen(true);
        }}
        actionTitle="নতুন প্রার্থনা যোগ করুন"
        description="ক্লাবের প্রার্থনায় নতুন ভিডিও বা অডিও যোগ করতে অ্যাডমিন পাসওয়ার্ড দিন। প্রতিটি সংযোজনের জন্য পাসওয়ার্ড যাচাই বাধ্যতামূলক।"
        submitButtonText="পাসওয়ার্ড যাচাই করে প্রার্থনা যোগ করুন"
      />

      {/* Gate 2: Password Prompt for Setting Prayer Alert (Requested Every Time) */}
      <AdminPhotoAuthModal
        isOpen={isNotifAuthModalOpen}
        onClose={() => setIsNotifAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsNotifAuthModalOpen(false);
          setIsNotifModalOpen(true);
        }}
        actionTitle="প্রার্থনার অ্যালার্ট সেট করুন"
        description="সকল সদস্য ও দর্শকদের কাছে প্রার্থনার বিজ্ঞপ্তি নোটিফিকেশন পাঠাতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে অ্যালার্ট প্যানেল খুলুন"
      />

      {/* Gate for Live & Gallery Backup Settings */}
      <AdminPhotoAuthModal
        isOpen={isLiveAuthOpen}
        onClose={() => setIsLiveAuthOpen(false)}
        onAuthenticated={() => {
          setIsLiveAuthOpen(false);
          setIsLiveSettingsOpen(true);
        }}
        actionTitle="লাইভ ও গ্যালারি ব্যাকআপ সেটিংস"
        description="প্রার্থনার লাইভ সম্প্রচার চালু/বন্ধ করতে অথবা গ্যালারি ভিডিও ব্যাকআপ কনফিগার করতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে লাইভ সেটিংস খুলুন"
      />

      {/* Gate 3: Password Prompt for Deleting Prayer Item (Requested Every Time) */}
      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setItemToDeleteId(null);
        }}
        onAuthenticated={handleConfirmDeleteItem}
        actionTitle="প্রার্থনা আইটেম মুছে ফেলুন"
        description="যুক্ত করা এই প্রার্থনা আইটেমটি নিশ্চিতভাবে মুছে ফেলতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নিশ্চিত মুছুন"
        isDangerousAction={true}
      />
    </div>
  );
};
