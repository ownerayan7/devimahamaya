import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BellRing,
  Calendar,
  Sparkles,
  Eye,
  AlertCircle,
  Pin,
  ExternalLink,
  Download,
  FileText,
  Plus,
  Lock,
  Trash2
} from 'lucide-react';
import { ANNOUNCEMENTS, CLUB_INFO } from '../data/clubData';
import { Announcement } from '../types';
import { ImageLightbox } from './ImageLightbox';
import { AddNoticeModal } from './AddNoticeModal';
import { AdminPhotoAuthModal } from './AdminPhotoAuthModal';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { sendAppNotification } from '../utils/notificationHelper';

const LOCAL_STORAGE_NOTICES_KEY = '11star_custom_announcements_v2';

export const AnnouncementCard: React.FC = () => {
  const [customNotices, setCustomNotices] = useState<Announcement[]>([]);
  const [activeNoticeId, setActiveNoticeId] = useState<string>('khuti-puja-2026');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ url: string; title: string; subtitle: string }>({
    url: CLUB_INFO.images.khutiPujaNotice,
    title: 'শারদীয়া দুর্গাপূজা ২০২৬ — খুঁটি পূজার বিজ্ঞপ্তি',
    subtitle: '11 স্টার ক্লাব • ৪ সেপ্টেম্বর ২০২৬',
  });

  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  const [noticeToDeleteId, setNoticeToDeleteId] = useState<string | null>(null);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);

  // Load custom notices from Firestore & localStorage
  useEffect(() => {
    // 1. Initial load from localStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTICES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomNotices(parsed);
          setActiveNoticeId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load custom notices:', e);
    }

    // 2. Real-time Firestore sync
    const colRef = collection(db, 'announcements');
    const unsub = onSnapshot(colRef, (snapshot) => {
      const notices: Announcement[] = [];
      snapshot.forEach((d) => {
        notices.push({ ...(d.data() as Announcement), id: d.id });
      });
      notices.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      if (notices.length > 0) {
        setCustomNotices(notices);
        setActiveNoticeId((prev) => notices.some(n => n.id === prev) ? prev : notices[0].id);
      } else {
        setCustomNotices([]);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_NOTICES_KEY, JSON.stringify(notices));
      } catch (e) {}
    }, (err) => {
      console.warn('Firestore announcements listener notice:', err);
    });

    return () => unsub();
  }, []);

  const saveCustomNotices = (notices: Announcement[]) => {
    setCustomNotices(notices);
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTICES_KEY, JSON.stringify(notices));
    } catch (e) {
      console.error('Failed to save notices to localStorage:', e);
    }
  };

  const handleOpenAdminNoticeModal = () => {
    // Always prompt for password every time
    setIsAdminAuthOpen(true);
  };

  const handleAddNotice = async (newNotice: Announcement) => {
    const itemWithTime = {
      ...newNotice,
      createdAt: Date.now()
    };
    const updated = [itemWithTime, ...customNotices];
    saveCustomNotices(updated);
    setActiveNoticeId(newNotice.id);

    try {
      await setDoc(doc(db, 'announcements', newNotice.id), itemWithTime);
      
      // Send notification
      await sendAppNotification(
        'নতুন নোটিশ প্রকাশিত হয়েছে!',
        `${newNotice.title}`,
        'notice',
        'announcement'
      );
    } catch (err) {
      console.warn('Failed to save announcement to Firestore:', err);
    }
  };

  const handlePromptDeleteNotice = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNoticeToDeleteId(id);
    setIsDeleteAuthOpen(true);
  };

  const handleConfirmDeleteNotice = async () => {
    if (!noticeToDeleteId) return;
    const id = noticeToDeleteId;
    const updated = customNotices.filter((n) => n.id !== id);
    saveCustomNotices(updated);
    if (activeNoticeId === id) {
      setActiveNoticeId(updated[0]?.id || ANNOUNCEMENTS[0].id);
    }
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.warn('Failed to delete announcement from Firestore:', err);
    }
    setNoticeToDeleteId(null);
    setIsDeleteAuthOpen(false);
  };

  const allNotices: Announcement[] = [...customNotices, ...ANNOUNCEMENTS];
  const activeNotice = allNotices.find((n) => n.id === activeNoticeId) || allNotices[0];

  const handleOpenNoticeImage = (url: string, title: string, subtitle: string) => {
    setLightboxData({ url, title, subtitle });
    setLightboxOpen(true);
  };

  return (
    <div className="w-full space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl glass-card border border-amber-500/30 p-6 sm:p-8 gold-glow"
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.2),_transparent_70%)] pointer-events-none" />

        {/* Section Heading with Icon & Admin Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center">
              <BellRing className="w-6 h-6 animate-bounce text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/40 uppercase tracking-wider flex items-center gap-1">
                  <Pin className="w-3 h-3" /> জরুরি নোটিশ বোর্ড
                </span>
                <span className="text-xs text-amber-200/70">Official Circulars</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
                সর্বশেষ বিজ্ঞপ্তি ও নোটিশ বোর্ড
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Admin Post Notice Trigger Button */}
            <button
              onClick={handleOpenAdminNoticeModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              title="শুধুমাত্র ক্লাব অ্যাডমিন পাসওয়ার্ড দিয়ে নোটিশ পোস্ট করতে পারবেন"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>বিজ্ঞপ্তি পোস্ট করুন (অ্যাডমিন)</span>
              <Plus className="w-3.5 h-3.5 ml-0.5" />
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-stone-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>আপডেট: শারদীয়া ২০২৬</span>
            </div>
          </div>
        </div>

        {/* Notice Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allNotices.map((notice, idx) => {
            const isActive = activeNotice.id === notice.id;
            return (
              <div key={notice.id} className="relative group/tab">
                <button
                  onClick={() => setActiveNoticeId(notice.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-105'
                      : 'bg-black/40 text-stone-300 hover:text-amber-200 hover:bg-white/5 border border-amber-500/20'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-black/30 text-amber-100' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{notice.tag}</span>
                  {notice.driveFolderUrl && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-black/40 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      Drive 📁
                    </span>
                  )}
                  {notice.isCustom && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-black/50 text-white' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      নতুন
                    </span>
                  )}
                </button>

                {notice.isCustom && (
                  <button
                    onClick={(e) => handlePromptDeleteNotice(e, notice.id)}
                    title="এই নোটিশটি মুছে ফেলুন (অ্যাডমিন পাসওয়ার্ড আবশ্যক)"
                    className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-600 text-white opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Notice Body */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeNotice.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            {/* Left Notice Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeNotice.tag}</span>
                </div>
                <span className="text-xs text-stone-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
                  তারিখ: {activeNotice.date}
                </span>
                {activeNotice.isCustom && (
                  <span className="text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    অ্যাডমিন কর্তৃক পোস্টকৃত
                  </span>
                )}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white leading-snug">
                {activeNotice.title}
              </h3>

              <div className="text-stone-200 text-sm sm:text-base leading-relaxed bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 font-medium whitespace-pre-line">
                {activeNotice.content}
              </div>

              {/* Action buttons if Google Drive link exists */}
              {activeNotice.driveFolderUrl ? (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={activeNotice.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-400/50 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
                  >
                    <FileText className="w-4 h-4 text-emerald-200" />
                    <span>{activeNotice.driveFolderTitle || 'গুগল ড্রাইভ ফোল্ডারে সম্পূর্ণ নোটিশ দেখুন'}</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>

                  <a
                    href={activeNotice.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 font-semibold text-xs sm:text-sm transition-all"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>ডকুমেন্ট ডাউনলোড</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4 text-xs text-amber-300/80 pt-2">
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-white">তারিখ: {activeNotice.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>স্থান: 11 স্টার ক্লাব প্রাঙ্গণ ও মণ্ডপ</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Notice Official Visual / Poster Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {activeNotice.image ? (
                <div
                  onClick={() => handleOpenNoticeImage(activeNotice.image!, activeNotice.title, activeNotice.date)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-amber-500/40 bg-black/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02] hover:border-amber-400 w-full max-w-sm"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-stone-900 flex items-center justify-center">
                    <img
                      src={activeNotice.image}
                      alt={activeNotice.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = CLUB_INFO.images.heroDurga;
                      }}
                    />
                  </div>

                  {/* Hover overlay with zoom hint */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity p-4 text-center">
                    <div className="p-3 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50 mb-2 transform group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-amber-100 font-serif-bengali">
                      অফিসিয়াল নোটিশ পত্র দেখুন
                    </p>
                    <span className="text-[11px] text-amber-300/80 bg-black/50 px-2.5 py-0.5 rounded-full mt-1 border border-amber-500/30">
                      ক্লিক করে বড় করুন (Full Resolution)
                    </span>
                  </div>
                </div>
              ) : activeNotice.driveFolderUrl ? (
                <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-emerald-950/60 to-black/80 border-2 border-emerald-500/40 p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <FileText className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                      Google Drive ক্লাউড নোটিশ
                    </span>
                    <h4 className="text-base font-bold text-white font-serif-bengali">
                      অফিশিয়াল নোটিশ বোর্ড ফোল্ডার
                    </h4>
                    <p className="text-xs text-stone-300">
                      পিডিএফ, ইমেজ ও সম্পূর্ণ বিজ্ঞপ্তির মূল কপি সংরক্ষিত আছে।
                    </p>
                  </div>
                  <a
                    href={activeNotice.driveFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <span>ড্রাইভে ফাইল খুলুন</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-amber-950/30 to-black/60 border border-amber-500/30 p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                    <BellRing className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-white font-serif-bengali">
                    11 স্টার ক্লাব সার্কুলার
                  </h4>
                  <p className="text-xs text-stone-300">
                    খুকুড়দহ আড়খানা, পশ্চিম মেদিনীপুর
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Lightbox for Notice Image */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={lightboxData.url}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
      />

      {/* Admin Password Authentication Gate for Posting */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthOpen(false);
          setIsAddNoticeOpen(true);
        }}
        actionTitle="নতুন নোটিশ পোস্ট করুন"
        description="ক্লাবের অফিসিয়াল নোটিশ বোর্ডে নতুন বিজ্ঞপ্তি যুক্ত করতে অ্যাডমিন পাসওয়ার্ড দিন। প্রতিটি পোস্টের জন্য অ্যাডমিন যাচাই বাধ্যতামূলক।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নোটিশ পোস্ট করুন"
      />

      {/* Admin Password Verification Modal for Deleting Notice */}
      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setNoticeToDeleteId(null);
        }}
        onAuthenticated={handleConfirmDeleteNotice}
        actionTitle="অফিসিয়াল নোটিশ মুছে ফেলুন"
        description="অ্যাডমিনদের আপলোড করা এই অফিসিয়াল বিজ্ঞপ্তিটি সাধারণ সদস্যরা মুছতে পারবেন না। নিশ্চিতভাবে মুছে ফেলতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নিশ্চিত মুছুন"
        isDangerousAction={true}
      />

      {/* Add Notice Post Modal */}
      <AddNoticeModal
        isOpen={isAddNoticeOpen}
        onClose={() => setIsAddNoticeOpen(false)}
        onAddNotice={handleAddNotice}
      />
    </div>
  );
};

