import React from 'react';
import { Database, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface AdminStorageAccessCardProps {
  onOpenAdminStorage?: () => void;
}

export const AdminStorageAccessCard: React.FC<AdminStorageAccessCardProps> = ({ onOpenAdminStorage }) => {
  if (!onOpenAdminStorage) return null;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Database className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>শুধুমাত্র অ্যাডমিনদের জন্য সুরক্ষিত জোন</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold font-serif-bengali text-white">
              🔒 অ্যাডমিন লকড ক্লাব ডাটা স্টোরেজ ও ফাইল ম্যানেজার
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
              সকল আপলোডকৃত ছবি, ভিডিও, নোটিশ ও ফাইলের গোপন কেন্দ্রীয় ভাণ্ডার। গুগল ক্লাউড (Firebase), পোস্টগ্রে-এসকিউএল (Cloud SQL), এক্সপ্রেস বাইনারি স্ট্রিমিং সিডিএন ও সকেট রিয়েল-টাইম সিঙ্ক সক্রিয় রয়েছে।
            </p>
            {/* Active Multi-Cloud Engine Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ⚡ Express Binary CDN
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                🔥 Google Firebase Storage
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                🐘 PostgreSQL Cloud SQL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                🌐 Socket.IO Real-Time Sync
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAdminStorage}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          id="main-page-admin-storage-btn"
        >
          <Lock className="w-4 h-4" />
          <span>অ্যাডমিন স্টোরেজ খুলুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
