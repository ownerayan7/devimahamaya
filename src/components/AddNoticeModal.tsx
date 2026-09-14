import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Plus,
  BellRing,
  Sparkles,
  Calendar,
  Tag as TagIcon,
  FileText,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Link,
  Trash2
} from 'lucide-react';
import { Announcement } from '../types';

interface AddNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotice: (notice: Announcement) => void;
}

export const AddNoticeModal: React.FC<AddNoticeModalProps> = ({
  isOpen,
  onClose,
  onAddNotice
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('জরুরি নোটিশ');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return today.toLocaleDateString('bn-BD', options);
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [driveUrl, setDriveUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (JPG, PNG, WebP ইত্যাদি) নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('অনুগ্রহ করে বিজ্ঞপ্তির শিরোনাম লিখুন।');
      return;
    }

    if (!content.trim()) {
      setError('অনুগ্রহ করে বিজ্ঞপ্তির বিস্তারিত বিবরণ বা বক্তব্য লিখুন।');
      return;
    }

    setIsSubmitting(true);

    const newNotice: Announcement = {
      id: `notice-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      tag: tag.trim() || 'জরুরি নোটিশ',
      date: date.trim() || 'আজকের নোটিশ',
      image: imagePreview || undefined,
      driveFolderUrl: driveUrl.trim() || undefined,
      driveFolderTitle: driveUrl.trim() ? 'গুগল ড্রাইভ নোটিশ নথি দেখুন' : undefined,
      isImportant: true,
      isCustom: true
    };

    onAddNotice(newNotice);
    setSuccess('নতুন বিজ্ঞপ্তিটি সফলভাবে প্রকাশিত হয়েছে!');

    setTimeout(() => {
      setSuccess('');
      setIsSubmitting(false);
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setImagePreview('');
      setDriveUrl('');
    }, 1200);
  };

  return (
    <div
      id="add-notice-modal"
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
        <div className="relative px-6 py-4 bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>অ্যাডমিন নোটিশ প্রকাশনা</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                সর্বশেষ বিজ্ঞপ্তি বোর্ডে নতুন নোটিশ পোস্ট করুন
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

        {/* Modal Form Body */}
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
              <span>বিজ্ঞপ্তির শিরোনাম / বিষয়বস্তু *</span>
            </label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: শারদীয়া দুর্গোৎসব প্রস্তুতি সভা ও জরুরি বৈঠক"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
            />
          </div>

          {/* Tag & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>ট্যাগ বা নোটিশের প্রকার</span>
              </label>
              <select
                value={tag || ""}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="জরুরি নোটিশ">📌 জরুরি নোটিশ</option>
                <option value="পূজা বিজ্ঞপ্তি">🪔 পূজা বিজ্ঞপ্তি</option>
                <option value="খুঁটি পূজা">🎋 খুঁটি পূজা</option>
                <option value="সাংস্কৃতিক উৎসব">🎭 সাংস্কৃতিক উৎসব</option>
                <option value="সমাজসেবা">❤️ সমাজসেবামূলক কাজ</option>
                <option value="সাধারণ বিজ্ঞপ্তি">📢 সাধারণ বিজ্ঞপ্তি</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>বিজ্ঞপ্তির তারিখ</span>
              </label>
              <input
                type="text"
                value={date || ""}
                onChange={(e) => setDate(e.target.value)}
                placeholder="যেমন: ৪ সেপ্টেম্বর, ২০২৬"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Detailed Content / Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>বিজ্ঞপ্তির পূর্ণ বিবরণ ও বার্তা *</span>
            </label>
            <textarea
              rows={4}
              value={content || ""}
              onChange={(e) => setContent(e.target.value)}
              placeholder="নোটিশের সম্পূর্ণ বার্তা এখানে লিখুন..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Photo / Poster Upload from Phone Gallery or Camera */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>নোটিশের ছবি / অফিশিয়াল পোস্টার (ফোন বা গ্যালারি থেকে)</span>
            </label>

            <input
              key="notice-file-input"
              id="notice-file-input"
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black/60 max-h-56 flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="নোটিশ পোস্টার প্রিভিউ"
                  className="max-h-56 w-auto object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 rounded-xl bg-red-600/90 text-white hover:bg-red-500 transition-colors shadow-lg flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ছবি মুছুন</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-4 sm:p-6 text-center bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-stone-200">
                  ফোন গ্যালারি বা কম্পিউটার থেকে নোটিশের ছবি বেছে নিন
                </p>
                <span className="text-[11px] text-stone-400">
                  JPG, PNG, WebP ফরম্যাট সমর্থিত
                </span>
              </div>
            )}
          </div>

          {/* Optional Google Drive or Document URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
              <Link className="w-4 h-4 text-emerald-400" />
              <span>ঐচ্ছিক গুগল ড্রাইভ ফোল্ডার বা ডকুমেন্ট লিংক</span>
            </label>
            <input
              type="url"
              value={driveUrl || ""}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/... (যদি থাকে)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
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
              <span>নোটিশ পোস্ট করুন</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
