import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Video,
  Music,
  Youtube,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Radio,
  Flame,
  Link,
  Upload
} from 'lucide-react';
import { PrayerItem } from '../types';
import { parseUniversalMedia } from '../utils/mediaEmbedHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';
import { sendAppNotification } from '../utils/notificationHelper';

interface AddPrayerItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrayerItem: (item: PrayerItem) => void;
}

export const AddPrayerItemModal: React.FC<AddPrayerItemModalProps> = ({
  isOpen,
  onClose,
  onAddPrayerItem
}) => {
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');
  const [sourceType, setSourceType] = useState<'link' | 'stream'>('link');
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [authorName, setAuthorName] = useState('11 স্টার ক্লাব প্রার্থনা পরিষদ');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('অনুগ্রহ করে প্রার্থনার শিরোনাম বা গানের নাম লিখুন।');
      return;
    }

    let mediaUrl = '';
    let embedUrl = '';
    let thumbnailUrl = '';
    let mediaSource: 'youtube' | 'facebook' | 'local' = 'local';

    if (sourceType === 'link') {
      if (!urlInput.trim()) {
        setError('অনুগ্রহ করে লিঙ্ক দিন।');
        return;
      }
      const parsed = parseUniversalMedia(urlInput, mediaType);
      const isPastedStream = urlInput.trim().includes('.m3u8') || urlInput.trim().includes('cloudflare') || urlInput.trim().includes('bunny');
      
      mediaUrl = urlInput.trim();
      embedUrl = isPastedStream ? urlInput.trim() : parsed.embedUrl;
      thumbnailUrl = parsed.thumbnailUrl || '';
      mediaSource = isPastedStream ? 'local' : (parsed.type === 'youtube' ? 'youtube' : 'facebook');

      if (!thumbnailUrl) {
        if (isPastedStream) {
          thumbnailUrl = 'https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg';
        } else if (urlInput.trim().includes('facebook.com') || urlInput.trim().includes('fb.watch')) {
          thumbnailUrl = 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80';
        } else if (urlInput.trim().includes('instagram.com')) {
          thumbnailUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80';
        } else {
          thumbnailUrl = 'https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg';
        }
      }
    } else {
        if (!streamUrl.trim()) {
          setError('অনুগ্রহ করে ভিডিও স্ট্রিমিং URL (HLS M3U8) দিন।');
          return;
        }
        mediaUrl = streamUrl.trim();
        embedUrl = streamUrl.trim();
        mediaSource = 'local';
        thumbnailUrl = 'https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg';
    }

    setIsSubmitting(true);

    const itemId = `prayer-item-${Date.now()}`;

    const newItem: PrayerItem = {
      id: itemId,
      title: title.trim(),
      type: mediaType,
      mediaSource,
      mediaUrl,
      embedUrl: embedUrl || mediaUrl,
      thumbnailUrl,
      description: description.trim() || '11 স্টার ক্লাবের বিশেষ প্রার্থনা।',
      lyrics: lyrics.trim(),
      authorName: authorName.trim() || '11 স্টার ক্লাব প্রার্থনা পরিষদ',
      dateAdded: 'আজ',
      isCustom: true
    };

    onAddPrayerItem(newItem);

    try {
      await saveClubStoredItem({
        title: newItem.title,
        type: newItem.type === 'video' ? 'video' : 'audio',
        source: newItem.mediaSource === 'local' ? 'device' : 'online',
        url: newItem.mediaUrl,
        thumbnailUrl: newItem.thumbnailUrl,
        authorName: newItem.authorName,
        description: newItem.description,
        category: 'prayer'
      });
    } catch (e) {
        console.warn('Permanent storage sync failed:', e);
    }

    sendAppNotification(
      `নতুন প্রার্থনা যুক্ত হয়েছে: ${newItem.title}`,
      `প্রার্থনার জন্য নতুন ${mediaType === 'video' ? 'ভিডিও' : 'সঙ্গীত'} পোস্ট করা হয়েছে।`,
      'prayer',
      'prayer'
    );

    setSuccess('প্রার্থনা সফলভাবে প্রকাশিত ও যুক্ত হয়েছে!');

    setTimeout(() => {
      setSuccess('');
      setIsSubmitting(false);
      onClose();
      setTitle('');
      setUrlInput('');
      setStreamUrl('');
      setDescription('');
      setLyrics('');
    }, 1200);
  };

  return (
    <div
      id="add-prayer-item-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-[#18100a] via-[#120a06] to-black border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden my-8 text-stone-200"
      >
        <div className="relative px-6 py-4 bg-gradient-to-r from-amber-950/90 via-[#22130a] to-[#140804] border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>অ্যাডমিন প্রার্থনা প্রকাশনা</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                প্রার্থনা ভিডিও বা সঙ্গীত যোগ করুন
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 block">মিডিয়ার ধরণ:</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-amber-500/30">
              <button type="button" onClick={() => setMediaType('video')} className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${mediaType === 'video' ? 'bg-amber-500 text-black shadow-md' : 'text-stone-300'}`}><Video className="w-3.5 h-3.5" /> <span>ভিডিও</span></button>
              <button type="button" onClick={() => setMediaType('audio')} className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${mediaType === 'audio' ? 'bg-amber-500 text-black shadow-md' : 'text-stone-300'}`}><Music className="w-3.5 h-3.5" /> <span>সঙ্গীত</span></button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 block">উৎস (Source):</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-amber-500/30">
              <button type="button" onClick={() => setSourceType('link')} className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${sourceType === 'link' ? 'bg-amber-600 text-white shadow' : 'text-stone-300'}`}><Link className="w-3.5 h-3.5" /> <span>লিঙ্ক</span></button>
              <button type="button" onClick={() => setSourceType('stream')} className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${sourceType === 'stream' ? 'bg-purple-700 text-white shadow' : 'text-stone-300'}`}><Radio className="w-3.5 h-3.5" /> <span>Stream</span></button>
            </div>
          </div>

          {sourceType === 'link' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-amber-400" />
                <span>লাইভ ভিডিও বা স্ট্রিম লিঙ্ক (YouTube Live / Facebook Live / Embed URL): *</span>
              </label>
              <input type="text" value={urlInput || ''} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs" />
            </div>
          ) : (
            <div className="space-y-2 p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30">
              <label className="text-xs font-semibold text-purple-200 block mb-2">Stream URL (HLS M3U8):</label>
              <input type="text" value={streamUrl || ""} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://customer-xyz.cloudflarestream.com/.../manifest.m3u8" className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-500/30 text-white text-xs" />
              <div className="flex flex-col gap-2 mt-2">
                <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300 underline">Cloudflare Stream</a>
                <a href="https://bunny.net/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300 underline">Bunny Stream</a>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>প্রার্থনার শিরোনাম *</span>
            </label>
            <input type="text" value={title || ''} onChange={(e) => setTitle(e.target.value)} placeholder="শিরোনাম" className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs" />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-stone-300 text-xs font-semibold">বাতিল</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs">প্রার্থনা পোস্ট করুন</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
