import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Youtube,
  Sparkles,
  Flame,
  Volume2,
  Compass,
  Heart
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';
import {
  useMediaPlayer,
  GITA_CHAPTERS,
  GITA_YOUTUBE_ID
} from '../context/MediaPlayerContext';

export const BhagavadGitaPage: React.FC = () => {
  const {
    activeChapter,
    setActiveChapter,
    startGitaBackgroundPlay,
    iframeRef,
  } = useMediaPlayer();

  const currentChapter = GITA_CHAPTERS[activeChapter - 1] || GITA_CHAPTERS[0];

  const handleSelectChapter = (chNum: number) => {
    setActiveChapter(chNum);
    startGitaBackgroundPlay(chNum);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Devotional Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>পবিত্র শ্রীমদ্ভগবদ্গীতা — দিব্য বাণী</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_5px_30px_rgba(245,158,11,0.4)]">
          শ্রীমদ্ভগবদ্গীতা — সম্পূর্ণ পাঠ ও সারসংক্ষেপ
        </h1>

        <p className="text-sm sm:text-base text-amber-100/90 max-w-2xl mx-auto leading-relaxed">
          "যত্র যোগেশ্বরঃ কৃষ্ণো যত্র পার্থো ধনঞ্জয়ঃ। তত্র শ্রীর্বিজয়ো ভূতির্ধ্রুবা নীতির্মতির্মম।" মানবজীবনের পথপ্রদর্শক ও শ্রীকৃষ্ণের মুখনিঃসৃত অমৃতবাণী শুনুন।
        </p>
      </motion.div>

      {/* Dedicated Multimedia Player Section */}
      <section className="rounded-3xl bg-gradient-to-b from-[#1b1207]/95 via-[#110904]/98 to-[#080402]/98 border border-amber-500/40 p-4 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(245,158,11,0.18)_0%,_transparent_70%)] pointer-events-none blur-3xl" />

        {/* Player Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
              <Youtube className="w-5 h-5 animate-pulse text-red-500" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-bengali text-white flex items-center gap-2">
                <span>শ্রীমদ্ভগবদ্গীতা — সম্পূর্ণ ভিডিও ও অডিও</span>
              </h2>
              <p className="text-xs text-stone-300">
                সহজে বোঝার জন্য বাংলায় সম্পূর্ণ শ্রীমদ্ভগবদ্গীতা অমৃতবাণী
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main YouTube Player */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black shadow-[0_0_35px_rgba(245,158,11,0.3)] relative">
              <iframe
                ref={iframeRef}
                id="gita-youtube-iframe"
                title="শ্রীমদ্ভগবদ্গীতা — সম্পূর্ণ অধ্যায়"
                src={`https://www.youtube-nocookie.com/embed/${GITA_YOUTUBE_ID}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Currently Selected Chapter Information Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                  শ্রীমদ্ভগবদ্গীতা — অধ্যায় ভিত্তিক বিবরণ
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
                  অধ্যায় {activeChapter} / ১৮
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white">
                অধ্যায় {activeChapter}: {currentChapter?.title}
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/90 font-medium leading-relaxed">
                {currentChapter?.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-stone-400 border-t border-white/5">
                <span>উপস্থাপনায়: {CLUB_INFO.nameBn} আধ্যাত্মিক বিভাগ</span>
                <span className="text-amber-300/80">আনুমানিক সময়: {currentChapter.durationEstimate}</span>
              </div>
            </div>
          </div>

          {/* Chapters Sidebar Navigation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h4 className="text-base font-bold font-serif-bengali text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>গীতার ১৮টি অধ্যায়ের সূচিপত্র</span>
              </h4>
              <span className="text-xs text-amber-300/80 font-mono">
                ১৮ অধ্যায়
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {GITA_CHAPTERS.map((ch) => {
                const isActive = activeChapter === ch.number;
                return (
                  <div
                    key={ch.number}
                    onClick={() => handleSelectChapter(ch.number)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.01]'
                        : 'bg-black/40 border-white/10 hover:border-amber-500/40 hover:bg-black/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isActive ? 'bg-amber-400 text-black shadow' : 'bg-white/5 text-amber-300 border border-white/10'
                      }`}>
                        {ch.number}
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold font-serif-bengali text-white">
                          অধ্যায় {ch.number}: {ch.title}
                        </h5>
                        <p className="text-[11px] text-stone-300 line-clamp-1">
                          {ch.description}
                        </p>
                      </div>
                    </div>
                    <Flame className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Inspirational Quote Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-950/60 via-red-950/50 to-amber-950/60 border border-amber-500/40 p-6 sm:p-10 text-center relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-amber-200">
            "কর্মণ্যেবাধিকার মা ফলেষু কদাচন"
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            তোমার কেবল কর্ম করার অধিকার আছে, কর্মের ফলের ওপর তোমার কোনো অধিকার নেই। অতএব কর্মফল যেন তোমার কর্মের প্রেরণা না হয় এবং কর্মত্যাগেও যেন তোমার প্রবৃত্তি না থাকে।
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>{CLUB_INFO.nameBn} আধ্যাত্মিক ও সাংস্কৃতিক বিভাগ</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
