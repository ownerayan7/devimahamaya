import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Music,
  Youtube,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Radio
} from 'lucide-react';
import { RabindraSongItem } from '../types';
import { parseUniversalMedia } from '../utils/mediaEmbedHelper';
import { sendAppNotification } from '../utils/notificationHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';

interface AddRabindraSangeetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: RabindraSongItem) => void;
}

export const AddRabindraSangeetModal: React.FC<AddRabindraSangeetModalProps> = ({
  isOpen,
  onClose,
  onAddSong
}) => {
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('অনুগ্রহ করে গানের শিরোনাম লিখুন।');
      return;
    }

    if (!urlInput.trim()) {
      setError('অনুগ্রহ করে YouTube বা Facebook ভিডিওর লিঙ্ক দিন।');
      return;
    }

    const parsed = parseUniversalMedia(urlInput, 'video');
    const mediaUrl = urlInput.trim();
    const embedUrl = parsed.embedUrl;
    const thumbnailUrl = parsed.thumbnailUrl || '';
    const chosenMediaType: 'youtube' | 'facebook' = parsed.type === 'facebook' ? 'facebook' : 'youtube';

    setIsSubmitting(true);

    const newSong: RabindraSongItem = {
      id: `rabindra-song-${Date.now()}`,
      title: title.trim(),
      category: 'general',
      categoryBengali: 'রবীন্দ্র সঙ্গীত',
      mediaType: chosenMediaType,
      mediaUrl,
      embedUrl: embedUrl || mediaUrl,
      thumbnailUrl,
      artist: artist.trim() || 'রবীন্দ্রনাথ ঠাকুর',
      duration: 'রবীন্দ্র সঙ্গীত',
      description: description.trim() || '11 স্টার ক্লাব রবীন্দ্র সঙ্গীত।',
      lyrics: '',
      isCustom: true
    };

    onAddSong(newSong);

    // Persist to Permanent Storage
    saveClubStoredItem({
      title: newSong.title,
      type: 'audio',
      source: 'online',
      url: newSong.mediaUrl,
      authorName: newSong.artist,
      description: newSong.description,
      category: 'rabindra-sangeet'
    }).catch(console.warn);

    // Send automatic notification
    sendAppNotification(
      `নতুন রবীন্দ্র সঙ্গীত যুক্ত হয়েছে: ${newSong.title}`,
      `11 স্টার ক্লাবের রবীন্দ্র সঙ্গীত বিভাগে নতুন গান প্রকাশিত হয়েছে।`,
      'music',
      'rabindra-sangeet'
    );

    setSuccess('রবীন্দ্র সঙ্গীত সফলভাবে যুক্ত হয়েছে!');

    setTimeout(() => {
      setSuccess('');
      setIsSubmitting(false);
      onClose();
      // Reset
      setTitle('');
      setUrlInput('');
      setArtist('');
      setDescription('');
    }, 1000);
  };

  return (
    <div
      id="add-rabindra-sangeet-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl bg-[#140c06] border border-amber-500/40 shadow-2xl overflow-hidden my-8 text-stone-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950 via-[#1f1008] to-[#140804] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Music className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>অ্যাডমিন প্রকাশনা</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                রবীন্দ্র সঙ্গীত যোগ করুন
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>গানের শিরোনাম *</span>
            </label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: আনন্দলোকে মঙ্গলালোকে বিরাজ সত্যসুন্দর"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Artist */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>শিল্পী / পরিবেশক (ঐচ্ছিক)</span>
            </label>
            <input
              type="text"
              value={artist || ''}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="যেমন: হেমন্ত মুখোপাধ্যায় / কণিকা বন্দ্যোপাধ্যায়"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* YouTube / Facebook Link Input */}
          <div key="sangeet-link-container" className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-400" />
              <span>ভিডিও লিংক (YouTube / Facebook) *</span>
            </label>
            <input
              key="sangeet-url-input"
              id="sangeet-url-input"
              type="text"
              value={urlInput || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://youtu.be/... অথবা Facebook video URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 block">
              বিবরণ (ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              value={description || ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="গানটি সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 text-xs font-semibold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>গান প্রকাশ করুন</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
