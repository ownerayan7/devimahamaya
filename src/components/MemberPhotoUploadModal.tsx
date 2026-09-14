import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Camera,
  User,
  Tag,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';
import { MemberPhotoItem } from '../types';
import { getDriveDirectImageUrl } from '../utils/driveHelper';
import { getAppStorage } from '../lib/firebase';
import { optimizeImage } from '../utils/imageOptimizer';

interface MemberPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhoto: (photo: MemberPhotoItem) => void;
}

const ROLE_SUGGESTIONS = [
  'ক্লাব সদস্য',
  'পূজা কর্মী',
  'সবুজায়ন কর্মী',
  'সাংস্কৃতিক কর্মী',
  'পাড়ার বাসিন্দা',
  'শুভানুধ্যায়ী / ভক্ত',
];

const CATEGORY_OPTIONS = [
  { id: 'puja', label: '🪔 দুর্গোৎসব ও পূজার মুহূর্ত' },
  { id: 'work', label: '🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব' },
  { id: 'plantation', label: '🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা' },
  { id: 'social', label: '❤️ রক্তদান ও সমাজসেবা' },
  { id: 'cultural', label: '🎨 সাংস্কৃতিক অনুষ্ঠান' },
  { id: 'memories', label: '👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি' },
];

export const MemberPhotoUploadModal: React.FC<MemberPhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onAddPhoto,
}) => {
  const [tab, setTab] = useState<'upload' | 'link'>('upload');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('ক্লাব সদস্য');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('puja');
  const [year, setYear] = useState('২০২৪');
  const [tag, setTag] = useState('সদস্যদের স্মৃতি');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP ইত্যাদি) নির্বাচন করুন।');
      return;
    }

    setErrorMsg('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setPreviewUrl(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLinkChange = (val: string) => {
    setLinkInput(val);
    setErrorMsg('');
    if (val.trim()) {
      const direct = getDriveDirectImageUrl(val.trim());
      setPreviewUrl(direct);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsUploading(true);

    if (!title.trim()) {
      setErrorMsg('অনুগ্রহ করে ছবির একটি সুন্দর শিরোনাম দিন।');
      setIsUploading(false);
      return;
    }

    let finalImageUrl = '';
    if (tab === 'upload') {
      if (!imageFile) {
        setErrorMsg('অনুগ্রহ করে আপনার ডিভাইস থেকে একটি ছবি সিলেক্ট করুন।');
        setIsUploading(false);
        return;
      }
      try {
        // First optimize and compress image to high-efficiency webp/jpeg (<150KB)
        const compressedBase64 = await optimizeImage(imageFile, 1280, 1280, 0.82);
        
        // Check if Firebase Storage is available
        const appStorage = getAppStorage();
        if (appStorage) {
          try {
            const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
            const storageRef = ref(appStorage, `memberPhotos/${Date.now()}_${imageFile.name.replace(/\.[^/.]+$/, '')}.webp`);
            const snapshot = await uploadString(storageRef, compressedBase64, 'data_url');
            finalImageUrl = await getDownloadURL(snapshot.ref);
          } catch (storageErr) {
            console.warn('Storage upload fallback to compressed base64:', storageErr);
            finalImageUrl = compressedBase64;
          }
        } else {
          finalImageUrl = compressedBase64;
        }
      } catch (e) {
        console.error('Image processing failed:', e);
        setErrorMsg('ছবি প্রক্রিয়াকরণ করতে সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
        setIsUploading(false);
        return;
      }
    } else {
      if (!linkInput.trim()) {
        setErrorMsg('অনুগ্রহ করে ছবির লিঙ্ক বা গুগল ড্রাইভ লিঙ্ক দিন।');
        setIsUploading(false);
        return;
      }
      finalImageUrl = getDriveDirectImageUrl(linkInput.trim());
    }

    const newPhoto: MemberPhotoItem = {
      id: 'mem-' + Date.now(),
      title: title.trim(),
      caption: caption.trim() || undefined,
      authorName: authorName.trim() || undefined,
      authorRole: authorRole.trim() || undefined,
      url: finalImageUrl,
      category,
      tag: tag.trim() || 'সদস্যদের ছবি',
      year: year.trim() || '২০২৬',
      dateAdded: new Date().toLocaleDateString('bn-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      likes: 1,
      isCustom: true,
    };

    onAddPhoto(newPhoto);
    setSuccessMsg('আপনার তোলা ছবিটি সফলভাবে সদস্য গ্যালারিতে যুক্ত হয়েছে!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      id="member-photo-upload-modal"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-6 rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                উন্মুক্ত সদস্য গ্যালারি • কোনো পাসওয়ার্ড প্রয়োজন নেই
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white">
                সদস্য হিসেবে ছবি ও স্মৃতি শেয়ার করুন
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Contributor Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-stone-300 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>আপনার নাম (ঐচ্ছিক)</span>
              </label>
              <input
                type="text"
                value={authorName || ""}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="নিজের নাম লিখুন অথবা ফাঁকা রাখতে পারেন (ঐচ্ছিক)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-emerald-400 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-stone-300 font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>আপনার পরিচয় / পদবী</span>
              </label>
              <input
                type="text"
                value={authorRole || ""}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="যেমন: ক্লাব সদস্য / ভক্ত"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          {/* Quick role presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-stone-400">দ্রুত বেছে নিন:</span>
            {ROLE_SUGGESTIONS.map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setAuthorRole(r)}
                className={`px-2 py-0.5 rounded-lg text-[10px] transition-colors ${
                  authorRole === r
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-semibold'
                    : 'bg-white/5 text-stone-400 hover:text-white border border-white/10'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Title and Category */}
          <div className="space-y-1.5">
            <label className="block text-stone-300 font-semibold">
              ছবির শিরোনাম (Title) *
            </label>
            <input
              type="text"
              required
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: মহাষ্টমীর সন্ধ্যায় বন্ধুদের সাথে মণ্ডপ চত্বরে"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Category & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-stone-300 font-semibold">
                ক্যাটাগরি
              </label>
              <select
                value={category || ""}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id} className="bg-stone-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-stone-300 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>বছর বা উৎসবের সাল</span>
              </label>
              <select
                value={year || ""}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-emerald-400 transition-all"
              >
                <option value="২০২৬" className="bg-stone-900 text-white">২০২৬</option>
                <option value="২০২৫" className="bg-stone-900 text-white">২০২৫</option>
                <option value="২০২৪" className="bg-stone-900 text-white">২০২৪</option>
                <option value="২০২৩" className="bg-stone-900 text-white">২০২৩</option>
                <option value="পূর্ববর্তী বছর" className="bg-stone-900 text-white">পূর্ববর্তী বছর</option>
              </select>
            </div>
          </div>

          {/* Caption / Story */}
          <div className="space-y-1.5">
            <label className="block text-stone-300 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>ছবির সাথে ছোট স্মৃতি বা কথা (ঐচ্ছিক)</span>
            </label>
            <textarea
              rows={2}
              value={caption || ""}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="এই ছবিটি তোলার সময়কার কোনো স্মরণীয় স্মৃতি বা অনুভূতি লিখুন..."
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-emerald-400 transition-all resize-none"
            />
          </div>

          {/* Image Input Selection */}
          <div className="space-y-2 pt-1">
            <label className="block text-stone-300 font-semibold flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>ছবি যুক্ত করার মাধ্যম *</span>
            </label>

            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tab === 'upload'
                    ? 'bg-emerald-500 text-black shadow-md font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ডিভাইস থেকে আপলোড</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('link')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  tab === 'link'
                    ? 'bg-emerald-500 text-black shadow-md font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>ড্রাইভ বা অনলাইন লিঙ্ক</span>
              </button>
            </div>

            {tab === 'upload' ? (
              <div key="tab-upload-container" className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-emerald-500/5 relative">
                <input
                  key="member-photo-file-input"
                  id="member-photo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-stone-300">
                    <span className="text-emerald-400 font-semibold">ফটো সিলেক্ট করতে ক্লিক করুন</span> বা ড্র্যাগ করুন
                  </p>
                  <p className="text-[10px] text-stone-500">JPG, PNG, WebP (সরাসরি আপনার মোবাইল বা কম্পিউটার থেকে)</p>
                </div>
              </div>
            ) : (
              <div key="tab-link-container" className="space-y-1.5">
                <input
                  key="member-photo-link-input"
                  id="member-photo-link-input"
                  type="url"
                  value={linkInput || ""}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder="গুগল ড্রাইভ বা ছবির সরাসরি ওয়েব লিঙ্ক পেস্ট করুন..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-emerald-400 transition-all"
                />
                <p className="text-[10px] text-stone-400">
                  গুগল ড্রাইভের শেয়ারিং লিঙ্ক দিলেও স্বয়ংক্রিয়ভাবে সরাসরি ছবিতে রূপান্তরিত হবে।
                </p>
              </div>
            )}
          </div>

          {/* Preview Box */}
          {previewUrl && (
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/30 flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setErrorMsg('ছবির লিঙ্ক থেকে ছবি লোড করা যাচ্ছে না।')}
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ছবির প্রিভিউ সক্রিয় হয়েছে</span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  {title || 'শিরোনাম ছাড়া ছবি'}
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={!authorName.trim() || !title.trim() || !previewUrl || isUploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ছবিটি শেয়ার করুন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
