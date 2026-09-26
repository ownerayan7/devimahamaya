import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Youtube,
  Facebook,
  Globe,
  Sparkles,
  Maximize2,
  X,
  Play,
  Layers,
  ShieldCheck,
  Check,
  Tv,
  Compass
} from 'lucide-react';
import { GyanSaradaChannel, PageId } from '../types';
import { GYAN_SARADA_CATEGORIES, INITIAL_GYAN_SARADA_CHANNELS } from '../data/gyanSaradaData';
import { getUniversalEmbedUrl } from '../utils/universalEmbedHelper';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AddGyanSaradaModal } from '../components/AddGyanSaradaModal';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { loadPersistentItems, savePersistentItems, mergeItemsWithLocal } from '../utils/persistentStorage';

const LOCAL_STORAGE_KEY = '11starclub_gyan_sarada_v1';
const DELETED_IDS_KEY = '11starclub_gyan_deleted_ids_v1';

const getDeletedIds = (): string[] => {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return [];
};

interface GyanSaradaPageProps {
  onNavigate?: (page: PageId) => void;
}

export const GyanSaradaPage: React.FC<GyanSaradaPageProps> = ({ onNavigate }) => {
  // Channels state
  const [channels, setChannels] = useState<GyanSaradaChannel[]>(() => {
    const deleted = getDeletedIds();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((c: GyanSaradaChannel) => !deleted.includes(c.id));
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_GYAN_SARADA_CHANNELS.filter((c) => !deleted.includes(c.id));
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'youtube' | 'facebook' | 'web'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Tab Embed View
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);
  const [channelToDeleteId, setChannelToDeleteId] = useState<string | null>(null);

  // In-app embedded tab viewer
  const [embeddedChannel, setEmbeddedChannel] = useState<GyanSaradaChannel | null>(null);

  const { isAdminLoggedIn } = useAdminAuth();

  // Firestore Real-Time Sync & Local Storage Persistence
  useEffect(() => {
    const deleted = getDeletedIds();
    loadPersistentItems<GyanSaradaChannel>(LOCAL_STORAGE_KEY).then((saved) => {
      if (saved && saved.length > 0) {
        setChannels(saved.filter((c) => !deleted.includes(c.id)));
      }
    });

    try {
      const unsub = onSnapshot(
        collection(db, 'gyanSaradaChannels'),
        (snapshot) => {
          const firestoreItems: GyanSaradaChannel[] = [];
          snapshot.forEach((docSnap) => {
            firestoreItems.push({
              ...(docSnap.data() as GyanSaradaChannel),
              id: docSnap.id,
            });
          });

          loadPersistentItems<GyanSaradaChannel>(LOCAL_STORAGE_KEY).then((local) => {
            const baseItems = local && local.length > 0 ? local : INITIAL_GYAN_SARADA_CHANNELS;
            const merged = mergeItemsWithLocal<GyanSaradaChannel>(firestoreItems, baseItems);
            merged.sort((a: any, b: any) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

            const currentDeleted = getDeletedIds();
            const cleanList = merged.filter((c) => !currentDeleted.includes(String(c.id)));

            setChannels(cleanList);
            savePersistentItems(LOCAL_STORAGE_KEY, cleanList);
          });
        },
        (err) => {
          console.warn('Firestore gyanSaradaChannels notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Filter channels logic
  const filteredChannels = channels.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category === activeCategory ||
      (activeCategory === 'custom' && item.category === 'custom');

    const matchesPlatform =
      activePlatformFilter === 'all' || item.platform === activePlatformFilter;

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryBengali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesPlatform && matchesSearch;
  });

  // Handle Add Channel
  const handleAddChannel = async (channelData: Omit<GyanSaradaChannel, 'id' | 'createdAt'>) => {
    const newId = `gyan-${Date.now()}`;
    const newChannel: GyanSaradaChannel = {
      ...channelData,
      id: newId,
      createdAt: Date.now(),
    };

    const updated = [newChannel, ...channels];
    setChannels(updated);
    savePersistentItems(LOCAL_STORAGE_KEY, updated);

    try {
      await setDoc(doc(db, 'gyanSaradaChannels', newId), newChannel);
    } catch (err) {
      console.warn('Firestore add channel error:', err);
    }
  };

  // Handle Delete Channel Request
  const handleDeleteClick = (id: string) => {
    setChannelToDeleteId(id);
    if (!isAdminLoggedIn) {
      setIsDeleteAuthOpen(true);
    } else {
      confirmDeleteChannel(id);
    }
  };

  const confirmDeleteChannel = async (id: string) => {
    // 1. Record ID in deleted IDs array
    const currentDeleted = getDeletedIds();
    if (!currentDeleted.includes(id)) {
      currentDeleted.push(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(currentDeleted));
    }

    // 2. Immediately update state
    const updated = channels.filter((c) => c.id !== id);
    setChannels(updated);
    savePersistentItems(LOCAL_STORAGE_KEY, updated);

    // 3. Delete document from Firestore
    try {
      await deleteDoc(doc(db, 'gyanSaradaChannels', id));
    } catch (err) {
      console.warn('Firestore delete channel notice:', err);
    }
    setChannelToDeleteId(null);
  };

  // Helper for category badge styling
  const getCategoryMeta = (catId: string) => {
    return (
      GYAN_SARADA_CATEGORIES.find((c) => c.id === catId) || {
        icon: '📚',
        nameBengali: catId,
        color: 'from-amber-500 to-orange-500',
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-28">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#130d24] via-[#0e172a] to-[#0a231d] border border-amber-500/30 p-5 sm:p-8 mb-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        {/* Divine Glow Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center">
                <div className="w-full h-full bg-[#0d091a] rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <GraduationCap className="w-9 h-9 text-amber-300 animate-pulse" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-200 via-white to-yellow-300 bg-clip-text text-transparent">
                  জ্ঞান সারদা (Gyan Sarada)
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  শিক্ষামূলক চ্যানেল পোর্টাল
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 max-w-2xl leading-relaxed">
                পদার্থবিজ্ঞান, রসায়ন, গণিত, অঙ্কন, সঙ্গীত, ম্যাজিক ও বিভিন্ন বিষয়ের সেরা ইউটিউব ও ফেসবুক চ্যানেলের সমন্বিত নির্দেশিকা।
              </p>
            </div>
          </div>

          {/* Admin Action Buttons & Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {isAdminLoggedIn && (
              <span className="px-3 py-1 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>এডমিন মোড সক্রিয়</span>
              </span>
            )}
            <button
              onClick={() => {
                if (!isAdminLoggedIn) {
                  setIsAdminAuthModalOpen(true);
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-stone-950 stroke-[3]" />
              <span>➕ নতুন চ্যানেল যোগ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-amber-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>বিষয়ভিত্তিক ক্যাটাগরি বেছে নিন</span>
          </h2>
          <span className="text-xs text-stone-400">
            মোট চ্যানেল: {filteredChannels.length} টি
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GYAN_SARADA_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 text-stone-300 border-stone-800 hover:border-amber-500/50 hover:text-stone-100'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.nameBengali}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Platform Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-stone-900/90 border border-stone-800/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="চ্যানেলের নাম বা বিষয় অনুসন্ধান..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-xs text-stone-100 placeholder-stone-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Platform Filter Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-stone-400 shrink-0 hidden sm:inline">প্ল্যাটফর্ম:</span>
          <button
            onClick={() => setActivePlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activePlatformFilter === 'all'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            সব
          </button>
          <button
            onClick={() => setActivePlatformFilter('youtube')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              activePlatformFilter === 'youtube'
                ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>ইউটিউব</span>
          </button>
          <button
            onClick={() => setActivePlatformFilter('facebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              activePlatformFilter === 'facebook'
                ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Facebook className="w-3.5 h-3.5 text-blue-500" />
            <span>ফেসবুক</span>
          </button>
          <button
            onClick={() => setActivePlatformFilter('web')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
              activePlatformFilter === 'web'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>ওয়েবসাইট</span>
          </button>
        </div>
      </div>

      {/* Embedded In-App Tab Preview Drawer / Modal */}
      <AnimatePresence>
        {embeddedChannel && (() => {
          const effectiveEmbedUrl = embeddedChannel.embedUrl || getUniversalEmbedUrl(embeddedChannel.channelUrl, embeddedChannel.platform);
          return (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 sm:p-6 rounded-3xl bg-stone-900 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Tv className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-amber-300">
                      {embeddedChannel.title}
                    </h3>
                    <p className="text-xs text-stone-400 flex items-center gap-2">
                      <span>{embeddedChannel.categoryBengali}</span>
                      <span>•</span>
                      <span className="capitalize text-amber-400">
                        {embeddedChannel.platform === 'youtube'
                          ? 'ইন-অ্যাপ ইউটিউব চ্যানেল প্লেয়ার'
                          : embeddedChannel.platform === 'facebook'
                          ? 'ইন-অ্যাপ ফেসবুক পেজ/ভিডিও প্লেয়ার'
                          : 'ইন-অ্যাপ ইনটিগ্রেটেড ওয়েব ব্রাউজার'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEmbeddedChannel(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>বন্ধ করুন</span>
                  </button>
                </div>
              </div>

              {/* Embed Container or Full In-App Webview */}
              <div className="h-[70vh] sm:h-[75vh] w-full rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-inner relative">
                {effectiveEmbedUrl ? (
                  <iframe
                    src={effectiveEmbedUrl}
                    title={embeddedChannel.title}
                    className="w-full h-full border-0 bg-stone-950"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-950">
                    <Globe className="w-12 h-12 text-amber-400 mb-3 animate-pulse" />
                    <h4 className="text-base font-bold text-stone-200 mb-1">
                      {embeddedChannel.title}
                    </h4>
                    <p className="text-xs text-stone-400 max-w-md">
                      ইন-অ্যাপ ভিউ লোড হচ্ছে...
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Educational Channel Grid */}
      {filteredChannels.length === 0 ? (
        <div className="py-16 text-center bg-stone-900/50 rounded-3xl border border-stone-800">
          <Compass className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-300">কোনো চ্যানেল পাওয়া যায়নি</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            আপনার অনুসন্ধানের সাথে মিলে এমন কোনো চ্যানেল পাওয়া যায়নি। অনুগ্রহ করে অন্য বিষয় বা সার্চ টিপুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChannels.map((item) => {
            const catMeta = getCategoryMeta(item.category);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-stone-900/90 border border-stone-800/90 hover:border-amber-500/40 rounded-3xl p-5 flex flex-col justify-between shadow-xl transition-all group"
              >
                {/* Category & Platform Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-sm">
                    <span>{catMeta.icon}</span>
                    <span>{item.categoryBengali}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.platform === 'youtube' && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1">
                        <Youtube className="w-3.5 h-3.5 text-red-500" />
                        <span>ইউটিউব</span>
                      </span>
                    )}
                    {item.platform === 'facebook' && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1">
                        <Facebook className="w-3.5 h-3.5 text-blue-500" />
                        <span>ফেসবুক</span>
                      </span>
                    )}
                    {item.platform === 'web' && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>ওয়েব</span>
                      </span>
                    )}

                    {item.featured && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-stone-950 text-[10px] font-black flex items-center gap-0.5 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 fill-stone-950" />
                        <span>HOT</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Channel Header & Details */}
                <div className="flex-1 mb-5">
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      onClick={() => setEmbeddedChannel(item)}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform cursor-pointer"
                    >
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        onClick={() => setEmbeddedChannel(item)}
                        className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug cursor-pointer"
                      >
                        {item.title}
                      </h3>
                      {item.subscribersOrFollowers && (
                        <p className="text-[11px] font-semibold text-amber-400/90 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{item.subscribersOrFollowers}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 mt-2 line-clamp-3 leading-relaxed bg-stone-950/50 p-3 rounded-2xl border border-stone-800/50">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2.5">
                  <button
                    onClick={() => setEmbeddedChannel(item)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 text-xs font-bold flex items-center gap-2 transition-all flex-1 justify-center shadow-lg shadow-amber-500/10 active:scale-95"
                  >
                    <Tv className="w-4 h-4 text-stone-950" />
                    <span>চ্যানেলে প্রবেশ করুন (In-App)</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="px-3 py-2.5 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-400 border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                    title="এই চ্যানেলটি তালিকা থেকে মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ডিলিট</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Channel Modal */}
      <AddGyanSaradaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddChannel={handleAddChannel}
      />

      {/* Admin Photo Auth Modal for Adding */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthModalOpen(false);
          setIsAddModalOpen(true);
        }}
      />

      {/* Admin Photo Auth Modal for Deleting */}
      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setChannelToDeleteId(null);
        }}
        onAuthenticated={() => {
          setIsDeleteAuthOpen(false);
          if (channelToDeleteId) {
            confirmDeleteChannel(channelToDeleteId);
          }
        }}
        isDangerousAction={true}
      />
    </div>
  );
};
