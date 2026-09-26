import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Youtube, Facebook, Globe, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GyanSaradaChannel } from '../types';
import { GYAN_SARADA_CATEGORIES } from '../data/gyanSaradaData';
import { getUniversalEmbedUrl } from '../utils/universalEmbedHelper';

interface AddGyanSaradaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: Omit<GyanSaradaChannel, 'id' | 'createdAt'>) => void;
}

export const AddGyanSaradaModal: React.FC<AddGyanSaradaModalProps> = ({
  isOpen,
  onClose,
  onAddChannel,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('physics');
  const [customCategoryBengali, setCustomCategoryBengali] = useState('');
  const [platform, setPlatform] = useState<'youtube' | 'facebook' | 'web'>('youtube');
  const [channelUrl, setChannelUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [subscribersOrFollowers, setSubscribersOrFollowers] = useState('');
  const [featured, setFeatured] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !channelUrl.trim()) {
      alert('অনুগ্রহ করে চ্যানেলের নাম এবং লিঙ্ক প্রদান করুন।');
      return;
    }

    const selectedCat = GYAN_SARADA_CATEGORIES.find(c => c.id === category);
    const categoryBengali = category === 'custom' && customCategoryBengali.trim()
      ? customCategoryBengali.trim()
      : selectedCat ? selectedCat.nameBengali : 'সাধারণ শিক্ষা';

    // Auto-generate Universal Embed URL (YouTube, Facebook Page/Video, Vimeo, Web)
    const computedEmbedUrl = embedUrl.trim() || getUniversalEmbedUrl(channelUrl.trim(), platform);

    onAddChannel({
      title: title.trim(),
      category: category === 'custom' ? 'custom' : category,
      categoryBengali,
      platform,
      channelUrl: channelUrl.trim(),
      embedUrl: computedEmbedUrl,
      description: description.trim() || 'শিক্ষামূলক চ্যানেল ও ভিডিও লেকচার।',
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      subscribersOrFollowers: subscribersOrFollowers.trim() || undefined,
      featured,
      isCustom: true,
    });

    // Reset form
    setTitle('');
    setChannelUrl('');
    setEmbedUrl('');
    setDescription('');
    setThumbnailUrl('');
    setSubscribersOrFollowers('');
    setFeatured(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-stone-900 border border-amber-500/30 rounded-2xl p-5 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden text-stone-100 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-300">নতুন চ্যানেল / লিঙ্ক যোগ করুন</h3>
                <p className="text-xs text-stone-400">জ্ঞান সারদা শিক্ষামূলক ডিরেক্টরি</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 pr-1 flex-1">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                চ্যানেল বা পেজের নাম <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Physics Wallah Bengali বা MinutePhysics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-stone-100 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                বিষয় / ক্যাটাগরি
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-sm text-stone-100 outline-none"
              >
                {GYAN_SARADA_CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.nameBengali} ({cat.nameEnglish})
                  </option>
                ))}
                <option value="custom">➕ নতুন বিষয় টাইপ করুন...</option>
              </select>
            </div>

            {category === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  নতুন বিষয়ের নাম (বাংলায়)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মহাকাশ বিজ্ঞান বা রোবোটিক্স"
                  value={customCategoryBengali}
                  onChange={(e) => setCustomCategoryBengali(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-sm text-stone-100 outline-none"
                />
              </div>
            )}

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                প্ল্যাটফর্ম
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('youtube')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    platform === 'youtube'
                      ? 'bg-red-950/80 border-red-500 text-red-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>ইউটিউব</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('facebook')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    platform === 'facebook'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Facebook className="w-4 h-4 text-blue-500" />
                  <span>ফেসবুক</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('web')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    platform === 'web'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>ওয়েবসাইট</span>
                </button>
              </div>
            </div>

            {/* Channel URL */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                চ্যানেল বা পেজের সরাসরি লিঙ্ক (URL) <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="যেমন: https://www.youtube.com/@PhysicsWallahBangla বা ফেসবুক পেজ লিংক"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-sm text-stone-100 outline-none"
              />
              <p className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
                <span>💡 আলাদা কোনো ভিডিও যুক্ত করতে হবে না — শুধু চ্যানেলের ইউআরএল দিলেই অ্যাপের ভেতরে ইন-অ্যাপ ভিউ চালু হয়ে যাবে।</span>
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                সংক্ষিপ্ত বিবরণ
              </label>
              <textarea
                rows={2}
                placeholder="এই চ্যানেলে কী শিক্ষা দেওয়া হয় সংক্ষিপ্ত বিবরণ লিখুন..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-sm text-stone-100 outline-none resize-none"
              />
            </div>

            {/* Thumbnail URL & Subscribers Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  থাম্বনেল ছবি URL (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  গ্রাহক/সাবস্ক্রাইবার ট্যাগ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: 500K+ Subscribers"
                  value={subscribersOrFollowers}
                  onChange={(e) => setSubscribersOrFollowers(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 outline-none"
                />
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="featured" className="text-xs font-medium text-stone-300 flex items-center gap-1 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>প্রধান আকর্ষণে (Featured Highlight) পিন করুন</span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>চ্যানেল যোগ করুন</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
