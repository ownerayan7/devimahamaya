import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Sparkles,
  RefreshCw,
  FolderOpen,
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { ClubStoredItem, getStoredClubItems, saveClubStoredItem, fetchCloudClubItems, subscribeCloudClubItems, deleteClubStoredItem } from '../utils/clubStorageManager';
import { optimizeImage } from '../utils/imageOptimizer';

interface ClubDataStorageSectionProps {
  isAdmin?: boolean;
  onRequireAdminLogin?: () => void;
}

export const ClubDataStorageSection: React.FC<ClubDataStorageSectionProps> = ({ isAdmin = true, onRequireAdminLogin }) => {
  const [items, setItems] = useState<ClubStoredItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'video' | 'audio' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('puja');
  const [uploadType, setUploadType] = useState<'photo' | 'video' | 'audio' | 'document'>('photo');
  const [uploadUrl, setUploadUrl] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Delete Password Auth state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showDeleteAuthModal, setShowDeleteAuthModal] = useState<boolean>(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState<string>('');
  const [showDeletePassword, setShowDeletePassword] = useState<boolean>(false);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');

  const loadItems = async () => {
    const data = await fetchCloudClubItems();
    setItems(data);
  };

  useEffect(() => {
    loadItems();
    const unsub = subscribeCloudClubItems((data) => {
      setItems(data);
    });
    const handleUpdate = () => loadItems();
    window.addEventListener('club_storage_updated', handleUpdate);
    return () => {
      unsub();
      window.removeEventListener('club_storage_updated', handleUpdate);
    };
  }, []);

  const handlePromptDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert('পাবলিক ভিউ মোডে ফাইল ডিলিট করার অনুমতি নেই। অ্যাডমিন পাসওয়ার্ড দিয়ে লগিন করুন।');
      return;
    }
    setDeletingItemId(id);
    setDeletePasswordInput('');
    setDeleteErrorMsg('');
    setShowDeleteAuthModal(true);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingItemId) return;

    if (deletePasswordInput.trim() === 'Ayan@2024') {
      await deleteClubStoredItem(deletingItemId);
      setShowDeleteAuthModal(false);
      setDeletingItemId(null);
      setDeletePasswordInput('');
      setDeleteErrorMsg('');
      loadItems();
      setSuccessMsg('ফাইলটি সফলভাবে স্টোরেজ থেকে ডিলিট করা হয়েছে!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setDeleteErrorMsg('ভুল অ্যাডমিন পাসওয়ার্ড! ফাইল ডিলিট করার অনুমতি দেওয়া হলো না।');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let t: 'photo' | 'video' | 'audio' | 'document' = 'photo';
      if (file.type.startsWith('video/')) t = 'video';
      else if (file.type.startsWith('audio/')) t = 'audio';
      else if (file.type.includes('pdf') || file.type.includes('document')) t = 'document';

      let resultUrl = '';
      if (file.type.startsWith('image/')) {
        resultUrl = await optimizeImage(file, 1200, 1200, 0.85);
      } else {
        // Read as data url for audio/video/docs
        const reader = new FileReader();
        resultUrl = await new Promise((resolve) => {
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      await saveClubStoredItem({
        title: uploadTitle.trim() || file.name,
        type: t,
        source: 'device',
        url: resultUrl,
        authorName: 'ক্লাব সদস্য / ভিজিটর',
        description: 'মোবাইল গ্যালারি বা ডিভাইস থেকে স্থায়ীভাবে আপলোডকৃত ফাইল।',
        category: uploadCategory
      });

      setUploadTitle('');
      setShowUploadModal(false);
      setSuccessMsg('ফাইলটি সফলভাবে ক্লাবের স্থায়ী ডাটা স্টোরেজে সংরক্ষিত হয়েছে!');
      loadItems();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadTitle.trim()) return;

    setIsUploading(true);
    await saveClubStoredItem({
      title: uploadTitle.trim(),
      type: uploadType,
      source: 'online',
      url: uploadUrl.trim(),
      authorName: 'অনলাইন আপলোড',
      description: 'অনলাইন লিঙ্ক বা ড্রাইভ থেকে সংরক্ষিত ফাইল।',
      category: uploadCategory
    });

    setUploadTitle('');
    setUploadUrl('');
    setShowUploadModal(false);
    setSuccessMsg('অনলাইন ফাইলটি ক্লাবের স্থায়ী ডাটা স্টোরেজে সংরক্ষিত হয়েছে!');
    loadItems();
    setIsUploading(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const filteredItems = items.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim() && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div id="club-data-storage-section" className="my-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-stone-950 border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-stone-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                ✨ স্থায়ী ক্লাউড ও লোকাল স্টোরেজ
              </span>
              <span className="text-xs text-amber-400/80 font-mono">
                ({items.length} টি ফাইল সংরক্ষিত)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient mt-0.5">
              📦 11 স্টার ক্লাব • ডাটা স্টোরেজ (Club Data Storage)
            </h3>
            <p className="text-xs text-stone-400">
              মোবাইল গ্যালারি বা অনলাইন থেকে আপলোড করা সমস্ত ছবি, ভিডিও ও গান এখানে স্থায়ীভাবে সংরক্ষিত থাকে এবং রিফ্রেশ করলেও কখনো মুছে যায় না।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {isAdmin ? (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>নতুন ফাইল আপলোড করুন</span>
            </button>
          ) : (
            <span className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              👁️ পাবলিক ভিউ (ফাইল দেখার মোড)
            </span>
          )}
          <button
            onClick={loadItems}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 transition"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Toolbar: Filters & Search */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${filterType === 'all' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-stone-300 hover:bg-white/10'}`}
          >
            সব ({items.length})
          </button>
          <button
            onClick={() => setFilterType('photo')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'photo' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-stone-300 hover:bg-white/10'}`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> ছবি ({items.filter(i => i.type === 'photo').length})
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'video' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-stone-300 hover:bg-white/10'}`}
          >
            <Video className="w-3.5 h-3.5" /> ভিডিও ({items.filter(i => i.type === 'video').length})
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'audio' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-stone-300 hover:bg-white/10'}`}
          >
            <Music className="w-3.5 h-3.5" /> গান/অডিও ({items.filter(i => i.type === 'audio').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="স্টোরেজ ফাইল খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-stone-500 outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Stored Items Grid / List */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-2 text-stone-600" />
            <p className="text-sm font-semibold">কোনো সংরক্ষিত ফাইল পাওয়া যায়নি</p>
            <p className="text-xs text-stone-500 mt-1">উপরে "নতুন ফাইল আপলোড করুন" বাটনে ক্লিক করে ছবি, ভিডিও বা গান যোগ করুন।</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/20 hover:border-amber-400/60 transition flex flex-col justify-between space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {item.type === 'photo' && <ImageIcon className="w-4 h-4" />}
                    {item.type === 'video' && <Video className="w-4 h-4" />}
                    {item.type === 'audio' && <Music className="w-4 h-4" />}
                    {item.type === 'document' && <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-amber-400/80 font-mono">
                      {item.dateAdded} • {item.source === 'device' ? 'গ্যালারি আপলোড' : 'অনলাইন'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Thumbnail if photo */}
              {item.type === 'photo' && item.url && (
                <div className="h-28 rounded-xl overflow-hidden bg-black border border-white/10 relative">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Audio Player if audio */}
              {item.type === 'audio' && item.url && (
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <audio controls src={item.url} className="w-full h-8" />
                </div>
              )}

              <div className="pt-1 flex items-center justify-between text-xs border-t border-white/5">
                <span className="text-[11px] text-stone-400">
                  স্ট্যাটাস: <strong className="text-emerald-400">স্থায়ী সংরক্ষিত ✓</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={(e) => handlePromptDelete(e, item.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 transition"
                      title="ফাইল ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-300 transition flex items-center gap-1 text-[11px]"
                  >
                    <span>খুলুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal Popup */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-300 font-serif-bengali">
                📁 স্থায়ী ডাটা স্টোরেজে ফাইল আপলোড
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ফাইলের নাম / শিরোনাম *</label>
                <input
                  type="text"
                  placeholder="যেমন: প্রতিমা বরণের বিশেষ মুহূর্ত"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ফাইলের ধরন</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                >
                  <option value="photo">ছবি (Photo / Gallery)</option>
                  <option value="video">ভিডিও (Video)</option>
                  <option value="audio">গান / অডিও (Song / Audio)</option>
                  <option value="document">নথি / ফাইল (Document)</option>
                </select>
              </div>

              {/* Device Upload */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center space-y-2">
                <span className="text-amber-300 font-bold block">মোবাইল গ্যালারি বা ডিভাইস থেকে আপলোড:</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                />
                <p className="text-[10px] text-stone-400">আপলোড করার সাথে সাথেই এটি স্থায়ীভাবে স্টোরেজে সেভ হয়ে যাবে।</p>
              </div>

              <div className="text-center text-stone-500 font-semibold">অথवा অনলাইন লিঙ্ক দিন</div>

              <form onSubmit={handleUrlSubmit} className="space-y-2">
                <input
                  type="url"
                  placeholder="অনলাইন ফাইল বা ড্রাইভ লিঙ্ক (https://...)"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!uploadTitle.trim() || !uploadUrl.trim() || isUploading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 disabled:opacity-50"
                >
                  {isUploading ? 'সংরক্ষণ হচ্ছে...' : 'অনلاین লিঙ্ক স্টোরেজে সেভ করুন'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Password Modal */}
      {showDeleteAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-red-500/50 p-6 space-y-4 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-red-500/30">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">ফাইল ডিলিট পাসওয়ার্ড নিশ্চিতকরণ</h3>
              </div>
              <button
                onClick={() => setShowDeleteAuthModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-300">
              ফাইলটি স্থায়ীভাবে ডিলিট করতে অ্যাডমিন পাসওয়ার্ড প্রদান করুন:
            </p>

            <form onSubmit={handleConfirmDelete} className="space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                  value={deletePasswordInput}
                  onChange={(e) => setDeletePasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl py-2.5 pl-9 pr-9 text-xs text-white placeholder-stone-500 outline-none focus:border-amber-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  {showDeletePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {deleteErrorMsg && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{deleteErrorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteAuthModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
                >
                  ডিলিট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
