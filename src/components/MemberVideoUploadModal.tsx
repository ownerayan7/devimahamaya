import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Youtube,
  User,
  Tag as TagIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Play,
  Sparkles,
  Users,
  Radio
} from 'lucide-react';
import { MemberVideoItem } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, formatYouTubeWatchUrl } from '../utils/youtubeHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';
import { getDeviceId } from '../utils/deviceHelper';
import { sendAppNotification } from '../utils/notificationHelper';

interface MemberVideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: MemberVideoItem) => void;
}

const MEMBER_ROLES = [
  'ক্লাব সদস্য',
  'পূজা কর্মী',
  'স্বেচ্ছাসেবক',
  'সাংস্কৃতিক কর্মী',
  'পাড়ার বাসিন্দা',
  'শুভানুধ্যায়ী / ভক্ত'
];

const MEMBER_CATEGORIES = [
  { id: 'puja', label: '🪔 দুর্গোৎসব ও পূজার মুহূর্ত' },
  { id: 'work', label: '🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব' },
  { id: 'plantation', label: '🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা' },
  { id: 'social', label: '❤️ রক্তদান ও সমাজসেবা' },
  { id: 'cultural', label: '🎨 সাংস্কৃতিক অনুষ্ঠান' },
  { id: 'memories', label: '👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি' }
];

export const MemberVideoUploadModal: React.FC<MemberVideoUploadModalProps> = ({
  isOpen,
  onClose,
  onAddVideo
}) => {
  const [sourceType, setSourceType] = useState<'link' | 'stream'>('stream');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('ক্লাব সদস্য');
  const [urlInput, setUrlInput] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('puja');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!authorName.trim()) {
      setError('অনুগ্রহ করে আপনার (সদস্যের) নাম লিখুন।');
      return;
    }
    if (!title.trim()) {
      setError('অনুগ্রহ করে ভিডিওটির একটি শিরোনাম দিন।');
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
      const lowerUrl = urlInput.trim().toLowerCase();
      const isPastedStream = lowerUrl.includes('m3u8') || lowerUrl.includes('cloudflare') || lowerUrl.includes('bunny') || lowerUrl.includes('hls') || lowerUrl.includes('/stream');
      const correctedVideoType = isPastedStream ? 'stream' : (ytId ? 'youtube' : 'local');

      if (ytId) {
        calculatedThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      } else if (isPastedStream) {
        calculatedThumbnail = 'https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg';
      } else if (urlInput.trim().includes('facebook.com') || urlInput.trim().includes('fb.watch')) {
        calculatedThumbnail = 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80';
      } else if (urlInput.trim().includes('instagram.com')) {
        calculatedThumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80';
      } else {
        calculatedThumbnail = 'https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg';
      }
      
      const newVideo: MemberVideoItem = {
        id: `member-video-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'ক্লাব সদস্যের শেয়ার করা বিশেষ মুহূর্ত।',
        authorName: authorName.trim(),
        authorRole: authorRole.trim() || 'ক্লাব সদস্য',
        youtubeId: ytId || 'link-member-video',
        youtubeUrl: urlInput.trim(),
        videoType: correctedVideoType,
        videoFileUrl: urlInput.trim(),
        thumbnailUrl: calculatedThumbnail,
        category,
        dateAdded: 'আজ',
        likes: 1,
        isCustom: true,
        uploaderDeviceId: getDeviceId(),
        createdAt: Date.now()
      };

      onAddVideo(newVideo);
      try {
        await saveClubStoredItem({
          title: title.trim(),
          type: 'video',
          source: 'online',
          url: urlInput.trim(),
          thumbnailUrl: calculatedThumbnail,
          authorName: authorName.trim() || 'ক্লাব সদস্য',
          description: description.trim() || 'sਦস্যর শেয়ার করা ভিডিও',
          category
        });
      } catch (e) {
        console.warn('Storage sync warn:', e);
      }

      sendAppNotification(
        'সদস্যের নতুন ভিডিও শেয়ার! 👥',
        `সদস্য কর্নারে "${authorName.trim()}" একটি ভিডিও পোস্ট করেছেন।`,
        'media',
        'videos'
      ).catch(console.warn);

      setSuccess('আপনার ভিডিওটি সফলভাবে সদস্য কর্নারে ও স্থায়ী ডাটা স্টোরেজে যুক্ত হয়েছে!');
    } else if (sourceType === 'stream') {
        if (!streamUrl.trim()) {
          setError('অনুগ্রহ করে ভিডিও স্ট্রিমিং URL (HLS M3U8) দিন।');
          return;
        }

        const videoId = `member-video-stream-${Date.now()}`;
        const calculatedThumbnail = 'https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg';
        
        const newVideo: MemberVideoItem = {
          id: videoId,
          title: title.trim(),
          description: description.trim() || 'ক্লাব সদস্যের শেয়ার করা বিশেষ স্ট্রিমিং ভিডিও।',
          authorName: authorName.trim(),
          authorRole: authorRole.trim() || 'ক্লাব সদস্য',
          youtubeId: 'stream-member-video',
          youtubeUrl: streamUrl.trim(),
          videoType: 'stream',
          videoFileUrl: streamUrl.trim(),
          thumbnailUrl: calculatedThumbnail,
          category,
          dateAdded: 'আজ',
          likes: 1,
          isCustom: true,
          uploaderDeviceId: getDeviceId(),
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
            authorName: authorName.trim() || 'ক্লাব সদস্য',
            description: description.trim() || 'স্ট্রিমিং ভিডিও',
            category
          });
        } catch (e) {
          console.warn('Persistent storage sync warn:', e);
        }

        sendAppNotification(
          'সদস্যের নতুন স্ট্রিমিং ভিডিও! 👥⚡',
          `সদস্য কর্নারে "${authorName.trim()}" একটি নতুন স্ট্রিমিং ভিডিও শেয়ার করেছেন।`,
          'media',
          'videos'
        ).catch(console.warn);

        setSuccess('আপনার স্ট্রিমিং ভিডিওটি সফলভাবে যুক্ত হয়েছে!');
    }

    setTimeout(() => {
      setSuccess('');
      onClose();
      setAuthorName('');
      setUrlInput('');
      setStreamUrl('');
      setTitle('');
      setDescription('');
    }, 1200);
  };

  return (
    <div
      id="member-video-upload-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden my-12 sm:my-8"
      >
        <div className="relative px-6 py-4 bg-gradient-to-r from-emerald-950/80 via-stone-900 to-stone-950 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>সদস্যদের কর্নার</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                আপনার পছন্দের ভিডিও যোগ করুন
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>আপনার নাম *</span>
              </label>
              <input
                type="text"
                value={authorName || ""}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="যেমন: অয়ন বেরা"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>পদবী বা ভূমিকা</span>
              </label>
              <select
                value={authorRole || ""}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
              >
                {MEMBER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 block">
              ভিডিওর উৎস নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-emerald-500/30">
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
            <div key="member-video-link-container" className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>ভিডিওর লিঙ্ক *</span>
              </label>
              <input
                type="text"
                value={urlInput || ""}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          ) : (
            <div key="member-video-stream-container" className="space-y-2 p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30">
              <label className="text-xs font-semibold text-purple-200 block mb-2">
                Stream URL (HLS M3U8):
              </label>
              <input
                type="text"
                value={streamUrl || ""}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://customer-xyz.cloudflarestream.com/.../manifest.m3u8"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
              <div className="flex flex-col gap-2 mt-2">
                <a href="https://dash.cloudflare.com/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300 hover:text-white underline">Cloudflare Stream</a>
                <a href="https://bunny.net/" target="_blank" rel="noopener noreferrer" className="text-[11px] text-purple-300 hover:text-white underline">Bunny Stream</a>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>ভিডিওর শিরোনাম *</span>
            </label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="শিরোনাম লিখুন"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>ক্যাটাগরি</span>
            </label>
            <select
              value={category || ""}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-400"
            >
              {MEMBER_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/5 text-stone-300 text-xs font-semibold">বাতিল</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs">ভিডিও পোস্ট করুন</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
