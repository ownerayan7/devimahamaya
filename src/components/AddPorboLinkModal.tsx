import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Radio,
  Video,
  Facebook,
  Instagram,
  Folder,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Flame,
  Globe
} from 'lucide-react';
import { PorboLinkItem, PorboLinkCategory } from '../types';
import { PUJA_SCHEDULE_2026 } from '../data/clubData';
import { sendAppNotification } from '../utils/notificationHelper';
import { emitSocketUpload, emitSocketPorboLink } from '../utils/socketClient';

const ADMIN_PASSWORD = "Ayan@2024";

interface AddPorboLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPorboIndex?: number;
  onSaveLink: (link: Omit<PorboLinkItem, 'id'>) => Promise<void>;
}

export const AddPorboLinkModal: React.FC<AddPorboLinkModalProps> = ({
  isOpen,
  onClose,
  initialPorboIndex = 0,
  onSaveLink,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [selectedPorboIndex, setSelectedPorboIndex] = useState<number>(initialPorboIndex);
  const [category, setCategory] = useState<PorboLinkCategory>('live');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setSelectedPorboIndex(initialPorboIndex);
      setError('');
      setSuccess('');
      setPasswordError('');
      setPasswordInput('');
    }
  }, [isOpen, initialPorboIndex]);

  useEffect(() => {
    // Auto fill default title based on selected category & porbo
    const porboName = PUJA_SCHEDULE_2026[selectedPorboIndex]?.event || 'উৎসব';
    if (category === 'live') {
      setTitle(`${porboName} — সরাসরি লাইভ সম্প্রচার`);
    } else if (category === 'youtube') {
      setTitle(`${porboName} — ইউটিউব ভিডিও ও হাইলাইটস`);
    } else if (category === 'facebook') {
      setTitle(`${porboName} — ফেসবুক ভিডিও/পোস্ট`);
    } else if (category === 'instagram') {
      setTitle(`${porboName} — ইনস্টাগ্রাম রিল/পোস্ট`);
    } else if (category === 'gdrive') {
      setTitle(`${porboName} — গুগল ড্রাইভ ফটো ও ভিডিও অ্যালবাম`);
    }
  }, [category, selectedPorboIndex]);

  if (!isOpen) return null;

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('11starclub_admin_auth', 'true');
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড দিন।');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('অনুগ্রহ করে সঠিক ওয়েবলিঙ্ক (URL) দিন।');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('লিঙ্কটি অবশ্যই http:// বা https:// দিয়ে শুরু হতে হবে।');
      return;
    }

    if (!title.trim()) {
      setError('অনুগ্রহ করে লিঙ্কের শিরোনাম লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPorboObj = PUJA_SCHEDULE_2026[selectedPorboIndex];
      const porboTitleStr = `পর্ব 0${selectedPorboIndex + 1}: ${selectedPorboObj?.event || ''}`;

      await onSaveLink({
        porboIndex: selectedPorboIndex,
        porboTitle: porboTitleStr,
        category,
        title: title.trim(),
        url: url.trim(),
        isLiveActive: category === 'live' ? isLiveActive : false,
        createdAt: Date.now(),
        addedBy: 'Admin',
      });

      emitSocketUpload({ category: 'porbo_link', title: title.trim(), url: url.trim() });
      emitSocketPorboLink({ action: 'add', title: title.trim(), url: url.trim() });

      // Dispatch global push notification across all devices worldwide
      if (category === 'live' && isLiveActive) {
        sendAppNotification(
          `🔴 দুর্গাপূজা ২০২৬ লাইভ: ${porboTitleStr}`,
          `সরাসরি সম্প্রচার চলছে: "${title.trim()}"। এখনই এক ক্লিকে লাইভ ভিডিও দেখুন!`,
          'event',
          'durga-puja'
        ).catch(console.warn);
      } else {
        sendAppNotification(
          `📹 দুর্গাপূজা লিঙ্ক আপডেট: ${porboTitleStr}`,
          `নতুন লিঙ্ক যুক্ত হয়েছে: "${title.trim()}"।`,
          'media',
          'durga-puja'
        ).catch(console.warn);
      }

      setSuccess('পর্বের লিঙ্কটি সফলভাবে প্রকাশ ও সংরক্ষণ করা হলো!');
      setTimeout(() => {
        setSuccess('');
        setIsSubmitting(false);
        onClose();
        setUrl('');
      }, 1000);
    } catch (err: any) {
      setError('লিঙ্ক সেভ করার সময় ত্রুটি ঘটেছে: ' + (err.message || 'Error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/90 via-red-950/90 to-amber-950/90 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-inner">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>দুর্গাপূজা ২০২৬ • লিঙ্ক ও লাইভ পোর্টাল</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-gold-gradient">
                পর্বভিত্তিক লাইভ ও সোশ্যাল লিঙ্ক যুক্ত করুন
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('11starclub_admin_auth');
                }}
                className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/80 border border-white/10 text-stone-300 text-[11px] flex items-center gap-1 transition-colors"
                title="অ্যাডমিন সেসন লক করুন"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">লক সেসন</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {!isAuthenticated ? (
          /* Admin Password Screen */
          <form onSubmit={handlePasswordLogin} className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white font-serif-bengali">অ্যাডমিন পাসওয়ার্ড আবশ্যক</h4>
              <p className="text-xs text-stone-300">
                পর্বভিত্তিক লাইভ বা ভিডিও লিঙ্ক যুক্ত করার জন্য অ্যাডমিন পাসওয়ার্ড যাচাই করুন।
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="অ্যাডমিন পাসওয়ার্ড দিন..."
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/40 text-white placeholder-stone-500 text-sm text-center focus:outline-none focus:border-amber-400"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
            >
              যাচাই করুন
            </button>
          </form>
        ) : (
          /* Add Link Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Select Porbo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>১. দুর্গাপূজা ২০২৬-এর পর্ব নির্বাচন করুন *</span>
              </label>
              <select
                value={selectedPorboIndex}
                onChange={(e) => setSelectedPorboIndex(Number(e.target.value))}
                className="w-full px-3.5 py-3 rounded-xl bg-black/80 border border-amber-500/40 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-400"
              >
                {PUJA_SCHEDULE_2026.map((item, idx) => (
                  <option key={idx} value={idx} className="bg-stone-900 text-white">
                    পর্ব 0{idx + 1}: {item.event} ({item.dateBengali})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Link Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-amber-400" />
                <span>২. লিঙ্কের ধরন নির্বাচন করুন *</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('live')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    category === 'live'
                      ? 'bg-red-600 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-black/40 text-stone-300 border-white/10 hover:bg-black/70'
                  }`}
                >
                  <Radio className="w-4 h-4 animate-pulse text-red-300" />
                  <span>🔴 সরাসরি লাইভ লিঙ্ক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('youtube')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    category === 'youtube'
                      ? 'bg-red-700/80 text-white border-red-400 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                      : 'bg-black/40 text-stone-300 border-white/10 hover:bg-black/70'
                  }`}
                >
                  <Video className="w-4 h-4 text-red-400" />
                  <span>📹 YouTube লিঙ্ক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('facebook')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    category === 'facebook'
                      ? 'bg-blue-600/80 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'bg-black/40 text-stone-300 border-white/10 hover:bg-black/70'
                  }`}
                >
                  <Facebook className="w-4 h-4 text-blue-400" />
                  <span>📘 Facebook লিঙ্ক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('instagram')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    category === 'instagram'
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                      : 'bg-black/40 text-stone-300 border-white/10 hover:bg-black/70'
                  }`}
                >
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>📷 Instagram লিঙ্ক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('gdrive')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all col-span-2 sm:col-span-1 ${
                    category === 'gdrive'
                      ? 'bg-emerald-600/80 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-black/40 text-stone-300 border-white/10 hover:bg-black/70'
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>📁 Google Drive লিঙ্ক</span>
                </button>
              </div>
            </div>

            {/* Is Live Active Switch (only for live category) */}
            {category === 'live' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/60 via-black to-red-950/60 border border-red-500/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-red-500 animate-ping" />
                    <span>বর্তমানে লাইভ সম্প্রচার চলছে?</span>
                  </span>
                  <p className="text-[11px] text-stone-400">
                    এটি চালু রাখলে ওই পর্বের কার্ডে জ্বলজ্বলে 🔴 "সরাসরি লাইভ দেখুন" বোতাম দেখাবে।
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLiveActive}
                    onChange={(e) => setIsLiveActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            )}

            {/* Link Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200">
                ৩. লিঙ্কের শিরোনাম বা বর্ণনা *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: সরাসরি ইউটিউব লাইভ প্রচার বা মণ্ডপ পরিক্রমা"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200">
                ৪. সোশ্যাল মিডিয়া / লাইভ / ড্রাইভ ওয়েবসাইট লিঙ্ক (URL) *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  category === 'live'
                    ? 'https://www.youtube.com/live/... বা Facebook/Instagram Live'
                    : category === 'youtube'
                    ? 'https://youtube.com/watch?v=...'
                    : category === 'facebook'
                    ? 'https://facebook.com/watch/... বা পোস্ট লিঙ্ক'
                    : category === 'instagram'
                    ? 'https://instagram.com/reel/...'
                    : 'https://drive.google.com/drive/folders/...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>লিঙ্ক প্রকাশ করুন</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
