import React from 'react';
import { motion } from 'motion/react';
import {
  HandHeart,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  PackageCheck
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

export const HelpForNeedyPage: React.FC = () => {
  const formUrl = CLUB_INFO.forms.needy;

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold">
          <HandHeart className="w-4 h-4 text-amber-400" />
          <span>মানবতার সেবায় 11 স্টার ক্লাব</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
          দরিদ্র ও দুস্থ সাহায্য আবেদন
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
          অসহায়, দিনমজুর ও আর্থিকভাবে দুর্বল পরিবারের জন্য খাদ্যসামগ্রী, বস্ত্র ও জরুরি সহায়তা প্রদান।
        </p>
      </motion.div>

      {/* Main Box */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.15)] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white">
              দরিদ্র সেবা আবেদন ফর্ম (Google Form)
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              সরাসরি ফর্মের মাধ্যমে পারিবারিক তথ্য ও প্রয়োজনের বিবরণ জমা দিন।
            </p>
          </div>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 shrink-0 group"
          >
            <span>আবেদন ফর্ম খুলুন</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Categories of Assistance */}
        <div className="space-y-3">
          <h3 className="text-base font-bold font-serif-bengali text-amber-200 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-amber-400" />
            <span>আমরা যে ধরনের সহায়তা প্রদান করি:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-300">
            {[
              'মাসিক বা জরুরি খাদ্য প্যাকেট বিতরণ (চাল, ডাল, তেল ইত্যাদি)',
              'শীতকালে গরম পোশাক ও কম্বল প্রদান',
              'উৎসবের প্রাক্কালে পরিবারের শিশুদের জন্য নতুন পোশাক',
              'প্রাকৃতিক দুর্যোগে জরুরি ত্রাণ ও ত্রিপল সহায়তা',
              'বৃদ্ধ ও অসহায় সদস্যদের জন্য জরুরি আর্থিক সহায়তা',
              'কন্যাদায়গ্রস্ত দরিদ্র পরিবারের পাশে থাকা',
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Note */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>সরেজমিনে নিরপেক্ষ তদন্ত নীতি:</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            11 স্টার ক্লাব প্রতিটি আবেদনকে সর্বোচ্চ গুরুত্ব দেয়। সত্যিকারের অভাবী ও দুস্থ পরিবারের কাছে সাহায্য পৌঁছে দিতে আমাদের সদস্যগণ বাড়িতে গিয়ে প্রকৃত অবস্থা যাচাই করে প্রয়োজনীয় পদক্ষেপ গ্রহণ করেন।
          </p>
        </div>
      </div>
    </div>
  );
};
