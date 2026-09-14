import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Heart,
  User,
  Tag,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Users,
  CheckCircle2
} from 'lucide-react';
import { MemberPhotoItem } from '../types';
import { INITIAL_MEMBER_PHOTOS } from '../data/memberPhotosData';
import { MemberPhotoUploadModal } from './MemberPhotoUploadModal';
import { ImageLightbox } from './ImageLightbox';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { sendAppNotification } from '../utils/notificationHelper';

export const MemberCommunityGallery: React.FC = () => {
  const [memberPhotos, setMemberPhotos] = useState<MemberPhotoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('member_photos_liked_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const photosRef = collection(db, 'memberPhotos');
    
    const unsubscribe = onSnapshot(photosRef, (snapshot) => {
      const photos: MemberPhotoItem[] = [];
      snapshot.forEach((d) => {
        photos.push({ ...(d.data() as MemberPhotoItem), id: d.id });
      });
      // Sort in memory so newest user photos are first
      photos.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setMemberPhotos(photos.length > 0 ? photos : INITIAL_MEMBER_PHOTOS);
    }, (err) => {
      console.warn('Firestore memberPhotos sync notice:', err);
      setMemberPhotos(INITIAL_MEMBER_PHOTOS);
    });

    return () => unsubscribe();
  }, []);

  const handleAddPhoto = async (newPhoto: MemberPhotoItem) => {
    const itemWithTime = {
      ...newPhoto,
      createdAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'memberPhotos', newPhoto.id), itemWithTime);
      
      // Send notification
      await sendAppNotification(
        'সদস্যদের নতুন ছবি!',
        `${newPhoto.authorName || 'একজন সদস্য'} নতুন ছবি শেয়ার করেছেন।`,
        'media',
        'gallery'
      );
    } catch (e) {
      console.error('Failed to save photo to Firestore:', e);
    }
  };

  const handleDeletePhoto = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('আপনি কি এই ছবিটি সদস্য গ্যালারি থেকে মুছে ফেলতে চান?')) {
      try {
        await deleteDoc(doc(db, 'memberPhotos', id));
      } catch (e) {
        console.error('Failed to delete photo:', e);
      }
    }
  };

  const handleToggleLike = async (e: React.MouseEvent, id: string, currentLikes: number) => {
    e.stopPropagation();
    const alreadyLiked = likedMap[id];
    const newLikedMap = { ...likedMap, [id]: !alreadyLiked };
    setLikedMap(newLikedMap);
    try {
      localStorage.setItem('member_photos_liked_map', JSON.stringify(newLikedMap));
    } catch {}

    const delta = alreadyLiked ? -1 : 1;
    const updatedCount = Math.max(0, (currentLikes || 0) + delta);

    try {
      await updateDoc(doc(db, 'memberPhotos', id), {
        likes: updatedCount
      });
    } catch (err) {
      console.warn('Failed to update likes:', err);
    }
  };


  const categories = [
    { id: 'all', label: `সব ছবি (${memberPhotos.length})` },
    { id: 'puja', label: `🪔 দুর্গোৎসব ও পূজার মুহূর্ত (${memberPhotos.filter((p) => p.category === 'puja').length})` },
    { id: 'work', label: `🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব (${memberPhotos.filter((p) => p.category === 'work').length})` },
    { id: 'plantation', label: `🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা (${memberPhotos.filter((p) => p.category === 'plantation').length})` },
    { id: 'social', label: `❤️ রক্তদান ও সমাজসেবা (${memberPhotos.filter((p) => p.category === 'social').length})` },
    { id: 'cultural', label: `🎨 সাংস্কৃতিক অনুষ্ঠান (${memberPhotos.filter((p) => p.category === 'cultural').length})` },
    { id: 'memories', label: `👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি (${memberPhotos.filter((p) => p.category === 'memories').length})` },
  ];

  const filteredPhotos = activeCategory === 'all'
    ? memberPhotos
    : memberPhotos.filter((p) => p.category === activeCategory);

  const currentPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;

  return (
    <section id="member-community-gallery" className="pt-8 space-y-8">
      {/* Section Header Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/40 via-stone-900/90 to-zinc-950 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.12)] overflow-hidden">
        {/* Glow flare */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>উন্মুক্ত সদস্য ও ভক্তদের গ্যালারি</span>
              <Sparkles className="w-3 h-3 text-emerald-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif-bengali text-white">
              ক্লাব সদস্যদের তোলা ছবি ও স্মৃতি
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              ক্লাবের অ্যাডমিন ছাড়াও যেকোনো সাধারণ সদস্য, পাড়াবাসী বা ভক্ত-দর্শনার্থীরা মণ্ডপে বন্ধুদের সাথে আড্ডা, মায়ের বরণ, রক্তদান, আনন্দানুষ্ঠান কিংবা চারাগাছ পরিচর্যার নিজের তোলা স্মরণীয় মুহূর্ত ও ছবি এখানে সরাসরি যুক্ত করতে পারবেন — <strong>এর জন্য কোনো পাসওয়ার্ডের প্রয়োজন নেই!</strong>
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>নিজের তোলা ছবি শেয়ার করুন</span>
            </button>
          </div>
        </div>

        {/* Highlight feature pills */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>সরাসরি মোবাইল বা ড্রাইভ থেকে আপলোড</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>তোলকের নাম ও পরিচয় স্বয়ংক্রিয়ভাবে প্রদর্শন</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>লাইক দিয়ে প্রিয় মুহূর্তকে সম্মান জানান</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategory(c.id);
                setSelectedPhotoIndex(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === c.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold scale-105'
                  : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন ছবি দিন</span>
        </button>
      </div>

      {/* Member Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
          <Camera className="w-12 h-12 text-stone-500 mx-auto" />
          <p className="text-stone-300 text-sm">এই ক্যাটাগরিতে এখনো কোনো সদস্য ছবি যোগ করেননি।</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম ছবিটি আপনি শেয়ার করুন</span>
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredPhotos.map((photo, index) => {
              const isLiked = !!likedMap[photo.id];
              const likes = photo.likes || 0;

              return (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-emerald-500/25 bg-stone-900/80 shadow-lg hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/80">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = '/gallery/fb_img_2.jpg';
                      }}
                    />

                    {/* Gradient top bar for tags */}
                    <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between gap-2 z-10">
                      {/* Author badge (shown if authorName exists, otherwise clean category/tag pill) */}
                      {photo.authorName ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/40 text-white text-[11px] font-medium shadow-md max-w-[75%]">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
                            <User className="w-2.5 h-2.5" />
                          </div>
                          <span className="truncate text-emerald-200 font-semibold">{photo.authorName}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-[11px] font-medium shadow-md">
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>{photo.tag || 'সদস্য স্মৃতি'}</span>
                        </div>
                      )}

                      {/* Year badge */}
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {photo.year}
                      </span>
                    </div>

                    {/* Delete button if user added custom photo */}
                    {photo.isCustom && (
                      <button
                        type="button"
                        title="মুছে ফেলুন"
                        onClick={(e) => handleDeletePhoto(e, photo.id)}
                        className="absolute bottom-3 right-3 z-20 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white/80 hover:text-white transition-colors shadow-md border border-white/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5 bg-gradient-to-b from-stone-900/90 to-black">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{photo.authorRole || photo.tag || 'সদস্য স্মৃতি'}</span>
                        </span>
                        {photo.dateAdded && (
                          <span className="text-[10px] text-stone-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{photo.dateAdded}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold font-serif-bengali text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {photo.title}
                      </h4>

                      {photo.caption && (
                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          "{photo.caption}"
                        </p>
                      )}
                    </div>

                    {/* Interaction Bar */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-400">
                        ক্লিক করে বড় করে দেখুন
                      </span>

                      {/* Like button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(e, photo.id, likes)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          isLiked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 scale-105'
                            : 'bg-white/5 text-stone-300 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{likes}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload Modal */}
      <MemberPhotoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddPhoto={handleAddPhoto}
      />

      {/* Lightbox Modal */}
      {currentPhoto && (
        <ImageLightbox
          isOpen={selectedPhotoIndex !== null}
          onClose={() => setSelectedPhotoIndex(null)}
          imageUrl={currentPhoto.url}
          title={currentPhoto.title}
          subtitle={
            currentPhoto.authorName
              ? `📸 তোলক: ${currentPhoto.authorName} (${currentPhoto.authorRole || 'সদস্য'}) • ${currentPhoto.year} ${currentPhoto.caption ? '— ' + currentPhoto.caption : ''}`
              : `📸 সদস্য স্মৃতি • ${currentPhoto.year} ${currentPhoto.caption ? '— ' + currentPhoto.caption : ''}`
          }
          onNext={() => {
            if (selectedPhotoIndex !== null && selectedPhotoIndex < filteredPhotos.length - 1) {
              setSelectedPhotoIndex(selectedPhotoIndex + 1);
            }
          }}
          onPrev={() => {
            if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
              setSelectedPhotoIndex(selectedPhotoIndex - 1);
            }
          }}
          hasNext={selectedPhotoIndex !== null && selectedPhotoIndex < filteredPhotos.length - 1}
          hasPrev={selectedPhotoIndex !== null && selectedPhotoIndex > 0}
        />
      )}
    </section>
  );
};
