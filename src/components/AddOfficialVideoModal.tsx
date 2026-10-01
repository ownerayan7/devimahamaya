import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Tv,
  Youtube,
  Sparkles,
  Radio,
  FileText,
  AlertCircle,
  CheckCircle2,
  Tag as TagIcon,
  Play,
  Link
} from 'lucide-react';
import { VideoItem } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, formatYouTubeWatchUrl } from '../utils/youtubeHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';
import { getDeviceId } from '../utils/deviceHelper';
import { sendAppNotification } from '../utils/notificationHelper';

interface AddOfficialVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: VideoItem) => void;
}

export const AddOfficialVideoModal: React.FC<AddOfficialVideoModalProps> = ({
  isOpen,
  onClose,
  onAddVideo
}) => {
  const [sourceType, setSourceType] = useState<'link' | 'stream'>('stream');
  const [urlInput, setUrlInput] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'puja' | 'work' | 'plantation' | 'social' | 'cultural' | 'memories'>('puja');
  const [duration, setDuration] = useState('অফিসিয়াল ভিডিও');
  const [tag, setTag] = useState('অফিসিয়াল');
  const [thumbnailInputUrl, setThumbnailInputUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
        setError('অনুগ্রহ করে ভিডিওর একটি উপযুক্ত শিরোনাম লিখুন।');
        return;
    }

    if (sourceType === 'link') {
      if (!urlInput.trim()) {
        setError('অনুগ্রহ করে ভিডিও লিঙ্ক দিন।');
        return;
      }

      // Automatic Thumbnail calculation & Video Type Correction
      let calculatedThumbnail = '';
      const ytId = extractYouTubeId(urlInput.trim());
      const isPastedStream = urlInput.trim().includes('.m3u8') || urlInput.trim().includes('cloudflare') || urlInput.trim().includes('bunny');
      const correctedVideoType = isPastedStream ? 'stream' : 'youtube';

      if (ytId) {
        calculatedThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      } else if (isPastedStream) {
        calculatedThumbnail = 'https://framerusercontent.com/images/yHxdiWReVZDcqvytpuT8C65KlaU.jpg?width=1314&height=666';
      } else if (urlInput.trim().includes('facebook.com') || urlInput.trim().includes('fb.watch')) {
        calculatedThumbnail = 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80';
      } else if (urlInput.trim().includes('instagram.com')) {
        calculatedThumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80';
      } else {
        calculatedThumbnail = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80';
      }
      
      const newVideo: VideoItem = {
        id: `custom-video-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || '11 স্টার ক্লাবের অফিসিয়াল ভিডিও সংকলন।',
        videoType: correctedVideoType,
        videoFileUrl: urlInput.trim(), 
        youtubeId: ytId || undefined,
        youtubeUrl: urlInput.trim(),
        thumbnailUrl: calculatedThumbnail,
        category,
        duration: duration.trim() || 'ভিডিও',
        tag: tag.trim() || 'অফিসিয়াল',
        isCustom: true,
        uploaderDeviceId: getDeviceId(),
        createdAt: Date.now()
      };

      onAddVideo(newVideo);
      
      try {
        await saveClubStoredItem({
          title: newVideo.title,
          type: 'video',
          source: 'online',
          url: urlInput.trim(),
          thumbnailUrl: newVideo.thumbnailUrl,
          authorName: 'অ্যাডমিন (অফিসিয়াল ভিডিও)',
          description: newVideo.description,
          category: newVideo.category
        });
      } catch (e) {
        console.warn('Permanent storage sync failed:', e);
      }

      sendAppNotification(
        'নতুন অফিসিয়াল ভিডিও যুক্ত হয়েছে! 🎥',
        `অফিসিয়াল ভিডিও পেজে "${title.trim()}" যুক্ত করা হয়েছে।`,
        'media',
        'videos'
      ).catch(console.warn);

      setSuccess('ভিডিওটি সফলভাবে পেজে ও স্থায়ী স্টোরেজে যুক্ত হয়েছে!');
    } else if (sourceType === 'stream') {
        if (!streamUrl.trim()) {
          setError('অনুগ্রহ করে ভিডিও স্ট্রিমিং URL (HLS M3U8) din।');
          return;
        }

        const videoId = `custom-video-stream-${Date.now()}`;
        const calculatedThumbnail = 'https://framerusercontent.com/images/yHxdiWReVZDcqvytpuT8C65KlaU.jpg?width=1314&height=666';
        
        const newVideo: VideoItem = {
          id: videoId,
          title: title.trim(),
          description: description.trim() || '11 স্টার ক্লাবের অফিসিয়াল স্ট্রিমিং ভিডিও সংকলন।',
          videoType: 'stream',
          videoFileUrl: streamUrl.trim(),
          thumbnailUrl: calculatedThumbnail,
          category,
          duration: 'স্ট্রিমিং ভিডিও',
          tag: tag.trim() || 'স্ট্রিমিং ভিডিও',
          isCustom: true,
          createdAt: Date.now()
        };

        onAddVideo(newVideo);
        
        try {
          await saveClubStoredItem({
            title: title.trim(),
            type: 'video',
            source: 'stream',
            url: streamUrl.trim(),
            thumbnailUrl: calculatedThumbnail,
            authorName: 'অ্যাডমিন (অফিসিয়াল স্ট্রিমিং)',
            description: description.trim() || 'স্ট্রিমিং ভিডিও',
            category
          });
        } catch (e) {
          console.warn('Permanent storage sync failed:', e);
        }

        sendAppNotification(
          'নতুন অফিসিয়াল স্ট্রিমিং ভিডিও যুক্ত হয়েছে! ⚡',
          `অফিসিয়াল ভিডিও পেজে "${title.trim()}" যুক্ত করা হয়েছে।`,
          'media',
          'videos'
        ).catch(console.warn);

        setSuccess('আপনার স্ট্রিমিং ভিডিওটি সফলভাবে যুক্ত হয়েছে!');
    }

    setTimeout(() => {
      setSuccess('');
      onClose();
      setUrlInput('');
      setStreamUrl('');
      setTitle('');
      setDescription('');
      setThumbnailPreview('');
      setThumbnailInputUrl('');
    }, 1200);
  };

  return (
    <div
      id="add-official-video-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden my-12 sm:my-8"
      >
        <div className="relative px-6 py-4 bg-gradient-to-r from-red-950/80 via-amber-950/70 to-stone-900 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>অ্যাডমিন ভিডিও প্যানেল</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                নতুন অফিসিয়াল ভিডিও যোগ করুন
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
            <label className="text-xs font-semibold text-amber-200 block">
              ভিডিওর উৎস নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-amber-500/30">
              <button
                type="button"
                onClick={() => setSourceType('link')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  sourceType === 'link'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Youtube className="w-4 h-4" />
                <span className="truncate">লিঙ্ক</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('stream')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                  sourceType === 'stream'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span className="truncate">Stream</span>
              </button>
            </div>
          </div>

          {sourceType === 'link' ? (
            <div key="official-video-link-container" className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-red-500" />
                <span>ভিডিওর লিঙ্ক *</span>
              </label>
              <input
                type="text"
                value={urlInput || ""}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          ) : (
            <div key="official-video-stream-container" className="space-y-2 p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30">
              <label className="text-xs font-semibold text-purple-200 block mb-2">
                Stream URL (HLS M3U8):
              </label>
              <input
                type="text"
                value={streamUrl || ""}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://customer-xyz.cloudflarestream.com/.../manifest.m3u8"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
              />
              <div className="flex flex-col gap-2 mt-2">
                <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300 hover:text-white underline">Cloudflare Stream</a>
                <a href="https://bunny.net/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300 hover:text-white underline">Bunny Stream</a>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>ভিডিওর শিরোনাম *</span>
            </label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="শিরোনাম লিখুন"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-stone-300 text-xs font-semibold">বাতিল</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs">ভিডিও যোগ করুন</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
