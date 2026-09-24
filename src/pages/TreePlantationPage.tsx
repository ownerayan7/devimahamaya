import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trees,
  Leaf,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Download,
  Image as ImageIcon,
  FolderOpen,
  Plus,
  Trash2,
  Lock
} from 'lucide-react';
import { CLUB_INFO, TREE_PLANTATION_PHOTOS } from '../data/clubData';
import { TreePlantationPhotoItem } from '../types';
import { ImageLightbox } from '../components/ImageLightbox';
import { AddPhotoModal } from '../components/AddPhotoModal';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { loadPersistentItems, savePersistentItems, mergeItemsWithLocal } from '../utils/persistentStorage';
import { saveClubStoredItem } from '../utils/clubStorageManager';

const LOCAL_STORAGE_KEY = '11star_tree_plantation_custom_photos';

export const TreePlantationPage: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [photoToDeleteId, setPhotoToDeleteId] = useState<string | null>(null);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);
  const [customPhotos, setCustomPhotos] = useState<TreePlantationPhotoItem[]>([]);

  // Load custom photos on mount + Firestore real-time listener
  useEffect(() => {
    // 1. Initial persistent load
    loadPersistentItems<TreePlantationPhotoItem>(LOCAL_STORAGE_KEY).then((saved) => {
      if (saved && saved.length > 0) {
        setCustomPhotos(saved);
      }
    });

    // 2. Real-time Firestore sync with merge
    try {
      const unsub = onSnapshot(
        collection(db, 'treePlantationPhotos'),
        (snapshot) => {
          const cloudPhotos: TreePlantationPhotoItem[] = [];
          snapshot.forEach((d) => {
            cloudPhotos.push({ ...(d.data() as TreePlantationPhotoItem), id: d.id });
          });

          loadPersistentItems<TreePlantationPhotoItem>(LOCAL_STORAGE_KEY).then((local) => {
            const merged = mergeItemsWithLocal(cloudPhotos, local);
            setCustomPhotos(merged);
            savePersistentItems(LOCAL_STORAGE_KEY, merged);
          });
        },
        (err) => {
          console.warn('Firestore treePlantationPhotos snapshot notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore sync fallback:', e);
    }
  }, []);

  const saveCustomPhotos = async (items: TreePlantationPhotoItem[]) => {
    setCustomPhotos(items);
    await savePersistentItems(LOCAL_STORAGE_KEY, items);
  };

  const handleOpenOfficialAddPhoto = () => {
    // Always prompt for password every time
    setIsAdminAuthModalOpen(true);
  };

  const handleAddPhotos = async (newItems: any[]) => {
    const formatted: TreePlantationPhotoItem[] = newItems.map((item) => ({
      ...item,
      isCustom: true,
      year: item.year || '২০২৬',
      createdAt: Date.now()
    }));
    const current = await loadPersistentItems<TreePlantationPhotoItem>(LOCAL_STORAGE_KEY);
    const updated = [...formatted, ...current];
    await saveCustomPhotos(updated);

    // Save to Firestore & Central Club Data Storage
    for (const item of formatted) {
      try {
        await setDoc(doc(db, 'treePlantationPhotos', String(item.id)), item);
      } catch (err) {
        console.warn('Failed to save tree plantation photo to Firestore:', err);
      }

      // Also save to Permanent Club Data Storage & File Manager
      try {
        await saveClubStoredItem({
          title: item.title || 'বৃক্ষরোপণ কর্মসূচি ছবি',
          type: 'photo',
          source: item.url.startsWith('data:') ? 'device' : 'online',
          url: item.url,
          authorName: 'ক্লাব বৃক্ষরোপণ কর্মসূচি',
          description: item.subtitle || '11 স্টার ক্লাব বৃক্ষরোপণ অভিযান ও চারাগাছ বিতরণ কর্মসূচির সংরক্ষিত ছবি।',
          category: 'tree-plantation'
        });
      } catch (err) {
        console.warn('Failed to save tree photo to Club Storage:', err);
      }
    }
  };

  const handlePromptDeleteCustomPhoto = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPhotoToDeleteId(id);
    setIsDeleteAuthOpen(true);
  };

  const handleConfirmDeleteCustomPhoto = async () => {
    if (!photoToDeleteId) return;
    const idStr = String(photoToDeleteId);
    const updated = customPhotos.filter((p) => p.id !== photoToDeleteId);
    await saveCustomPhotos(updated);

    try {
      await deleteDoc(doc(db, 'treePlantationPhotos', idStr));
    } catch (err) {
      console.warn('Failed to delete tree photo from Firestore:', err);
    }
    setPhotoToDeleteId(null);
    setIsDeleteAuthOpen(false);
  };

  const allPhotos: TreePlantationPhotoItem[] = [...customPhotos, ...TREE_PLANTATION_PHOTOS];

  const filteredPhotos = activeCategory === 'all'
    ? allPhotos
    : allPhotos.filter((p) => p.category === activeCategory);

  const currentPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  const handleNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const categories = [
    { id: 'all', label: `সব ছবি (${allPhotos.length})` },
    { id: 'plantation', label: `🌳 বৃক্ষরোপণ অভিযান (${allPhotos.filter((p) => p.category === 'plantation').length})` },
    { id: 'distribution', label: `🌱 চারাগাছ বিতরণ (${allPhotos.filter((p) => p.category === 'distribution').length})` },
    { id: 'care', label: `🌿 সবুজায়ন ও পরিচর্যা (${allPhotos.filter((p) => p.category === 'care').length})` },
    { id: 'awareness', label: `📢 পরিবেশ সচেতনতা (${allPhotos.filter((p) => p.category === 'awareness').length})` },
  ];

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Trees className="w-4 h-4 text-emerald-400" />
          <span>সবুজায়ন ও পরিবেশ সচেতনতা</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          বৃক্ষরোপণ ও পরিবেশ রক্ষা কর্মসূচি
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          "একটি গাছ, একটি প্রাণ" — আগামী প্রজন্মের জন্য সুস্থ, দূষণমুক্ত ও শ্যামল সুন্দর পৃথিবী গড়ার লক্ষ্যে 11 স্টার ক্লাবের বছরব্যাপী সবুজায়ন ও পরিবেশ সংরক্ষণ উদ্যোগ।
        </p>

        {/* Action Button: Add Photos from Google Drive / Upload */}
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={handleOpenOfficialAddPhoto}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95"
            title="ক্লাব অ্যাডমিন পাসওয়ার্ড সুরক্ষিত"
          >
            <Lock className="w-4 h-4" />
            <span>নতুন ছবি যোগ করুন (অ্যাডমিন লক)</span>
          </button>
        </div>
      </motion.div>

      {/* Highlights Box */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.15)] space-y-6">
        <div className="space-y-3 border-b border-white/10 pb-6">
          <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span>আমাদের সবুজায়ন কার্যক্রমের মূল উদ্দেশ্য:</span>
          </h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            প্রতি বছর বর্ষাকালে ও বিশ্ব পরিবেশ দিবসে ক্লাবের সদস্যবৃন্দ এলাকার রাস্তাঘাট, শিক্ষা প্রতিষ্ঠান ও পতিত জমিতে বিভিন্ন ফলদ, বনজ ও ঔষধি চারা রোপণ করেন এবং সাধারণ মানুষের মধ্যে বিনামূল্যে বিতরণ করেন।
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: 'বিনামূল্যে চারা বিতরণ',
              desc: 'আম, জাম, কাঁঠাল, নিম, আমলকী ও কৃষ্ণচূড়ার চারা এলাকাবাসীর মধ্যে বিতরণ।',
            },
            {
              title: 'গাছের পরিচর্যা ও তদারকি',
              desc: 'কেবল রোপণ নয়, চারাগাছগুলি বড় না হওয়া পর্যন্ত নিয়মিত জল ও খাঁচার বেড়া দিয়ে সুরক্ষা।',
            },
            {
              title: 'প্লাস্টিক বর্জন সচেতনতা',
              desc: 'মণ্ডপ ও উৎসব প্রাঙ্গণে এককালীন প্লাস্টিক বর্জন ও পরিবেশবান্ধব সাজসজ্জা।',
            },
            {
              title: 'ছাত্র-যুবকদের অংশগ্রহণ',
              desc: 'বিদ্যালয়ের ছাত্র-ছাত্রীদের পরিবেশপ্রেমী করে তুলতে বিশেষ সচেতনতা কর্মসূচি।',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            আপনিও এই মহতী সবুজায়নে যুক্ত হতে ক্লাবের সাথে সরাসরি যোগাযোগ করতে পারেন।
          </span>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="space-y-6">
        {/* Gallery Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-white flex items-center gap-2.5">
              <ImageIcon className="w-6 h-6 text-emerald-400" />
              <span>বৃক্ষরোপণ ও পরিবেশ সুরক্ষা ফটো গ্যালারি</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              আমাদের সবুজায়ন ও পরিবেশ রক্ষা অভিযানের স্মরণীয় আলোকচিত্র সংকলন (মোট {allPhotos.length}টি ফটো)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ছবি যোগ করুন</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>প্রদর্শিত: {filteredPhotos.length}টি ছবি</span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setSelectedPhotoIndex(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeCategory === tab.id
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                  : 'bg-black/40 text-stone-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, idx) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedPhotoIndex(idx)}
                className="group cursor-pointer rounded-2xl overflow-hidden glass-card border border-emerald-500/25 hover:border-emerald-400/60 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all hover:-translate-y-1 relative"
              >
                {/* Photo Aspect Container */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-black/60 relative">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Category Tag & Custom Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-semibold text-emerald-300 border border-emerald-500/40 shadow-md">
                      {photo.tag}
                    </span>
                    {photo.isCustom && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold shadow-md">
                        ড্রাইভ থেকে যুক্ত
                      </span>
                    )}
                  </div>

                  {/* Delete button if custom (Admin only with password) */}
                  {photo.isCustom && (
                    <button
                      type="button"
                      title="এই অফিসিয়াল ছবিটি মুছে ফেলুন (অ্যাডমিন পাসওয়ার্ড আবশ্যক)"
                      onClick={(e) => handlePromptDeleteCustomPhoto(e, photo.id)}
                      className="absolute top-3 right-14 z-20 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white/80 hover:text-white transition-colors shadow-md border border-white/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Year Tag */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 backdrop-blur-md text-[10px] font-bold text-emerald-200 border border-emerald-500/30 shadow-md">
                      {photo.year}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-5">
                    <div className="space-y-1">
                      <h4 className="text-sm sm:text-base font-bold font-serif-bengali text-white line-clamp-2">
                        {photo.title}
                      </h4>
                      <p className="text-xs text-emerald-200/90 line-clamp-2">{photo.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-4 bg-gradient-to-b from-black/60 to-black/90 border-t border-emerald-500/20 space-y-1">
                  <h3 className="text-sm font-bold text-white font-serif-bengali line-clamp-1 group-hover:text-emerald-300 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-1">
                    {photo.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Google Drive Full Album Integration Card (Placed strictly at the bottom after all photos) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-black/85 to-teal-950/50 border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.2)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                Google Drive ক্লাউড অ্যালবাম
              </span>
              <span className="text-xs text-emerald-200/80">বৃক্ষরোপণ ও পরিবেশ সুরক্ষা</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif-bengali">
              গুগল ড্রাইভে আমাদের ক্লাবের সমস্ত আসল হাই-রেজোলিউশন ফটো সংরক্ষিত আছে
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
              চারাগাছ বিতরণ, বৃক্ষরোপণ অভিযান, সবুজায়ন ও পরিবেশ সচেতনতার সমস্ত মূল ছবি দেখতে এবং এই বছরের নতুন ছবি সরাসরি ব্রাউজ ও ডাউনলোড করতে গুগল ড্রাইভে ভিজিট করুন। ড্রাইভের যেকোনো ছবি পেজে সরাসরি দেখতে উপরে <strong>'+ নতুন ছবি যোগ করুন'</strong> বাটনে ক্লিক করে লিঙ্ক দিন।
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs sm:text-sm font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>ড্রাইভ লিঙ্ক পেস্ট করুন</span>
          </button>

          <a
            href={CLUB_INFO.driveFolders.treePlantation}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 border border-emerald-400/40"
          >
            <FolderOpen className="w-4 h-4 text-white" />
            <span>📁 গুগল ড্রাইভে সব ছবি দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={CLUB_INFO.driveFolders.treePlantation}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black/60 hover:bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>ডাউনলোড</span>
          </a>
        </div>
      </motion.div>

      {/* Lightbox for Tree Photos */}
      {currentPhoto && (
        <ImageLightbox
          isOpen={selectedPhotoIndex !== null}
          onClose={() => setSelectedPhotoIndex(null)}
          imageUrl={currentPhoto.url}
          title={currentPhoto.title}
          subtitle={currentPhoto.subtitle}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={selectedPhotoIndex !== null && selectedPhotoIndex < filteredPhotos.length - 1}
          hasPrev={selectedPhotoIndex !== null && selectedPhotoIndex > 0}
        />
      )}

      {/* Add Photo Modal */}
      <AddPhotoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPhotos={handleAddPhotos}
        categories={categories}
        defaultCategory="plantation"
        defaultTag="২০২৬ সবুজায়ন"
        driveFolderUrl={CLUB_INFO.driveFolders.treePlantation}
        pageTitle="বৃক্ষরোপণ ও পরিবেশ রক্ষা গ্যালারি"
      />

      {/* Admin Password Authentication Modal */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthModalOpen(false);
          setIsAddModalOpen(true);
        }}
        actionTitle="অফিসিয়াল ফটো যোগ করুন"
        description="বৃক্ষরোপণ ও পরিবেশ রক্ষা গ্যালারিতে নতুন ছবি যুক্ত করতে অ্যাডমিন পাসওয়ার্ড দিন। প্রতিটি আপলোডের ক্ষেত্রে অ্যাডমিন যাচাই বাধ্যতামূলক।"
        submitButtonText="পাসওয়ার্ড যাচাই করে ফটো আপলোড করুন"
      />

      {/* Admin Password Verification Modal for Deleting Photos */}
      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setPhotoToDeleteId(null);
        }}
        onAuthenticated={handleConfirmDeleteCustomPhoto}
        actionTitle="অফিসিয়াল ফটো মুছে ফেলুন"
        description="অ্যাডমিনদের আপলোড করা এই অফিসিয়াল ছবিটি সাধারণ সদস্যরা মুছতে পারবেন না। নিশ্চিতভাবে মুছে ফেলতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নিশ্চিত মুছুন"
        isDangerousAction={true}
      />
    </div>
  );
};
