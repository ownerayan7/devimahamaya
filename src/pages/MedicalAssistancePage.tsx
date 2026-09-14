import React from 'react';
import { motion } from 'motion/react';
import {
  HeartPulse,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

export const MedicalAssistancePage: React.FC = () => {
  const formUrl = CLUB_INFO.forms.medical;

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold">
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <span>স্বাস্থ্য ও চিকিৎসা সেবা</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
          চিকিৎসা সাহায্য আবেদন পোর্টাল
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
          জরুরি চিকিৎসা খরচ, হাসপাতালে ভর্তি বা দামি ওষুধ ক্রয়ে আর্থিকভাবে অসচ্ছল রোগীদের সহায়তা প্রদান।
        </p>
      </motion.div>

      {/* Main Action Box */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-rose-500/30 shadow-[0_0_35px_rgba(244,63,94,0.15)] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white">
              অনলাইন আবেদন ফর্ম (Google Form)
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              সরাসরি অফিসিয়াল ফর্মে প্রবেশ করে প্রয়োজনীয় তথ্য ও নথি আপলোড করুন।
            </p>
          </div>

          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-500 hover:from-rose-400 hover:to-yellow-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2 shrink-0 group"
          >
            <span>আবেদন ফর্ম খুলুন</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* Required Documents */}
        <div className="space-y-3">
          <h3 className="text-base font-bold font-serif-bengali text-amber-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>আবেদনের সাথে আবশ্যক প্রমাণপত্রসমূহ:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-300">
            {[
              'ডাক্তারের আসল প্রেসক্রিপশন (Doctor Prescription)',
              'হাসপাতালের বিল বা খরচের আনুমানিক হিসেব (Hospital Estimates)',
              'মেডিকেল টেস্ট রিপোর্ট (Blood/X-Ray/Scan Reports)',
              'রোগীর আধার কার্ড / ভোটার আইডি কার্ড (Aadhaar / Voter ID)',
              'পরিবারের আয়ের শংসাপত্র (Family Income Certificate)',
              'যোগাযোগের জন্য সক্রিয় মোবাইল নম্বর ও ঠিকানা',
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning & Instructions */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200/90 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>জরুরি সতর্কতা ও নিয়মাবলী:</span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            ১. গুগল ফর্মে ফাইল আপলোড করার জন্য আপনার জিমেইল (Gmail) অ্যাকাউন্টে লগইন করা থাকা আবশ্যক।<br />
            ২. কোনো ভুয়ো বা অসম্পূর্ণ আবেদন বাতিল করা হবে।<br />
            ৩. ক্লাবের প্রতিনিধি দল রোগীর অবস্থা ও নথি সরেজমিনে যাচাই করে সাহায্যের সিদ্ধান্ত গ্রহণ করবে।
          </p>
        </div>
      </div>
    </div>
  );
};
