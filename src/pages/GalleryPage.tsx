import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  Download,
  FolderOpen,
  Plus,
  Trash2,
  Lock,
  Users
} from 'lucide-react';
import { CLUB_INFO, GALLERY_PHOTOS } from '../data/clubData';
import { GalleryPhotoItem } from '../types';
import { ImageLightbox } from '../components/ImageLightbox';
import { AddPhotoModal } from '../components/AddPhotoModal';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { MemberCommunityGallery } from '../components/MemberCommunityGallery';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { sendAppNotification } from '../utils/notificationHelper';

const LOCAL_STORAGE_KEY = '11star_gallery_custom_photos';

export const GalleryPage: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [photoToDeleteId, setPhotoToDeleteId] = useState<string | number | null>(null);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);
  const [customPhotos, setCustomPhotos] = useState<GalleryPhotoItem[]>([]);

  // Load custom photos from Firestore in real time + localStorage fallback
  useEffect(() => {
    // 1. Initial load from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomPhotos(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load localStorage gallery photos:', e);
    }

    // 2. Real-time Firestore sync
    const colRef = collection(db, 'clubPhotos');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const photos: GalleryPhotoItem[] = [];
      snapshot.forEach((d) => {
        photos.push({ ...(d.data() as GalleryPhotoItem), id: d.id });
      });
      // Sort so newest items are first
      photos.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setCustomPhotos(photos);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(photos));
      } catch (e) {}
    }, (err) => {
      console.warn('Firestore clubPhotos sync notice:', err);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPhotos = async (newItems: any[]) => {
    const formatted: GalleryPhotoItem[] = newItems.map((item) => ({
      ...item,
      isCustom: true,
      createdAt: Date.now()
    }));
    const updated = [...formatted, ...customPhotos];
    setCustomPhotos(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    // Save each new photo to Firestore with exact matching doc ID
    for (const item of formatted) {
      try {
        await setDoc(doc(db, 'clubPhotos', String(item.id)), item);
      } catch (err) {
        console.warn('Failed to save club photo to Firestore:', err);
      }
    }
    
    // Send notification
    await sendAppNotification(
      'নতুন ছবি যোগ করা হয়েছে!',
      'গ্যালারিতে নতুন ছবি যোগ করা হয়েছে, এখনই দেখে নিন।',
      'media',
      'gallery'
    );
  };

  const handleOpenOfficialAddPhoto = () => {
    // Always prompt for password every time
    setIsAdminAuthModalOpen(true);
  };

  const scrollToMemberSection = () => {
    const el = document.getElementById('member-community-gallery');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePromptDeleteCustomPhoto = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    setPhotoToDeleteId(id);
    setIsDeleteAuthOpen(true);
  };

  const handleConfirmDeleteCustomPhoto = async () => {
    if (photoToDeleteId === null) return;
    const idStr = String(photoToDeleteId);
    const updated = customPhotos.filter((p) => p.id !== photoToDeleteId);
    setCustomPhotos(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    try {
      await deleteDoc(doc(db, 'clubPhotos', idStr));
    } catch (err) {
      console.warn('Failed to delete club photo from Firestore:', err);
    }
    setPhotoToDeleteId(null);
    setIsDeleteAuthOpen(false);
  };

  // Combine custom photos (at the beginning) + default photos
  const allPhotos: GalleryPhotoItem[] = [...customPhotos, ...GALLERY_PHOTOS];

  const filteredItems = activeCategory === 'all'
    ? allPhotos
    : allPhotos.filter((item) => item.category === activeCategory);

  const currentPhoto = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const categories = [
    { id: 'all', label: `সব ছবি (${allPhotos.length})` },
    { id: 'puja', label: `🪔 দুর্গোৎসব ও পূজার মুহূর্ত (${allPhotos.filter((i) => i.category === 'puja').length})` },
    { id: 'work', label: `🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব (${allPhotos.filter((i) => i.category === 'work').length})` },
    { id: 'plantation', label: `🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা (${allPhotos.filter((i) => i.category === 'plantation').length})` },
    { id: 'social', label: `❤️ রক্তদান ও সমাজসেবা (${allPhotos.filter((i) => i.category === 'social').length})` },
    { id: 'cultural', label: `🎨 সাংস্কৃতিক অনুষ্ঠান (${allPhotos.filter((i) => i.category === 'cultural').length})` },
    { id: 'memories', label: `👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি (${allPhotos.filter((i) => i.category === 'memories').length})` },
  ];

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>অফিসিয়াল ফটো সংগ্রহশালা ও স্মৃতির অ্যালবাম</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          অফিসিয়াল ফটো গ্যালারি
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          11 স্টার ক্লাবের ঐতিহ্যবাহী ঢাকের থিম মণ্ডপ, শারদীয়া দুর্গোৎসব, ঘাটের মনোরম আল্পনা, ছোটদের অঙ্কন প্রতিযোগিতা, বর্ণাঢ্য আলোকসজ্জা, স্বাধীনতা দিবস ও বছরব্যাপী সামাজিক সেবামূলক কর্মসূচির স্মরণীয় আলোকচিত্র সংকলন।
        </p>

        {/* Action Controls: Admin Add Photo (Password Protected) & Member Photos Section Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleOpenOfficialAddPhoto}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95"
            title="শুধুমাত্র ক্লাব অ্যাডমিনদের জন্য পাসওয়ার্ড সুরক্ষিত"
          >
            <Lock className="w-4 h-4" />
            <span>নতুন অফিসিয়াল ছবি যোগ করুন (অ্যাডমিন লক)</span>
          </button>

          <button
            onClick={scrollToMemberSection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>সদস্যদের তোলা ছবি সেকশন ➔</span>
          </button>

          <a
            href={CLUB_INFO.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/30 border border-amber-500/30 px-4 py-2 rounded-full transition-all hover:bg-amber-950/50"
          >
            <span>Facebook পেজ থেকে সংগৃহীত ফটো</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setSelectedIndex(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105 font-bold'
                  : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10 hover:border-amber-500/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredItems.map((photo, index) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedIndex(index)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-500/25 bg-black/70 aspect-[4/3] shadow-lg hover:border-amber-400 hover:scale-[1.02] transition-all"
            >
              <img
                src={photo.url}
                alt={photo.title}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = CLUB_INFO.images.heroDurga;
                }}
              />

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-amber-500/30 shadow-md">
                  {photo.tag}
                </span>
                {photo.isCustom && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-bold shadow-md">
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
                  className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white/80 hover:text-white transition-colors shadow-md border border-white/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-5">
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold font-serif-bengali text-white line-clamp-2">
                    {photo.title}
                  </h4>
                  <p className="text-xs text-amber-300/90 line-clamp-2">{photo.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Google Drive Full Photo Archive Integration Card (Placed at the bottom after photos) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/60 via-black/80 to-stone-900/60 border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.15)] flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                Google Drive ক্লাউড আর্কাইভ
              </span>
              <span className="text-xs text-amber-200/80">অরিজিনাল হাই-রেজোলিউশন ফটো</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif-bengali">
              গুগল ড্রাইভে আমাদের ক্লাবের সমস্ত অরিজিনাল ফটো সংরক্ষিত আছে
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
              মণ্ডপ সজ্জা, বিসর্জন শোভাযাত্রা, সাংস্কৃতিক রাত ও প্রতিযোগিতার সমস্ত মূল হাই-রেজোলিউশন ছবি দেখতে এবং এই বছর ২০২৬-এর নতুন ছবি সরাসরি ব্রাউজ ও ডাউনলোড করতে গুগল ড্রাইভে ভিজিট করুন। ড্রাইভের যেকোনো ছবি পেজের গ্যালারিতে সরাসরি দেখতে উপরে <strong>'+ নতুন ছবি যোগ করুন'</strong> বাটনে ক্লিক করে লিঙ্ক দিন।
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleOpenOfficialAddPhoto}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs sm:text-sm font-bold transition-all"
            title="অ্যাডমিন পাসওয়ার্ড সুরক্ষিত"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>ড্রাইভ লিঙ্ক পেস্ট করুন (অ্যাডমিন)</span>
          </button>

          <a
            href={CLUB_INFO.driveFolders.gallery}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <FolderOpen className="w-4 h-4 text-black" />
            <span>📁 গুগল ড্রাইভে সব ছবি দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={CLUB_INFO.driveFolders.gallery}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black/60 hover:bg-amber-950/40 border border-amber-500/30 text-amber-200 font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>ডাউনলোড</span>
          </a>
        </div>
      </motion.div>

      {/* Member Community Photos Section (Accessible by all members without password) */}
      <MemberCommunityGallery />

      {/* Lightbox Modal */}
      {currentPhoto && (
        <ImageLightbox
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          imageUrl={currentPhoto.url}
          title={currentPhoto.title}
          subtitle={currentPhoto.subtitle}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={selectedIndex !== null && selectedIndex < filteredItems.length - 1}
          hasPrev={selectedIndex !== null && selectedIndex > 0}
        />
      )}

      {/* Official Add Photo Modal (Admin Only) */}
      <AddPhotoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPhotos={handleAddPhotos}
        categories={categories}
        defaultCategory="puja"
        defaultTag="২০২৬ পূজো"
        driveFolderUrl={CLUB_INFO.driveFolders.gallery}
        pageTitle="অফিসিয়াল ফটো গ্যালারি"
      />

      {/* Admin Password Authentication Modal for Adding Photos */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthModalOpen(false);
          setIsAddModalOpen(true);
        }}
        onGoToMemberSection={scrollToMemberSection}
        actionTitle="অফিসিয়াল ফটো যোগ করুন"
        description="ক্লাবের অফিসিয়াল ফটো গ্যালারিতে নতুন ছবি যুক্ত করতে অ্যাডমিন পাসওয়ার্ড দিন। প্রতিটি আপলোডের ক্ষেত্রে অ্যাডমিন যাচাই বাধ্যতামূলক।"
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
