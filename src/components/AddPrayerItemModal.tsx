import React, { useState, useRef } from 'react';
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
  Upload,
  Link,
  Trash2,
  Sparkles,
  Radio,
  Flame
} from 'lucide-react';
import { PrayerItem } from '../types';
import { parseUniversalMedia, isFacebookVideoUrl } from '../utils/mediaEmbedHelper';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtubeHelper';
import { extractDriveFileId, getDriveDirectImageUrl } from '../utils/driveHelper';
import { sendAppNotification } from '../utils/notificationHelper';
import { saveVideoBlob, generateVideoThumbnail } from '../utils/videoStorageHelper';
import { saveClubStoredItem } from '../utils/clubStorageManager';

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
  const [sourceType, setSourceType] = useState<'link' | 'file'>('link');
  const [title, setTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [authorName, setAuthorName] = useState('11 স্টার ক্লাব প্রার্থনা পরিষদ');
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

    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      setError('অনুগ্রহ করে সঠিক ভিডিও ফাইল (MP4, WebM, MOV ইত্যাদি) নির্বাচন করুন।');
      return;
    }
    if (mediaType === 'audio' && !file.type.startsWith('audio/')) {
      setError('অনুগ্রহ করে সঠিক অডিও ফাইল (MP3, WAV, M4A ইত্যাদি) নির্বাচন করুন।');
      return;
    }

    setError('');
    setSelectedFile(file);
    const objUrl = URL.createObjectURL(file);
    setFilePreview(objUrl);

    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    let mediaSource: 'youtube' | 'facebook' | 'local' | 'drive' = 'local';

    if (sourceType === 'link') {
      if (!urlInput.trim()) {
        setError('অনুগ্রহ করে YouTube, Facebook বা ড্রাইভের লিঙ্ক দিন।');
        return;
      }

      const parsed = parseUniversalMedia(urlInput, mediaType);
      mediaUrl = urlInput.trim();
      embedUrl = parsed.embedUrl;
      thumbnailUrl = parsed.thumbnailUrl || '';

      if (parsed.type === 'youtube') {
        mediaSource = 'youtube';
      } else if (parsed.type === 'facebook') {
        mediaSource = 'facebook';
      } else if (extractDriveFileId(urlInput)) {
        mediaSource = 'drive';
        mediaUrl = getDriveDirectImageUrl(urlInput);
        thumbnailUrl = mediaUrl;
      } else {
        mediaSource = 'local';
      }
    } else {
      // Local File upload
      if (!filePreview || !selectedFile) {
        setError('অনুগ্রহ করে ফাইল নির্বাচন করুন।');
        return;
      }
      mediaUrl = filePreview;
      embedUrl = filePreview;
      thumbnailUrl = '';
      mediaSource = 'local';
    }

    setIsSubmitting(true);

    const itemId = `prayer-item-${Date.now()}`;

    // If local file was uploaded, persist in IndexedDB for permanent playback
    if (sourceType === 'file' && selectedFile) {
      try {
        await saveVideoBlob(itemId, selectedFile);
        if (mediaType === 'video') {
          try {
            const thumb = await generateVideoThumbnail(selectedFile);
            if (thumb?.thumbnailUrl) {
              thumbnailUrl = thumb.thumbnailUrl;
            }
          } catch {
            // thumbnail fallback
          }
        }
      } catch (err) {
        console.warn('Could not save media to IndexedDB:', err);
      }
    }

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
      scheduledTime: '',
      dateAdded: 'আজ',
      isCustom: true
    };

    onAddPrayerItem(newItem);

    // Persist to Permanent Storage
    saveClubStoredItem({
      title: newItem.title,
      type: newItem.type === 'video' ? 'video' : 'audio',
      source: newItem.mediaSource === 'local' ? 'device' : 'online',
      url: newItem.mediaUrl,
      thumbnailUrl: newItem.thumbnailUrl,
      authorName: newItem.authorName,
      description: newItem.description,
      category: 'prayer'
    }).catch(console.warn);

    // Send App notification to all subscribers
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
      // Reset
      setTitle('');
      setUrlInput('');
      setSelectedFile(null);
      setFilePreview('');
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
        {/* Header */}
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
                প্রার্থনা ভিডিও, সঙ্গীত বা ছবি যোগ করুন
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

          {/* Media Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 block">
              মিডিয়ার ধরণ নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-amber-500/30">
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mediaType === 'video'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>ভিডিও (Video)</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('audio')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mediaType === 'audio'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>সঙ্গীত (Audio)</span>
              </button>
            </div>
          </div>

          {/* Source Type (Link vs File) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 block">
              উৎস (Source):
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/60 border border-amber-500/30">
              <button
                type="button"
                onClick={() => setSourceType('link')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  sourceType === 'link'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>YouTube / Facebook / Drive লিঙ্ক</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  sourceType === 'file'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ডিভাইস / ফাইল আপলোড</span>
              </button>
            </div>
          </div>

          {/* Link Input */}
          {sourceType === 'link' ? (
            <div key="prayer-link-container" className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-400" />
                <span>ভিডিও, ফেসবুক ভিডিও বা ড্রাইভ লিংক *</span>
              </label>
              <input
                key="prayer-url-input"
                id="prayer-url-input"
                type="text"
                value={urlInput || ''}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="যেমন: https://youtu.be/... বা Facebook Video URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          ) : (
            /* File Upload Input */
            <div key="prayer-file-container" className="space-y-2">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{mediaType === 'video' ? 'ভিডিও ফাইল' : 'অডিও ফাইল'} বাছাই করুন *</span>
              </label>

              <input
                key="prayer-file-input"
                id="prayer-file-input"
                type="file"
                ref={fileInputRef}
                accept={mediaType === 'video' ? 'video/*' : 'audio/*'}
                onChange={handleFileChange}
                className="hidden"
              />

              {filePreview ? (
                <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-between gap-3">
                  <span className="text-xs text-white truncate">{selectedFile?.name || 'ফাইল প্রস্তুত'}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-2.5 py-1 rounded-lg bg-red-600/80 text-white text-xs font-bold hover:bg-red-600 flex items-center gap-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>মুছুন</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-5 text-center bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-amber-400" />
                  <p className="text-xs font-semibold text-stone-200">
                    ফোন বা কম্পিউটার থেকে {mediaType === 'video' ? 'ভিডিও' : 'গান / অডিও'} ফাইল বেছে নিন
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>প্রার্থনার শিরোনাম / গানের নাম *</span>
            </label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: আগুনের পরশমণি ছোঁয়াও প্রাণে"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Author / Presenter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>উপস্থাপনায় / শিল্পী</span>
            </label>
            <input
              type="text"
              value={authorName || ''}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="যেমন: 11 স্টার ক্লাব প্রার্থনা পরিষদ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Lyrics (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>প্রার্থনার বাণী / লিরিক্স (ঐচ্ছিক)</span>
            </label>
            <textarea
              rows={3}
              value={lyrics || ''}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="প্রার্থনার সম্পূর্ণ কথা বা পদাবলী এখানে লিখতে পারেন..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>প্রার্থনা পোস্ট করুন</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
