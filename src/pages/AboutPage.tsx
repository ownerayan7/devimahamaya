import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Heart, Shield, Users, Target, BookOpen, Compass } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>আমাদের কথা ও দৃষ্টিভঙ্গি</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          11 স্টার ক্লাবের ইতিহাস ও উদ্দেশ্য
        </h1>
        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          {CLUB_INFO.tagline} — নিঃস্বার্থ সামাজিক সেবা ও বাঙালি সংস্কৃতির ঐতিহ্য রক্ষায় এক অঙ্গীকার।
        </p>
      </motion.div>

      {/* Main Philosophy Card */}
      <div className="p-6 sm:p-10 rounded-3xl glass-card border border-amber-500/30 space-y-6 gold-glow">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-white">
          আমাদের পথচলার গল্প
        </h2>
        <p className="text-stone-200 text-base sm:text-lg leading-relaxed text-justify">
          {CLUB_INFO.aboutLong}
        </p>
        <p className="text-stone-300 text-sm sm:text-base leading-relaxed text-justify">
          আমাদের জন্ম হয়েছিল এলাকার মানুষের ভালোবাসা ও সহযোগিতার ওপর ভিত্তি করে। কেবল বছরে কয়েকদিনের উৎসব উদযাপন নয়, বরং সারা বছর ধরে অসুস্থ মানুষের চিকিৎসা সাহায্য, অসচ্ছল শিক্ষার্থীদের পাশে থাকা, দুর্যোগের সময় ত্রাণ বণ্টন এবং পরিবেশ রক্ষায় সবুজায়ন—এই প্রতিটি ক্ষেত্রকেই আমরা আমাদের মূল দায়িত্ব হিসেবে গ্রহণ করেছি।
        </p>
      </div>

      {/* 4 Pillars of 11 Star Club */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold font-serif-bengali text-gold-gradient text-center">
          আমাদের মূল চার স্তম্ভ
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              title: 'নিঃস্বার্থ মানবসেবা',
              desc: 'জাতি-ধর্ম নির্বিশেষে যেকোনো সংকটে অসহায় ও আর্ত মানুষের পাশে সর্বাগ্রে হাত বাড়িয়ে দেওয়া।',
              icon: <Heart className="w-6 h-6 text-rose-400" />,
            },
            {
              title: 'বাঙালি সংস্কৃতি ও ঐতিহ্য',
              desc: 'শারদীয়া দুর্গোৎসবের পবিত্রতা, ঐতিহ্যবাহী রীতিনীতি ও নির্মল সাংস্কৃতিক পরিবেশ বজায় রাখা।',
              icon: <Sparkles className="w-6 h-6 text-amber-400" />,
            },
            {
              title: 'শিক্ষা ও তরুণ সমাজের বিকাশ',
              desc: 'মেধাবী ছাত্র-ছাত্রীদের স্কলারশিপ প্রদান এবং যুবসমাজকে গঠনমূলক সমাজসেবায় উৎসাহিত করা।',
              icon: <BookOpen className="w-6 h-6 text-blue-400" />,
            },
            {
              title: 'স্বচ্ছতা ও পারস্পরিক একতা',
              desc: 'ক্লাবের প্রতিটি কার্যক্রমে সততা, পূর্ণ স্বচ্ছতা ও এলাকার সকল মানুষের সৌহার্দ্যপূর্ণ ঐক্য নিশ্চিত করা।',
              icon: <Shield className="w-6 h-6 text-emerald-400" />,
            },
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl glass-card border border-white/10 space-y-3 hover:border-amber-500/30 transition-colors"
            >
              <div className="p-3 rounded-xl bg-white/5 w-fit border border-white/10">
                {pillar.icon}
              </div>
              <h4 className="text-xl font-bold font-serif-bengali text-white">
                {pillar.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
