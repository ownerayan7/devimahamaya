import React from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  ExternalLink,
  BookOpen,
  Award,
  FileCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

export const ScholarshipPage: React.FC = () => {
  const formUrl = CLUB_INFO.forms.scholarship;

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          <span>শিক্ষা ও মেধা বিকাশ কর্মসূচি</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
          মেধাবৃত্তি ও স্কলারশিপ আবেদন
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
          মেধাবী অথচ আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের উচ্চশিক্ষা ও পড়াশোনা এগিয়ে নিতে 11 স্টার ক্লাবের শিক্ষা অনুদান।
        </p>
      </motion.div>

      {/* Main Form Box */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-blue-500/30 shadow-[0_0_35px_rgba(59,130,246,0.15)] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white">
              স্কলারশিপ আবেদন ফর্ম (Google Form)
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              মার্কশিট ও আয়ের প্রমাণপত্র আপলোড করে ফর্মটি সম্পূর্ণ করুন।
            </p>
          </div>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 hover:from-blue-400 hover:to-amber-400 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2 shrink-0 group"
          >
            <span>আবেদন ফর্ম খুলুন</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Required Documents */}
        <div className="space-y-3">
          <h3 className="text-base font-bold font-serif-bengali text-blue-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>স্কলারশিপ আবেদনের প্রয়োজনীয় নথিপত্র:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-300">
            {[
              'সর্বশেষ বার্ষিক/বোর্ড পরীক্ষার মার্কশিট (Last Exam Marksheet)',
              'বর্তমান স্কুল/কলেজের পরিচয়পত্র বা ফি রসিদ (Student ID / Fee Receipt)',
              'পরিবারের বার্ষিক আয়ের পঞ্চায়েত/কাউন্সিলর শংসাপত্র (Income Proof)',
              'ছাত্র/ছাত্রীর পাসপোর্ট সাইজ ছবি ও আধার কার্ড (Aadhaar & Photo)',
              'ব্যাংক অ্যাকাউন্টের বিবরণ (Bank Passbook Copy)',
              'অভিভাবকের যোগাযোগ নম্বর ও ঘোষণাপত্র',
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation criteria */}
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-300">
            <Award className="w-4 h-4 text-blue-400" />
            <span>স্কলারশিপ নির্বাচন পদ্ধতি:</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            মেধা এবং আর্থিক প্রয়োজনের যৌথ মূল্যায়নের ভিত্তিতে যোগ্য শিক্ষার্থীদের স্কলারশিপের জন্য মনোনীত করা হবে। নির্বাচিত শিক্ষার্থীদের সরাসরি ক্লাবের পক্ষ থেকে ফোনে ও ইমেইলে যোগাযোগ করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
};
