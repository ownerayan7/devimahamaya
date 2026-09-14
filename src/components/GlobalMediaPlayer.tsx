import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Minimize2,
  BookOpen,
  ChevronUp,
  Radio,
  ArrowRight,
  X
} from 'lucide-react';
import { useMediaPlayer } from '../context/MediaPlayerContext';
import { PageId } from '../types';

interface GlobalMediaPlayerProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const GlobalMediaPlayer: React.FC<GlobalMediaPlayerProps> = ({
  currentPage,
  onNavigate,
}) => {
  const {
    isPlaying,
    isMuted,
    isPlayerActive,
    isMinimized,
    activeChapter,
    currentTitle,
    togglePlay,
    toggleMute,
    toggleMinimize,
    stopMedia,
  } = useMediaPlayer();

  // Show floating bar on other pages when the player is active
  const showFloatingBar = isPlayerActive && currentPage !== 'gita';

  return (
    <AnimatePresence>
      {showFloatingBar && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40"
        >
          {isMinimized ? (
            /* Minimized Floating Pill */
            <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-[#1b1207]/98 to-[#0b0602]/98 border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.35)] backdrop-blur-xl">
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold shadow-md transition-transform active:scale-90"
                title={isPlaying ? 'পজ করুন' : 'চালু করুন'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <div
                onClick={toggleMinimize}
                className="cursor-pointer pr-2 flex items-center gap-2"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-serif-bengali text-amber-200 flex items-center gap-1.5 line-clamp-1">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>গীতা অমৃতবাণী</span>
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-mono">
                    অধ্যায় {activeChapter}
                  </span>
                </div>

                {/* Equalizer Sound Waves */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-4 px-1">
                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-3" />
                    <span className="w-1 bg-amber-300 rounded-full animate-[bounce_1.1s_ease-in-out_infinite] h-4" />
                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.9s_ease-in-out_infinite] h-2.5" />
                  </div>
                )}

                <ChevronUp className="w-4 h-4 text-amber-300 ml-1 hover:scale-110" />
              </div>
            </div>
          ) : (
            /* Expanded Full Floating Media Controller */
            <div className="w-[calc(100vw-2rem)] sm:w-96 rounded-2xl bg-gradient-to-br from-[#1c1206]/98 via-[#120a03]/98 to-[#080402]/98 border border-amber-500/50 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.3)] backdrop-blur-xl p-3.5 space-y-3">
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  </span>
                  <div>
                    <span className="text-xs font-bold font-serif-bengali text-amber-200">
                      শ্রীমদ্ভগবদ্গীতা প্লেয়ার
                    </span>
                    <p className="text-[11px] text-stone-300">
                      11 স্টার ক্লাব আধ্যাত্মিক বিভাগ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMinimize}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                    title="মিনিমাইজ করুন"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={stopMedia}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-stone-400 hover:text-red-400 transition-colors"
                    title="বন্ধ করুন"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Track Information & Waveform */}
              <div className="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-500 p-0.5 shrink-0 flex items-center justify-center text-black font-bold shadow-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold font-serif-bengali text-white truncate">
                      {currentTitle}
                    </h4>
                    <p className="text-[11px] text-amber-200/90 truncate font-medium">
                      পবিত্র গীতা পাঠ ও জীবন দর্শন
                    </p>
                  </div>
                </div>

                {isPlaying && (
                  <div className="flex items-end gap-1 h-5 shrink-0 px-1">
                    <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-3.5" />
                    <span className="w-1 bg-amber-300 rounded-full animate-[bounce_1s_ease-in-out_infinite] h-5" />
                    <span className="w-1 bg-amber-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-3" />
                    <span className="w-1 bg-yellow-400 rounded-full animate-[bounce_1.2s_ease-in-out_infinite] h-4.5" />
                  </div>
                )}
              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all active:scale-95"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-black" />
                        <span>পজ</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>প্লে</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-amber-200 border border-white/10 transition-colors"
                    title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('gita')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>গীতা পেজে যান</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
