import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  Tv,
  Youtube,
  Sparkles,
  Radio,
  Clock,
  Tag as TagIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Play,
  Upload,
  Film,
  Trash2,
  FileVideo
} from 'lucide-react';
import { VideoItem } from '../types';
import { extractYouTubeId, getYouTubeThumbnail, formatYouTubeWatchUrl } from '../utils/youtubeHelper';
import { generateVideoThumbnail, saveVideoBlob } from '../utils/videoStorageHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';

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
  const [sourceType, setSourceType] = useState<'gallery' | 'youtube'>('gallery');
  const [urlInput, setUrlInput] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFilePreview, setVideoFilePreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'puja' | 'work' | 'plantation' | 'social' | 'cultural' | 'memories'>('puja');
  const [duration, setDuration] = useState('গ্যালারি ভিডিও');
  const [tag, setTag] = useState('অফিসিয়াল');
  const [thumbnailInputUrl, setThumbnailInputUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const detectedYouTubeId = extractYouTubeId(urlInput);

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('অনুগ্রহ করে একটি সঠিক ছবি ফাইল (JPG, PNG ইত্যাদি) নির্বাচন করুন।');
      return;
    }

    const objUrl = URL.createObjectURL(file);
    setThumbnailPreview(objUrl);
    setThumbnailInputUrl(objUrl);
  };

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

    // Auto-generate video thumbnail & calculate duration
    try {
      const { thumbnailUrl, durationStr } = await generateVideoThumbnail(file);
      if (thumbnailUrl) {
        setThumbnailPreview(thumbnailUrl);
      }
      if (durationStr) {
        setDuration(durationStr);
      }
    } catch (err) {
      console.warn('Thumbnail generation error:', err);
    } finally {
      setIsProcessingFile(false);
    }

    // Auto-suggest title if empty
    if (!title.trim()) {
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanFileName);
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

    if (sourceType === 'youtube') {
      if (!urlInput.trim()) {
        setError('অনুগ্রহ করে YouTube ভিডিও লিংক দিন।');
        return;
      }
      const yId = extractYouTubeId(urlInput);
      if (!yId) {
        setError('সঠিক YouTube ভিডিও লিংক পাওয়া যায়নি।');
        return;
      }
      if (!title.trim()) {
        setError('অনুগ্রহ করে ভিডিওর একটি উপযুক্ত শিরোনাম লিখুন।');
        return;
      }

      const newVideo: VideoItem = {
        id: `custom-video-${Date.now()}`,
        title: title.trim(),
        description: description.trim() || '11 স্টার ক্লাবের অফিসিয়াল ভিডিও সংকলন।',
        youtubeId: yId,
        youtubeUrl: formatYouTubeWatchUrl(yId),
        videoType: 'youtube',
        thumbnailUrl: thumbnailPreview || getYouTubeThumbnail(yId),
        category,
        duration: duration.trim() || 'ভিডিও',
        tag: tag.trim() || 'অফিসিয়াল',
        isCustom: true,
        createdAt: Date.now()
      };

      onAddVideo(newVideo);
      
      // Persist to Permanent Storage
      try {
        await saveClubStoredItem({
          title: newVideo.title,
          type: 'video',
          source: 'online',
          url: newVideo.youtubeUrl || '',
          thumbnailUrl: newVideo.thumbnailUrl,
          authorName: 'অ্যাডমিন (অফিসিয়াল YouTube)',
          description: newVideo.description,
          category: newVideo.category
        });
      } catch (e) {
        console.warn('Permanent storage sync failed:', e);
      }

      setSuccess('YouTube ভিডিওটি সফলভাবে পেজে ও স্থায়ী স্টোরেজে যুক্ত হয়েছে!');
    } else {
      // Gallery Video
      if (!videoFile && !videoFilePreview) {
        setError('অনুগ্রহ করে ফোন বা ডিভাইস গ্যালারি থেকে একটি ভিডিও ফাইল নির্বাচন করুন।');
        return;
      }
      if (!title.trim()) {
        setError('অনুগ্রহ করে ভিডিওর একটি শিরোনাম লিখুন।');
        return;
      }

      const videoId = `custom-video-local-${Date.now()}`;

      // Save binary blob to IndexedDB for persistent in-browser playback
      if (videoFile) {
        try {
          await saveVideoBlob(videoId, videoFile);
        } catch (storageErr) {
          console.warn('Could not store in IndexedDB:', storageErr);
        }
      }

      const newVideo: VideoItem = {
        id: videoId,
        title: title.trim(),
        description: description.trim() || '11 স্টার ক্লাবের অফিসিয়াল গ্যালারি ভিডিও সংকলন।',
        videoType: 'local',
        videoFileUrl: videoFilePreview,
        thumbnailUrl: thumbnailPreview,
        category,
        duration: duration.trim() || 'গ্যালারি ভিডিও',
        tag: tag.trim() || 'গ্যালারি ভিডিও',
        isCustom: true,
        createdAt: Date.now()
      };

      onAddVideo(newVideo);

      // Persist to Permanent Storage
      try {
        await saveClubStoredItem({
          title: newVideo.title,
          type: 'video',
          source: 'device',
          url: newVideo.videoFileUrl || '',
          thumbnailUrl: newVideo.thumbnailUrl,
          authorName: 'অ্যাডমিন (অফিসিয়াল গ্যালারি)',
          description: newVideo.description,
          category: newVideo.category
        });
      } catch (e) {
        console.warn('Permanent storage sync failed:', e);
      }

      setSuccess('গ্যালারি ভিডিওটি সফলভাবে পেজে ও স্থায়ী স্টোরেজে যুক্ত হয়েছে!');
    }

    setTimeout(() => {
      setSuccess('');
      onClose();
      // Reset form
      setUrlInput('');
      setVideoFile(null);
      setVideoFilePreview('');
      setThumbnailPreview('');
      setThumbnailInputUrl('');
      setTitle('');
      setDescription('');
      setDuration('গ্যালারি ভিডিও');
      setTag('অফিসিয়াল');
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
        className="w-full max-w-xl rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden my-8"
      >
        {/* Header Bar */}
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

          {/* Source Type Selector Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 block">
              ভিডিওর উৎস নির্বাচন করুন (Source):
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-amber-500/30">
              <button
                type="button"
                onClick={() => setSourceType('gallery')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'gallery'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileVideo className="w-4 h-4" />
                <span>ফোন / ডিভাইস গ্যালারি</span>
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

          {/* GALLERY VIDEO UPLOAD OPTION */}
          {sourceType === 'gallery' ? (
            <div key="official-video-gallery-container" className="space-y-2">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>ফোন বা কম্পিউটার গ্যালারি থেকে ভিডিও ফাইল নির্বাচন করুন *</span>
              </label>

              <input
                key="official-video-file-input"
                id="official-video-file-input"
                type="file"
                ref={fileInputRef}
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              {videoFilePreview ? (
                <div className="space-y-2 p-3 rounded-2xl bg-black/60 border border-amber-500/30">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-amber-500/20">
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
                        সাইজ: {videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) + ' MB' : ''} • প্লেয়ার তৈরি সম্পন্ন
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
                  className="cursor-pointer border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-6 text-center bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                    <Film className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-stone-200">
                      ফোন গ্যালারি থেকে ভিডিও ফাইল আপলোড করুন
                    </p>
                    <p className="text-[11px] text-stone-400">
                      MP4, WebM, MOV ফরম্যাট সমর্থিত • সরাসরি প্লেয়ারে চালু হবে
                    </p>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                    গ্যালারি থেকে ফাইল বেছে নিন
                  </span>
                </div>
              )}

              {isProcessingFile && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>ভিডিও থাম্বনেইল তৈরি হচ্ছে...</span>
                </div>
              )}
            </div>
          ) : (
            /* YOUTUBE LINK INPUT OPTION */
            <div key="official-video-youtube-container" className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube ভিডিও বা লাইভ স্ট্রিম লিংক *</span>
              </label>
              <input
                key="official-video-youtube-input"
                id="official-video-youtube-input"
                type="text"
                value={urlInput || ""}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
              />
              <p className="text-[11px] text-stone-400">
                ইউটিউব লাইভ লিংক, রেগুলার ভিডিও কিংবা শর্টস লিংক পেস্ট করতে পারেন।
              </p>

              {detectedYouTubeId && (
                <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center gap-3 mt-2">
                  <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-amber-500/20">
                    <img
                      src={getYouTubeThumbnail(detectedYouTubeId)}
                      alt="ভিডিও থাম্বনেইল প্রিভিউ"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ইউটিউব ভিডিও শনাক্ত হয়েছে
                    </span>
                    <span className="text-stone-400 block truncate mt-0.5 text-[11px]">
                      ভিডিও আইডি: {detectedYouTubeId}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Front Page / Thumbnail Picture Section */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-black/50 border border-amber-500/30">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>ভিডিওর ফ্রন্ট পেজ / থাম্বনেইল ছবি (ঐচ্ছিক কাস্টম ছবি)</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Preview thumbnail */}
              <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black border border-amber-500/35 shrink-0 flex items-center justify-center">
                <img
                  src={
                    thumbnailPreview ||
                    (detectedYouTubeId ? getYouTubeThumbnail(detectedYouTubeId) : 'https://images.unsplash.com/photo-1543794352-78d122cd796e?w=400&q=80')
                  }
                  alt="Front page preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">ফ্রন্ট পেজ</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={thumbnailInputUrl || ''}
                  onChange={(e) => {
                    setThumbnailInputUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setThumbnailPreview(e.target.value.trim());
                    }
                  }}
                  placeholder="ছবির সরাসরি URL দিন (অথবা নিচে ফাইল আপলোড করুন)"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    accept="image/*"
                    onChange={handleThumbnailFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে থাম্বনেইল ছবি আপলোড করুন</span>
                  </button>

                  {thumbnailPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailPreview('');
                        setThumbnailInputUrl('');
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/40 text-xs font-semibold transition-colors"
                    >
                      মুছুন
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>ভিডিওর শিরোনাম *</span>
            </label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: শারদীয়া দুর্গোৎসব লাইভ আরতি ও মণ্ডপ পরিক্রমা"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          {/* Category & Duration/Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>ক্যাটাগরি</span>
              </label>
              <select
                value={category || ""}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="puja">🪔 দুর্গোৎসব ও পূজার মুহূর্ত</option>
                <option value="work">🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব</option>
                <option value="plantation">🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা</option>
                <option value="social">❤️ রক্তদান ও সমাজসেবা</option>
                <option value="cultural">🎨 সাংস্কৃতিক অনুষ্ঠান</option>
                <option value="memories">👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>সময় বা ব্যাজ (Duration / Badge)</span>
              </label>
              <input
                type="text"
                value={duration || ""}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="যেমন: লাইভ সম্প্রচার, ০৩:৪৫ মিনিট"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>সংক্ষিপ্ত বিবরণ</span>
            </label>
            <textarea
              rows={2}
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ভিডিও সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>অফিসিয়াল ভিডিও যোগ করুন</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
