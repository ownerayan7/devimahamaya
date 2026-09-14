import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Radio,
  Upload,
  Link,
  Video,
  CheckCircle2,
  AlertCircle,
  Flame,
  Sparkles,
  Trash2
} from 'lucide-react';
import { parseUniversalMedia } from '../utils/mediaEmbedHelper';
import { saveVideoBlob } from '../utils/videoStorageHelper';

interface LivePrayerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: {
    isLiveActive: boolean;
    liveUrl: string;
    fallbackTitle: string;
    fallbackUrl: string;
    blobId?: string;
    isLocalBlob?: boolean;
  };
  onSaveConfig: (config: {
    isLiveActive: boolean;
    liveUrl: string;
    fallbackTitle: string;
    fallbackUrl: string;
    blobId?: string;
    isLocalBlob?: boolean;
  }) => void;
}

export const LivePrayerSettingsModal: React.FC<LivePrayerSettingsModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig
}) => {
  const [isLiveActive, setIsLiveActive] = useState(currentConfig.isLiveActive);
  const [liveUrl, setLiveUrl] = useState(currentConfig.liveUrl);
  const [fallbackTitle, setFallbackTitle] = useState(currentConfig.fallbackTitle);
  const [fallbackSourceType, setFallbackSourceType] = useState<'link' | 'file'>('link');
  const [fallbackUrlInput, setFallbackUrlInput] = useState(currentConfig.fallbackUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('অনুগ্রহ করে সঠিক ভিডিও ফাইল (MP4, WebM, MOV) নির্বাচন করুন।');
      return;
    }

    setError('');
    setSelectedFile(file);
    const objUrl = URL.createObjectURL(file);
    setFilePreview(objUrl);

    if (!fallbackTitle.trim()) {
      const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFallbackTitle(clean);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLiveActive && !liveUrl.trim()) {
      setError('লাইভ স্ট্রিমিং চালু রাখতে অনুগ্রহ করে লাইভ ভিডিওর লিঙ্ক (YouTube Live / Facebook Live) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    let finalFallbackUrl = currentConfig.fallbackUrl;
    let blobId = currentConfig.blobId || '';
    let isLocalBlob = false;

    if (fallbackSourceType === 'file' && selectedFile) {
      blobId = `prayer-live-fallback-permanent`;
      isLocalBlob = true;
      try {
        await saveVideoBlob(blobId, selectedFile);
        finalFallbackUrl = '';
      } catch (err) {
        console.warn('Error saving fallback video blob:', err);
      }
    } else if (fallbackSourceType === 'link' && fallbackUrlInput.trim()) {
      const parsed = parseUniversalMedia(fallbackUrlInput, 'video');
      finalFallbackUrl = parsed.embedUrl || fallbackUrlInput.trim();
      blobId = '';
      isLocalBlob = false;
    }

    onSaveConfig({
      isLiveActive,
      liveUrl: liveUrl.trim() || 'https://www.youtube-nocookie.com/embed/wm1OtR2kEVc?enablejsapi=1&autoplay=1',
      fallbackTitle: fallbackTitle.trim() || 'আজকের রেকর্ডড প্রার্থনা ও গ্যালারি ভিডিও',
      fallbackUrl: finalFallbackUrl,
      blobId,
      isLocalBlob
    });

    setSuccess('লাইভ ও প্রার্থনা ব্যাকআপ সেটিংস সফলভাবে আপডেট করা হয়েছে!');
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl rounded-3xl bg-[#140e11] border border-amber-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-6 relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Radio className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
              লাইভ প্রার্থনা ও গ্যালারি ব্যাকআপ সেটিংস
            </h3>
            <p className="text-xs text-amber-100/75">
              প্রার্থনার লাইভ সম্প্রচার চালু করুন অথবা লাইভ না থাকলে গ্যালারি/ডিভাইস থেকে ভিডিও যুক্ত করুন।
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Live Status Toggle */}
          <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-white font-serif-bengali block">
                🔴 লাইভ প্রার্থনা সম্প্রচার স্থিতি
              </span>
              <span className="text-xs text-stone-300 block">
                {isLiveActive ? 'বর্তমানে লাইভ সম্প্রচার সক্রিয় রয়েছে' : 'বর্তমানে লাইভ বন্ধ রয়েছে (রেকর্ডড/গ্যালারি মোড সক্রিয়)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isLiveActive ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-stone-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isLiveActive ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Live Stream URL input (if live active) */}
          {isLiveActive && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-200 font-serif-bengali block">
                লাইভ ভিডিও বা স্ট্রিম লিঙ্ক (YouTube Live / Facebook Live / Embed URL):
              </label>
              <input
                type="text"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[11px] text-stone-400 block">
                সদস্যদের দেখানোর জন্য ইউটিউব লাইভ বা ফেসবুক লাইভ লিঙ্কটি এখানে পেস্ট করুন।
              </span>
            </div>
          )}

          {/* Fallback / Gallery Upload Section (when live is not available) */}
          <div className="space-y-3 pt-2 border-t border-amber-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-200 font-serif-bengali flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                লাইভ না থাকলে গ্যালারি বা ডিভাইস থেকে রেকর্ডড প্রার্থনা আপলোড / লিঙ্ক:
              </span>
              <div className="flex rounded-lg bg-black/40 p-1 border border-amber-500/30 text-xs">
                <button
                  type="button"
                  onClick={() => setFallbackSourceType('link')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    fallbackSourceType === 'link' ? 'bg-amber-500 text-black font-bold' : 'text-stone-300'
                  }`}
                >
                  লিঙ্ক
                </button>
                <button
                  type="button"
                  onClick={() => setFallbackSourceType('file')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    fallbackSourceType === 'file' ? 'bg-amber-500 text-black font-bold' : 'text-stone-300'
                  }`}
                >
                  গ্যালারি ফাইল
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-stone-300 block font-medium">
                প্রার্থনার শিরোনাম:
              </label>
              <input
                type="text"
                value={fallbackTitle}
                onChange={(e) => setFallbackTitle(e.target.value)}
                placeholder="যেমন: আজকের বিশেষ রবিবার প্রার্থনা ও কীর্তন"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {fallbackSourceType === 'link' ? (
              <div className="space-y-1.5">
                <label className="text-[11px] text-stone-300 block font-medium">
                  ভিডিও লিঙ্ক (YouTube / Drive / Web):
                </label>
                <input
                  type="text"
                  value={fallbackUrlInput}
                  onChange={(e) => setFallbackUrlInput(e.target.value)}
                  placeholder="https://youtu.be/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/40 hover:border-amber-500/70 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-amber-500/5"
                >
                  <Upload className="w-6 h-6 mx-auto text-amber-400 mb-2" />
                  <span className="text-xs font-bold text-amber-200 block">
                    {selectedFile ? selectedFile.name : 'গ্যালারি বা ডিভাইস থেকে ভিডিও ফাইল নির্বাচন করুন (MP4, MOV)'}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    ক্লিক করে আপনার ফোনের গ্যালারি থেকে ভিডিও আপলোড করুন
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-amber-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 text-xs font-bold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
