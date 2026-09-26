import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  HeartHandshake,
  ExternalLink,
  ShieldCheck,
  Gift,
  Sparkles,
  Users,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

export const DonatePage: React.FC = () => {
  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold">
          <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          <span>সহযোগিতা ও পাশে দাঁড়ানো</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
          সহযোগিতা ও অনুদান প্রদান
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
          আপনার ক্ষুদ্র অবদান একজন মুমূর্ষু রোগীর প্রাণ বাঁচাতে পারে এবং এক অসহায় শিশুর মুখে হাসি ফোটাতে পারে।
        </p>
      </motion.div>

      {/* DKMS Stem Cell Donor Registration (Preserved Authentic Campaign) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-950/40 via-black/80 to-amber-950/30 border border-red-500/40 shadow-[0_0_35px_rgba(239,68,68,0.2)] space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/20 text-red-300 border border-red-500/40">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
              জীবনদায়ী উদ্যোগ • STEM CELL DONATION
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white">
              ব্লাড ক্যান্সার রোগীদের জন্য স্টেম সেল দাতা হিসেবে নাম নথিভুক্ত করুন
            </h2>
          </div>
        </div>

        <p className="text-sm text-stone-200 leading-relaxed">
          ব্লাড ক্যান্সার ও অন্যান্য মারাত্মক রক্তের রোগে আক্রান্ত রোগীদের একমাত্র বাঁচার উপায় ব্লাড স্টেম সেল ট্রান্সপ্ল্যান্ট। 11 স্টার ক্লাব এই মহৎ উদ্যোগে DKMS India-র সাথে একাত্ম হয়ে সচেতনতা গড়ে তুলছে। আপনিও একজন সম্ভাব্য জীবনদাতা হতে পারেন।
        </p>

        <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs sm:text-sm text-stone-300">
          <div className="font-bold text-red-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-red-400" />
            <span>কীভাবে রেজিস্টার করবেন?</span>
          </div>
          <p>
            নিচের বোতামে ক্লিক করে DKMS-এর অফিসিয়াল পেজে গিয়ে নাম ও ঠিকানা প্রদান করে খুব সহজে বিনামূল্যে সোয়াব কিট অর্ডার করে দাতা হিসেবে রেজিস্টার করুন।
          </p>
        </div>

        <a
          href={CLUB_INFO.stemCellRegistrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            window.open(CLUB_INFO.stemCellRegistrationUrl, '_blank', 'noopener,noreferrer');
          }}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(239,68,68,0.45)] flex items-center justify-center gap-2 group"
        >
          <span>DKMS India-তে স্টেম সেল দাতা হিসেবে রেজিস্টার করুন</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Club Welfare Fund Support */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Gift className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
              11 স্টার ক্লাব সমাজকল্যাণ তহবিলে অনুদান
            </h2>
            <p className="text-xs text-stone-300">পূজা ও বছরব্যাপী মানবিক কার্যক্রমে সহায়তা</p>
          </div>
        </div>

        <p className="text-sm text-stone-200 leading-relaxed">
          ক্লাবের চিকিৎসা সহায়তা ফান্ড, দরিদ্র ত্রাণ এবং শিক্ষাবৃত্তি তহবিলে সরাসরি সাহায্য প্রদান করতে বা পূজার চাঁদা/পৃষ্ঠপোষকতা দিতে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>ইমেইলে যোগাযোগ</span>
            </div>
            <a href={`mailto:${CLUB_INFO.email}`} className="text-stone-300 hover:text-amber-200 block font-mono">
              {CLUB_INFO.email}
            </a>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>স্বচ্ছতা ও হিসাবরক্ষণ</span>
            </div>
            <p className="text-stone-300">প্রতিটি অবদানের জন্য ক্লাবের অফিসিয়াল রসিদ প্রদান করা হয়।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
