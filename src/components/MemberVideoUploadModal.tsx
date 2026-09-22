import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Video,
  Youtube,
  User,
  Tag as TagIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Play,
  Sparkles,
  Users,
  Clock,
  Upload,
  FileVideo,
  Film,
  Trash2
} from 'lucide-react';
import { MemberVideoItem } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, formatYouTubeWatchUrl } from '../utils/youtubeHelper';
import { generateVideoThumbnail, saveVideoBlob } from '../utils/videoStorageHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';

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
  const [sourceType, setSourceType] = useState<'gallery' | 'youtube'>('gallery');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('ক্লাব সদস্য');
  const [urlInput, setUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFilePreview, setVideoFilePreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('puja');
  const [duration, setDuration] = useState('সদস্য ভিডিও');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectedYouTubeId = extractYouTubeId(urlInput);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('অনুগ্রহ করে একটি সঠিক ভিডিও ফাইল (MP4, WebM, MOV ইত্যাদি) নির্বাচন করুন।');
      return;
    }

    setError('');
    setIsProcessingFile(true);
    setVideoFile(file);

    const objectUrl = URL.createObjectURL(file);
    setVideoFilePreview(objectUrl);

    try {
      const { thumbnailUrl, durationStr } = await generateVideoThumbnail(file);
      if (thumbnailUrl) setThumbnailPreview(thumbnailUrl);
      if (durationStr) setDuration(durationStr);
    } catch (err) {
      console.warn('Thumbnail generation error:', err);
    } finally {
      setIsProcessingFile(false);
    }

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleRemoveSelectedVideo = () => {
    setVideoFile(null);
    if (videoFilePreview) {
      URL.revokeObjectURL(videoFilePreview);
      setVideoFilePreview('');
    }
    setThumbnailPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!authorName.trim()) {
      setError('অনুগ্রহ করে আপনার (সদস্যের) নাম লিখুন।');
      return;
    }

    if (sourceType === 'youtube') {
      if (!urlInput.trim()) {
        setError('অনুগ্রহ করে YouTube ভিডিও বা শর্টস লিংক দিন।');
        return;
      }

      const yId = extractYouTubeId(urlInput);
      if (!yId) {
        setError('সঠিক YouTube ভিডিও লিংক পাওয়া যায়নি। যেমন: https://www.youtube.com/watch?v=... বা https://youtu.be/...');
        return;
      }

      if (!title.trim()) {
        setError('অনুগ্রহ করে ভিডিওটির একটি শিরোনাম দিন।');
        return;
      }

      const newVideo: MemberVideoItem = {
        id: `member-video-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || 'ক্লাব সদস্যের শেয়ার করা বিশেষ মুহূর্ত।',
        authorName: authorName.trim(),
        authorRole: authorRole.trim() || 'ক্লাব সদস্য',
        youtubeId: yId,
        youtubeUrl: formatYouTubeWatchUrl(yId),
        videoType: 'youtube',
        category,
        duration: duration.trim() || 'ভিডিও',
        dateAdded: 'আজ',
        likes: 1,
        isCustom: true,
        createdAt: Date.now()
      };

      onAddVideo(newVideo);
      try {
        await saveClubStoredItem({
          title: title.trim(),
          type: 'video',
          source: 'online',
          url: formatYouTubeWatchUrl(yId),
          authorName: authorName.trim() || 'ক্লাব সদস্য',
          description: description.trim() || 'সদস্যের শেয়ার করা YouTube ভিডিও',
          category
        });
      } catch (e) {
        console.warn('Storage sync warn:', e);
      }
      setSuccess('আপনার ভিডিওটি সফলভাবে সদস্য কর্নারে ও স্থায়ী ডাটা স্টোরেজে যুক্ত হয়েছে!');
    } else {
      // Local gallery video
      if (!videoFile && !videoFilePreview) {
        setError('অনুগ্রহ করে ফোন বা ডিভাইস গ্যালারি থেকে একটি ভিডিও ফাইল বেছে নিন।');
        return;
      }
      if (!title.trim()) {
        setError('অনুগ্রহ করে ভিডিওটির একটি শিরোনাম দিন।');
        return;
      }

      const videoId = `member-video-local-${Date.now()}`;

      if (videoFile) {
        try {
          await saveVideoBlob(videoId, videoFile);
        } catch (storageErr) {
          console.warn('Could not store in IndexedDB:', storageErr);
        }
      }

      const newVideo: MemberVideoItem = {
        id: videoId,
        title: title.trim(),
        description: description.trim() || 'ক্লাব সদস্যের গ্যালারি থেকে শেয়ার করা বিশেষ ভিডিও।',
        authorName: authorName.trim(),
        authorRole: authorRole.trim() || 'ক্লাব সদস্য',
        youtubeId: 'local-member-video',
        youtubeUrl: '',
        videoType: 'local',
        videoFileUrl: videoFilePreview,
        thumbnailUrl: thumbnailPreview,
        category,
        duration: duration.trim() || 'গ্যালারি ভিডিও',
        dateAdded: 'আজ',
        likes: 1,
        isCustom: true,
        createdAt: Date.now()
      };

      onAddVideo(newVideo);
      try {
        await saveClubStoredItem({
          title: title.trim(),
          type: 'video',
          source: 'device',
          url: videoFilePreview,
          thumbnailUrl: thumbnailPreview,
          authorName: authorName.trim() || 'ক্লাব সদস্য',
          description: description.trim() || 'মোবাইল গ্যালারি ভিডিও',
          category
        });
      } catch (e) {
        console.warn('Storage sync warn:', e);
      }
      setSuccess('আপনার গ্যালারি ভিডিওটি সফলভাবে সদস্য কর্নারে ও স্থায়ী ডাটা স্টোরেজে যুক্ত হয়েছে!');
    }

    setTimeout(() => {
      setSuccess('');
      onClose();
      // Reset form
      setAuthorName('');
      setUrlInput('');
      setVideoFile(null);
      setVideoFilePreview('');
      setThumbnailPreview('');
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
        className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden my-8"
      >
        {/* Header Bar */}
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
                নিজের তোলা বা পছন্দের ভিডিও যোগ করুন
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

        {/* Modal Body */}
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

          {/* Member Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>আপনার নাম (সদস্যের নাম) *</span>
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

          {/* Source Type Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 block">
              ভিডিওর উৎস নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-emerald-500/30">
              <button
                type="button"
                onClick={() => setSourceType('gallery')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'gallery'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileVideo className="w-4 h-4" />
                <span>ফোন / গ্যালারি ভিডিও</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('youtube')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'youtube'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube ভিডিও লিংক</span>
              </button>
            </div>
          </div>

          {/* Gallery Video Option */}
          {sourceType === 'gallery' ? (
            <div key="member-video-gallery-container" className="space-y-2">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>ডিভাইস গ্যালারি থেকে ভিডিও ফাইল বাছাই করুন *</span>
              </label>

              <input
                key="member-video-file-input"
                id="member-video-file-input"
                type="file"
                ref={fileInputRef}
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              {videoFilePreview ? (
                <div className="space-y-2 p-3 rounded-2xl bg-black/60 border border-emerald-500/30">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-emerald-500/20">
                    <video
                      src={videoFilePreview}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-white block truncate">
                        {videoFile?.name || 'নির্বাচিত ভিডিও'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        সাইজ: {videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) + ' MB' : ''} • প্রস্তুত
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveSelectedVideo}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ভিডিও বদলান</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-6 text-center bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-inner">
                    <Film className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-stone-200">
                      ফোন বা কম্পিউটার থেকে ভিডিও আপলোড করুন
                    </p>
                    <p className="text-[11px] text-stone-400">
                      পূজার মুহূর্ত, ঢাকের নাচ, আরতি ও আড্ডার ভিডিও
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                    গ্যালারি থেকে বেছে নিন
                  </span>
                </div>
              )}

              {isProcessingFile && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>ভিডিও থাম্বনেইল প্রসেসিং হচ্ছে...</span>
                </div>
              )}
            </div>
          ) : (
            /* YouTube Video Option */
            <div key="member-video-youtube-container" className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube ভিডিও বা শর্টস লিংক *</span>
              </label>
              <input
                key="member-video-youtube-input"
                id="member-video-youtube-input"
                type="text"
                value={urlInput || ""}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />

              {detectedYouTubeId && (
                <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/30 flex items-center gap-3 mt-2">
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-500/20">
                    <img
                      src={getYouTubeThumbnail(detectedYouTubeId)}
                      alt="ভিডিও প্রিভিউ"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ইউটিউব ভিডিও প্রস্তুত
                    </span>
                    <span className="text-stone-400 block truncate mt-0.5 text-[11px]">
                      ভিডিও আইডি: {detectedYouTubeId}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>ভিডিওর শিরোনাম *</span>
            </label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: মহাষ্টমীর অঞ্জলি ও ঢাকের তালে ধুনুচি নৃত্য"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>ক্যাটাগরি</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MEMBER_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-xl text-xs font-medium transition-all text-left truncate ${
                    category === cat.id
                      ? 'bg-emerald-500 text-black font-bold shadow'
                      : 'bg-black/50 text-stone-300 hover:bg-white/5 border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</span>
            </label>
            <textarea
              rows={2}
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ভিডিও সম্পর্কে দু-এক কথা লিখুন..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-emerald-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 resize-none"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>ভিডিও পোস্ট করুন</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
