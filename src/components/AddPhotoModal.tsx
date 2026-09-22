import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  FolderOpen,
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { getDriveDirectImageUrl, extractDriveFileId } from '../utils/driveHelper';
import { optimizeImage } from '../utils/imageOptimizer';
import { saveClubStoredItem } from '../utils/clubStorageManager';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhotos: (newPhotos: Array<{
    id: string;
    title: string;
    subtitle: string;
    category: string;
    url: string;
    tag: string;
    year?: string;
  }>) => void;
  categories: Array<{ id: string; label: string }>;
  defaultCategory?: string;
  defaultTag?: string;
  driveFolderUrl: string;
  pageTitle: string;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  isOpen,
  onClose,
  onAddPhotos,
  categories,
  defaultCategory = 'all',
  defaultTag = 'নতুন ছবি',
  driveFolderUrl,
  pageTitle,
}) => {
  const [tab, setTab] = useState<'drive' | 'upload'>('drive');
  const [driveInput, setDriveInput] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(defaultCategory === 'all' ? (categories[1]?.id || 'puja') : defaultCategory);
  const [tag, setTag] = useState(defaultTag);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Realtime preview for drive input
  const handleDriveInputChange = (val: string) => {
    setDriveInput(val);
    setErrorMsg('');
    const firstLine = val.split(/[\n,\r]+/)[0]?.trim();
    if (firstLine) {
      const directUrl = getDriveDirectImageUrl(firstLine);
      setPreviewUrl(directUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg('');
    const fileList: File[] = Array.from(files);
    
    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP ইত্যাদি) নির্বাচন করুন।');
        continue;
      }
      try {
        const optimized = await optimizeImage(file, 1280, 1280, 0.82);
        setUploadedFiles((prev) => [...prev, { name: file.name, dataUrl: optimized }]);
      } catch (err) {
        console.warn('Image optimization fallback:', err);
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const result = loadEvt.target?.result as string;
          if (result) {
            setUploadedFiles((prev) => [...prev, { name: file.name, dataUrl: result }]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (tab === 'drive') {
      const rawLines = driveInput
        .split(/[\n,\r]+/)
        .map((l) => l.trim())
        .filter(Boolean);

      if (rawLines.length === 0) {
        setErrorMsg('অনুগ্রহ করে অন্তত একটি গুগল ড্রাইভ ছবির লিঙ্ক বা ফাইল আইডি পেস্ট করুন।');
        return;
      }

      const newItems = rawLines.map((line, idx) => {
        const directUrl = getDriveDirectImageUrl(line);
        const autoId = `drive-custom-${Date.now()}-${idx}`;
        const itemTitle = title.trim()
          ? (rawLines.length > 1 ? `${title.trim()} (${idx + 1})` : title.trim())
          : `ড্রাইভ থেকে ছবি (${idx + 1})`;
        
        return {
          id: autoId,
          title: itemTitle,
          subtitle: subtitle.trim() || 'গুগল ড্রাইভ থেকে যুক্ত করা নতুন আলোকচিত্র',
          category: category,
          url: directUrl,
          tag: tag.trim() || 'ড্রাইভ ছবি',
          year: '২০২৬',
        };
      });

      onAddPhotos(newItems);
      
      // Persist to Permanent Storage
      newItems.forEach(item => {
        saveClubStoredItem({
          title: item.title,
          type: 'photo',
          source: 'online',
          url: item.url,
          authorName: 'অ্যাডমিন (ড্রাইভ)',
          description: item.subtitle,
          category: item.category
        }).catch(console.warn);
      });

      setSuccessMsg(`${newItems.length}টি নতুন ছবি সফলভাবে পেজের গ্যালারিতে ও স্থায়ী স্টোরেজে যুক্ত করা হয়েছে!`);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } else {
      // Direct file uploads
      if (uploadedFiles.length === 0) {
        setErrorMsg('অনুগ্রহ করে আপনার ডিভাইস থেকে অন্তত একটি ছবি নির্বাচন করুন।');
        return;
      }

      const newItems = uploadedFiles.map((fileObj, idx) => {
        const autoId = `upload-custom-${Date.now()}-${idx}`;
        const itemTitle = title.trim()
          ? (uploadedFiles.length > 1 ? `${title.trim()} (${idx + 1})` : title.trim())
          : (fileObj.name.replace(/\.[^/.]+$/, '') || `আপলোড ছবি (${idx + 1})`);

        return {
          id: autoId,
          title: itemTitle,
          subtitle: subtitle.trim() || 'সরাসরি আপলোড করা আলোকচিত্র',
          category: category,
          url: fileObj.dataUrl,
          tag: tag.trim() || 'আপলোড ছবি',
          year: '২০২৬',
        };
      });

      onAddPhotos(newItems);

      // Persist to Permanent Storage
      newItems.forEach(item => {
        saveClubStoredItem({
          title: item.title,
          type: 'photo',
          source: 'device',
          url: item.url,
          authorName: 'অ্যাডমিন (আপলোড)',
          description: item.subtitle,
          category: item.category
        }).catch(console.warn);
      });

      setSuccessMsg(`${newItems.length}টি ছবি সফলভাবে পেজে ও স্থায়ী স্টোরেজে যুক্ত করা হয়েছে!`);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    }
  };

  const resetForm = () => {
    setDriveInput('');
    setTitle('');
    setSubtitle('');
    setPreviewUrl(null);
    setUploadedFiles([]);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] my-8 z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{pageTitle}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white flex items-center gap-2">
                <Plus className="w-6 h-6 text-amber-400" />
                <span>নতুন ছবি গ্যালারিতে যুক্ত করুন</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                গুগল ড্রাইভের লিঙ্ক পেস্ট করে অথবা সরাসরি ছবি আপলোড করে পেজে প্রদর্শন করান
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10">
            <button
              type="button"
              onClick={() => setTab('drive')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                tab === 'drive'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>গুগল ড্রাইভ লিঙ্ক</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                tab === 'upload'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>ডিভাইস থেকে আপলোড</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'drive' ? (
              <div key="photo-tab-drive-container" className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    <span>গুগল ড্রাইভ থেকে ছবি যুক্ত করার সহজ নিয়ম:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-stone-300 pl-1 leading-relaxed">
                    <li>
                      আপনার গুগল ড্রাইভের ছবিতে রাইট ক্লিক করে <strong>'Share' (শেয়ার) &gt; 'Copy link'</strong> করুন।
                    </li>
                    <li>
                      লিঙ্কের অ্যাক্সেস <strong>"Anyone with the link" (যে কেউ দেখতে পারে)</strong> আছে কিনা নিশ্চিত করুন।
                    </li>
                    <li>
                      নিচে লিঙ্কটি পেস্ট করুন (একাধিক ছবি হলে প্রতি লাইনে একটি করে লিঙ্ক দিতে পারেন)।
                    </li>
                  </ol>
                  <div className="pt-1">
                    <a
                      href={driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-amber-400 underline hover:text-amber-300 text-[11px] font-semibold"
                    >
                      <span>গুগল ড্রাইভ ফোল্ডার ওপেন করুন</span>
                      <FolderOpen className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                    গুগল ড্রাইভ ছবির লিঙ্ক / ফাইল আইডি (এক বা একাধিক):
                  </label>
                  <textarea
                    key="photo-drive-textarea"
                    id="photo-drive-textarea"
                    rows={3}
                    value={driveInput || ""}
                    onChange={(e) => handleDriveInputChange(e.target.value)}
                    placeholder="উদাহরণ:&#10;https://drive.google.com/file/d/1A2B3C.../view?usp=sharing&#10;অথবা ড্রাইভ ফাইল আইডি"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm font-mono placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {previewUrl && (
                  <div className="p-3 rounded-xl bg-black/40 border border-amber-500/30 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ছবির প্রিভিউ তৈরি হয়েছে</span>
                      </div>
                      <p className="text-stone-400 line-clamp-1 break-all text-[11px]">{previewUrl}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Direct Upload Tab */
              <div key="photo-tab-upload-container" className="space-y-3">
                <div className="border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-6 text-center cursor-pointer bg-black/40 hover:bg-amber-950/10 transition-colors relative">
                  <input
                    key="photo-upload-file-input"
                    id="photo-upload-file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-bold text-white font-serif-bengali">
                        ছবি নির্বাচন করতে এখানে ক্লিক করুন অথবা ড্র্যাগ করুন
                      </p>
                      <p className="text-[11px] text-stone-400">
                        মোবাইল বা কম্পিউটার থেকে এক বা একাধিক ছবি (JPG, PNG, WebP)
                      </p>
                    </div>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadedFiles.length}টি ছবি নির্বাচিত হয়েছে</span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-black/50 rounded-xl border border-white/10">
                      {uploadedFiles.map((f, idx) => (
                        <div key={idx} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/15">
                          <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                            className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Common Details Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1">
                  ছবির শিরোনাম (Title - ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={title || ""}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: পূজা মণ্ডপ সজ্জা ২০২৬"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1">
                  ক্যাটাগরি (বিভাগ):
                </label>
                <select
                  value={category || ""}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                >
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((c) => (
                      <option key={c.id} value={c.id} className="bg-stone-900 text-white">
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1">
                  উপশিরোনাম / বিবরণ (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={subtitle || ""}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="যেমন: খুকুড়দহ 11 স্টার ক্লাবের আলোকচিত্র"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-200 mb-1">
                  ট্যাগ (Badge Tag):
                </label>
                <input
                  type="text"
                  value={tag || ""}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="যেমন: ২০২৬ পূজো"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Error / Success Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs sm:text-sm font-semibold transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>গ্যালারিতে যুক্ত করুন</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
