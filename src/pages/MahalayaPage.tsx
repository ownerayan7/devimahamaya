import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Moon,
  Play,
  ExternalLink,
  ListMusic,
  Sparkles,
  Youtube,
  Tv,
  Music,
  CheckCircle2,
  Volume2,
  Radio
} from 'lucide-react';
import { MAHALAYA_TRACKS, MAHALAYA_PLAYLIST, CLUB_INFO } from '../data/clubData';
import { Countdowns } from '../components/Countdowns';
import { broadcastMediaPlaybackStarted, subscribeToMediaStop } from '../utils/mediaCoordinator';
import { updateLockScreenMediaMetadata, pauseLockScreenMediaSession, clearLockScreenMediaMetadata } from '../utils/mediaSessionHelper';

export const MahalayaPage: React.FC = () => {
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [autoPlayKey, setAutoPlayKey] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeTrack = MAHALAYA_TRACKS[selectedTrackIndex] || MAHALAYA_TRACKS[0];

  const handleSelectTrack = (idx: number) => {
    setSelectedTrackIndex(idx);
    setIsPlaying(true);
    setAutoPlayKey((prev) => prev + 1);
    broadcastMediaPlaybackStarted('mahalaya-player', 'mahalaya');

    const track = MAHALAYA_TRACKS[idx] || MAHALAYA_TRACKS[0];
    updateLockScreenMediaMetadata({
      title: track.title,
      artist: track.artist || 'বীরেন্দ্রকৃষ্ণ ভদ্র',
      album: 'মহিষাসুরমর্দিনী মহালয়া — 11 স্টার ক্লাব',
      artworkUrl: '/icon.png',
      onPlay: () => {
        setIsPlaying(true);
        const iframe = document.querySelector('iframe[title="' + track.title + '"]') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
          } catch {}
        }
      },
      onPause: () => {
        setIsPlaying(false);
        pauseLockScreenMediaSession();
        const iframe = document.querySelector('iframe[title="' + track.title + '"]') as HTMLIFrameElement;
        if (iframe?.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
          } catch {}
        }
      }
    });
  };

  useEffect(() => {
    const unsub = subscribeToMediaStop('mahalaya-player', () => {
      setIsPlaying(false);
      pauseLockScreenMediaSession();
      const iframe = document.querySelector('iframe[title="' + activeTrack.title + '"]') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
        } catch {}
      }
    });
    return () => unsub();
  }, [activeTrack.title]);

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
      {/* Devotional Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Moon className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span>দেবীপক্ষ সূচনা ও পুণ্য মহালয়া</span>
          <Moon className="w-4 h-4 text-cyan-300 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-cyan-gradient drop-shadow-[0_5px_30px_rgba(6,182,212,0.3)]">
          মহালয়া — মহিষাসুরমর্দিনী ও আগমনী সুর
        </h1>

        <p className="text-sm sm:text-base text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
          "আশ্বিনের শারদপ্রাতে বেজে উঠেছে আলোক মঞ্জীর, ধরণীর বহিরাকাশে অন্তরিত মেঘমালা..." মহালয়ার পুণ্য লগ্নে বীরেন্দ্রকৃষ্ণ ভদ্রের চণ্ডীপাঠ ও পবিত্র আগমনী স্তোত্র শুনুন ও দেখুন।
        </p>
      </motion.div>

      {/* Mahalaya Live Countdown Timer Banner */}
      <section>
        <Countdowns />
      </section>

      {/* Dedicated Multimedia Player (Guaranteed 100% Working) */}
      <section className="rounded-3xl bg-gradient-to-b from-[#091530]/95 via-[#060e22]/98 to-[#030612]/98 border border-cyan-500/40 p-5 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(6,182,212,0.18)_0%,_transparent_70%)] pointer-events-none blur-3xl" />

        {/* Player Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-bengali text-white flex items-center gap-2">
                <span>লাইভ প্লেয়ার</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-mono border border-cyan-500/30">
                  HD Sound & Video
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                নির্বিঘ্নে সরাসরি প্লে করুন এবং সম্পূর্ণ স্তোত্র উপভোগ করুন
              </p>
            </div>
          </div>

          <a
            href={activeTrack.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
            <span>YouTube-এ দেখুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Embed Video/Audio Stream Player */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-black shadow-[0_0_35px_rgba(6,182,212,0.3)] relative">
              <iframe
                key={`${activeTrack.youtubeId}-${autoPlayKey}`}
                title={activeTrack.title}
                src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Currently Playing Information Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                  এখন চলছে (Now Playing)
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {activeTrack.duration}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white">
                {activeTrack.title}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200/90 font-medium">
                {activeTrack.subtitle}
              </p>
              <p className="text-xs text-stone-400">
                শিল্পী: {activeTrack.artist}
              </p>
            </div>
          </div>

          {/* Track Selector List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <h4 className="text-base font-bold font-serif-bengali text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-cyan-400" />
                <span>মহালয়া ট্র্যাক সংগ্রহ</span>
              </h4>
              <span className="text-xs text-cyan-300/80 font-mono">
                {MAHALAYA_TRACKS.length}টি ট্র্যাক
              </span>
            </div>

            <div className="space-y-3">
              {MAHALAYA_TRACKS.map((track, idx) => {
                const isActive = selectedTrackIndex === idx;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center justify-between gap-3 group ${
                      isActive
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]'
                        : 'bg-black/40 border-white/10 hover:border-cyan-500/50 hover:bg-black/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                          isActive
                            ? 'bg-gradient-to-tr from-cyan-400 to-sky-400 text-black shadow-lg scale-105'
                            : 'bg-white/5 text-stone-300 border border-white/10 group-hover:border-cyan-500/40'
                        }`}
                      >
                        {isActive ? (
                          <Play className="w-5 h-5 fill-black ml-0.5 animate-pulse" />
                        ) : (
                          <span className="font-mono">0{track.id}</span>
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold font-serif-bengali text-white line-clamp-1 group-hover:text-cyan-200">
                          {track.title}
                        </h5>
                        <p className="text-xs text-cyan-200/80 line-clamp-1">
                          {track.subtitle}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {track.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-semibold border border-cyan-400/30">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Playlist Link */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 to-black/80 border border-red-500/30 space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h5 className="text-sm font-bold font-serif-bengali text-white">
                  {MAHALAYA_PLAYLIST.title}
                </h5>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {MAHALAYA_PLAYLIST.description}
              </p>
              <a
                href={MAHALAYA_PLAYLIST.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(MAHALAYA_PLAYLIST.youtubeUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <span>সম্পূর্ণ মহালয়া প্লেলিস্ট খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Devotional Slokas & Significance */}
      <section className="rounded-3xl glass-card border border-amber-500/30 p-6 sm:p-8 space-y-6 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            পবিত্র দেবী বন্দনা
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
            "যা দেবী সর্বভূতেষু শক্তিরূপেণ সংস্থিতা।<br />নমস্তস্যৈ নমস্তস্যৈ নমস্তস্যৈ নমো নমঃ॥"
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pt-2">
            মহালয়ার মাধ্যমে সূচনা ঘটে শুভ দেবীপক্ষের। মা দুর্গার স্বর্গলোক থেকে মর্তে আগমন এবং ধরণীতে অন্যায়ের বিরুদ্ধে ন্যায়ের প্রতিষ্ঠার চিরন্তন বার্তা।
          </p>
        </div>
      </section>
    </div>
  );
};
