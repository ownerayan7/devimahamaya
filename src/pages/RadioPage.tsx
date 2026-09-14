import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hls from 'hls.js';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  Music,
  ExternalLink,
  ShieldCheck,
  Disc,
  RadioTower,
  Globe,
  Headphones,
  Signal,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { RadioStation } from '../types';
import { RADIO_STATIONS, RADIO_CATEGORIES, RADIO_INDIA_PORTAL_URL } from '../data/radioStations';
import { broadcastMediaPlaybackStarted, subscribeToMediaStop } from '../utils/mediaCoordinator';
import {
  updateLockScreenMediaMetadata,
  pauseLockScreenMediaSession,
  clearLockScreenMediaMetadata
} from '../utils/mediaSessionHelper';

const StationLogo: React.FC<{
  logoUrl?: string;
  name: string;
  size?: 'sm' | 'lg';
  isPlaying?: boolean;
}> = ({ logoUrl, name, size = 'sm', isPlaying = false }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  if (!logoUrl || hasError) {
    if (size === 'lg') {
      return (
        <Disc
          className={`w-10 h-10 sm:w-12 sm:h-12 text-amber-300 transition-all ${
            isPlaying ? 'animate-spin-slow' : 'opacity-80'
          }`}
        />
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-400">
        <Radio className="w-5 h-5" />
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <img
        src={logoUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover rounded-xl"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl border border-amber-500/30 bg-black/40 overflow-hidden shrink-0">
      <img
        src={logoUrl}
        alt={name}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const RadioPage: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<RadioStation>(RADIO_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPortalInfo, setShowPortalInfo] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Initialize and keep audio element updated
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      (audioRef.current as any).__mediaId = 'indian-radio-player';
    }

    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setErrorMsg(null);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    const handleError = (e: any) => {
      console.warn('Radio stream notice:', e);
      setIsLoading(false);
      setIsPlaying(false);

      if (selectedStation.backupStreamUrl && audio.src !== selectedStation.backupStreamUrl) {
        audio.src = selectedStation.backupStreamUrl;
        setErrorMsg('ব্যাকআপ স্ট্রিমে পরিবর্তিত হয়েছে। প্লে বোতামে চাপুন।');
      } else {
        setErrorMsg('লাইভ স্ট্রিম সংযোগে সমস্যা হচ্ছে। অন্য স্টেশন বেছে নিন বা পুনরায় চেষ্টা করুন।');
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [selectedStation]);

  // Volume & Mute Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Global Media Coordination: Pause when other media begins playing
  useEffect(() => {
    const unsub = subscribeToMediaStop('indian-radio-player', () => {
      if (audioRef.current && !audioRef.current.paused) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.stopLoad();
        } catch {}
      }
      setIsPlaying(false);
      pauseLockScreenMediaSession();
    });

    return () => {
      unsub();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {}
      }
      clearLockScreenMediaMetadata();
    };
  }, []);

  // Update Lock-Screen Media Metadata
  const updateMediaSession = (station: RadioStation) => {
    updateLockScreenMediaMetadata({
      title: station.bengaliName,
      artist: `${station.name} • ${station.location || 'India'}`,
      album: 'ইন্ডিয়ান অনলাইন রেডিও লাইভ — 11 স্টার ক্লাব',
      artworkUrl: station.logoUrl || '/icon.png',
      onPlay: () => handlePlay(station),
      onPause: () => handlePause()
    });
  };

  const handleStreamFallback = async (station: RadioStation) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    if (station.backupStreamUrl && audio.src !== station.backupStreamUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.src = station.backupStreamUrl;
      audio.load();
      try {
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        updateMediaSession(station);
        setErrorMsg('ব্যাকআপ স্ট্রিমে পরিবর্তিত হয়েছে।');
        return;
      } catch (err) {
        console.warn('Backup stream failed:', err);
      }
    }
    setIsLoading(false);
    setIsPlaying(false);
    setErrorMsg('লাইভ স্ট্রিম সংযোগ করা সম্ভব হয়নি। পুনরায় ক্লিক করুন।');
  };

  const handlePlay = async (station: RadioStation) => {
    if (!audioRef.current) return;
    setErrorMsg(null);

    // If already playing this station, do nothing
    if (selectedStation.id === station.id && isPlaying) {
      return;
    }

    // Stop other global app media
    broadcastMediaPlaybackStarted('indian-radio-player', 'radio');

    setSelectedStation(station);
    setIsLoading(true);

    const audio = audioRef.current;
    const streamUrl = station.streamUrl;
    const isHls = streamUrl.includes('.m3u8') || streamUrl.includes('/hls') || streamUrl.includes('bitgravity');

    // Destroy any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls && Hls.isSupported()) {
      try {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            updateMediaSession(station);
          }).catch((err) => {
            console.warn('HLS play error:', err);
            handleStreamFallback(station);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.warn('Fatal HLS error:', data);
            handleStreamFallback(station);
          }
        });
      } catch (e) {
        console.warn('Hls init error:', e);
        handleStreamFallback(station);
      }
    } else if (isHls && audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = streamUrl;
      audio.load();
      try {
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        updateMediaSession(station);
      } catch (e) {
        handleStreamFallback(station);
      }
    } else {
      audio.src = streamUrl;
      audio.load();
      try {
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
        updateMediaSession(station);
      } catch (e) {
        handleStreamFallback(station);
      }
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (hlsRef.current) {
      try {
        hlsRef.current.stopLoad();
      } catch {}
    }
    setIsPlaying(false);
    pauseLockScreenMediaSession();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay(selectedStation);
    }
  };

  // Helper to count stations per category
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return RADIO_STATIONS.length;
    if (catId === 'kolkata') {
      return RADIO_STATIONS.filter(
        (s) =>
          s.category === 'kolkata' ||
          (s.location && (s.location.includes('কলকাতা') || s.location.includes('পশ্চিমবঙ্গ') || s.location.toLowerCase().includes('kolkata'))) ||
          s.name.toLowerCase().includes('kolkata')
      ).length;
    }
    if (catId === 'akashvani') {
      return RADIO_STATIONS.filter(
        (s) =>
          s.category === 'akashvani' ||
          s.name.toLowerCase().includes('akashvani') ||
          s.name.toLowerCase().includes('air ') ||
          s.name.toLowerCase().includes('vbs') ||
          s.name.toLowerCase().includes('fm ') ||
          s.bengaliName.includes('আকাশবাণী') ||
          s.bengaliName.includes('বিবিধ ভারতী')
      ).length;
    }
    if (catId === 'bengali') {
      return RADIO_STATIONS.filter((s) => s.category === 'bengali' || s.language.includes('বাংলা')).length;
    }
    return RADIO_STATIONS.filter((s) => s.category === catId).length;
  };

  // Filter stations by Category and Search query
  const filteredStations = RADIO_STATIONS.filter((station) => {
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'kolkata') {
      matchesCategory =
        station.category === 'kolkata' ||
        (station.location && (station.location.includes('কলকাতা') || station.location.includes('পশ্চিমবঙ্গ') || station.location.toLowerCase().includes('kolkata'))) ||
        station.name.toLowerCase().includes('kolkata');
    } else if (selectedCategory === 'akashvani') {
      matchesCategory =
        station.category === 'akashvani' ||
        station.name.toLowerCase().includes('akashvani') ||
        station.name.toLowerCase().includes('air ') ||
        station.name.toLowerCase().includes('vbs') ||
        station.name.toLowerCase().includes('fm ') ||
        station.bengaliName.includes('আকাশবাণী') ||
        station.bengaliName.includes('বিবিধ ভারতী');
    } else if (selectedCategory === 'bengali') {
      matchesCategory = station.category === 'bengali' || station.language.includes('বাংলা');
    } else {
      matchesCategory = station.category === selectedCategory;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      station.name.toLowerCase().includes(q) ||
      station.bengaliName.toLowerCase().includes(q) ||
      station.tagline.toLowerCase().includes(q) ||
      station.language.toLowerCase().includes(q) ||
      (station.location && station.location.toLowerCase().includes(q)) ||
      (station.frequency && station.frequency.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* ================= HERO HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-b from-[#1c1208] via-[#120b05] to-[#0a0603] border border-amber-500/30 p-6 sm:p-8 text-center space-y-4 shadow-[0_0_35px_rgba(245,158,11,0.15)] relative overflow-hidden"
      >
        <div className="relative z-10 space-y-3 max-w-3xl mx-auto">
          {/* Top Badge */}
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold shadow">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>ইন্ডিয়ান অনলাইন রেডিও</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE ON-AIR</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
            ইন্ডিয়ান রেডিও লাইভ
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-amber-100/85 leading-relaxed">
            ২৪ ঘণ্টা সরাসরি শুনুন অল ইন্ডিয়া রেডিও (AIR), বাংলা এফএম, কিশোর কুমার ও লতা মঙ্গেশকরের কালজয়ী গান, ভক্তিগীতি এবং{' '}
            <span className="text-amber-300 font-semibold">Radio India (radioindia.in)</span> পোর্টালের সেরা ভারতীয় স্টেশনসমূহ।
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={RADIO_INDIA_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold transition-all shadow active:scale-95"
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span>রেডিও ইন্ডিয়া অফিসিয়াল পোর্টাল (radioindia.in)</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* ================= MASTER TOP LIVE PLAYER ================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#180d07] via-[#100704] to-[#0a0402] border-2 border-amber-500/40 p-5 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.2)] space-y-6 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Station Visual & Info */}
          <div className="flex items-center gap-4 sm:gap-5 flex-1">
            {/* Animated Radio Dial / Station Logo */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/30 to-red-600/30 border-2 border-amber-500/50 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 overflow-hidden">
              <StationLogo
                logoUrl={selectedStation.logoUrl}
                name={selectedStation.bengaliName}
                size="lg"
                isPlaying={isPlaying}
              />
              {isPlaying && (
                <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping-slow pointer-events-none" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-bold">
                  {selectedStation.frequency || 'LIVE FM'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-stone-300 text-[11px] font-semibold">
                  {selectedStation.language}
                </span>
                {selectedStation.location && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[10px] flex items-center gap-1 font-sans">
                    <MapPin className="w-2.5 h-2.5 text-amber-400" />
                    {selectedStation.location}
                  </span>
                )}
                {selectedStation.bitrate && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    {selectedStation.bitrate}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-bengali text-white truncate">
                {selectedStation.bengaliName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 line-clamp-1">
                {selectedStation.tagline}
              </p>
            </div>
          </div>

          {/* Sound Visualizer & Equalizer Frequency Bars */}
          <div className="flex items-center justify-center lg:justify-end gap-1.5 h-10 px-4 py-2 rounded-2xl bg-black/40 border border-amber-500/20">
            {[40, 75, 55, 95, 60, 85, 45, 100, 70, 90, 50, 80, 65, 85, 45, 70].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-red-500 transition-all duration-200"
                style={{
                  height: isPlaying ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '20%',
                  opacity: isPlaying ? 1 : 0.35,
                  animation: isPlaying ? `pulse ${(i % 4) * 0.2 + 0.5}s ease-in-out infinite alternate` : 'none'
                }}
              />
            ))}
          </div>

          {/* Player Controls & Volume */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-amber-500/20">
            {/* Play/Pause Button */}
            <button
              id="radio-master-play-pause-btn"
              onClick={handleTogglePlay}
              disabled={isLoading}
              className={`h-14 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black shadow-amber-500/30'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>লোড হচ্ছে...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>থামান (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                  <span>রেডিও শুনুন (Play)</span>
                </>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-black/60 border border-amber-500/25">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-amber-300 hover:text-amber-200 transition-colors p-1"
                title={isMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 sm:w-24 accent-amber-400 cursor-pointer h-1.5 rounded-lg bg-stone-800"
                title={`সাউন্ড ভলিউম: ${Math.round(volume * 100)}%`}
              />
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => handlePlay(selectedStation)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Status Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-black/60 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <RadioTower className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isPlaying ? (
                <span className="text-amber-300 font-semibold">
                  🔴 সম্প্রচার চলছে: {selectedStation.bengaliName} ({selectedStation.frequency})
                </span>
              ) : (
                <span>যেকোনো স্টেশনে ক্লিক করে লাইভ সম্প্রচার উপভোগ করুন। পেজ থেকে বের হলেও চলতে থাকবে।</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-amber-300/80 font-mono text-[11px]">
            <Signal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>HQ AUDIO STREAM</span>
          </div>
        </div>
      </section>

      {/* ================= SEARCH & CATEGORY FILTER TABS ================= */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="স্টেশন বা শিল্পীর নাম দিয়ে খুঁজুন (উদাঃ কিশোর, বাংলা, রফি)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-amber-500/30 text-amber-100 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Quick Stats */}
          <div className="text-xs text-stone-300 self-center md:self-auto font-serif-bengali">
            মোট প্রদর্শিত স্টেশন: <span className="text-amber-300 font-bold font-mono">{filteredStations.length}</span> টি
          </div>
        </div>

        {/* Quick Search Shortcut Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-stone-400 font-medium">দ্রুত ফিল্টার:</span>
          <button
            onClick={() => {
              setSelectedCategory('kolkata');
              setSearchQuery('');
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 font-medium transition-all"
          >
            📍 কলকাতা ও পশ্চিমবঙ্গ ({getCategoryCount('kolkata')})
          </button>
          <button
            onClick={() => {
              setSelectedCategory('akashvani');
              setSearchQuery('');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 font-medium transition-all"
          >
            📻 আকাশবাণী ‘ক’ ও ‘খ’ ({getCategoryCount('akashvani')})
          </button>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('VBS');
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-200 font-medium transition-all"
          >
            🎙️ বিবিধ ভারতী (VBS)
          </button>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('FM');
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-200 font-medium transition-all"
          >
            🎵 এফএম রেইনবো ও গোল্ড
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {RADIO_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                    : 'bg-[#140c06] hover:bg-[#1e130a] text-stone-300 border-amber-500/25'
                }`}
              >
                {cat.label.replace(/\(\d+\)/, '')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= RADIO STATIONS GRID ================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white">
              রেডিও স্টেশন তালিকা
            </h3>
          </div>
          <span className="text-xs text-amber-300/80 font-mono">
            LIVE BROADCAST CHANNELS ({filteredStations.length})
          </span>
        </div>

        {filteredStations.length === 0 ? (
          <div className="p-12 rounded-3xl bg-black/40 border border-amber-500/20 text-center space-y-3">
            <Radio className="w-12 h-12 text-amber-400/50 mx-auto" />
            <h4 className="text-base font-bold text-amber-200">কোনো রেডিও স্টেশন খুঁজে পাওয়া যায়নি</h4>
            <p className="text-xs text-stone-400">
              অনুগ্রহ করে ভিন্ন কোনো শব্দ দিয়ে অনুসন্ধান করুন বা অন্য কোনো ক্যাটাগরি বেছে নিন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredStations.map((station) => {
              const isCurrentStation = selectedStation.id === station.id;
              const isCurrentPlaying = isCurrentStation && isPlaying;

              return (
                <motion.div
                  key={station.id}
                  whileHover={{ y: -3 }}
                  className={`rounded-2xl p-5 transition-all flex flex-col justify-between border relative overflow-hidden group ${
                    isCurrentPlaying
                      ? 'bg-gradient-to-b from-[#2a1708] to-[#120803] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                      : 'bg-[#110a05] hover:bg-[#180f08] border-amber-500/25 hover:border-amber-400/50 shadow-md'
                  }`}
                >
                  {/* Playing Glow Accent */}
                  {isCurrentPlaying && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />
                  )}

                  <div className="space-y-3">
                    {/* Top Row: Category & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                        {station.categoryLabel}
                      </span>
                      {isCurrentPlaying ? (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500 text-red-300 text-[10px] font-mono font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          PLAYING
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-400">
                          {station.frequency}
                        </span>
                      )}
                    </div>

                    {/* Station Logo & Name */}
                    <div className="flex items-start gap-3">
                      <StationLogo
                        logoUrl={station.logoUrl}
                        name={station.bengaliName}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-bold font-serif-bengali text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {station.bengaliName}
                        </h4>
                        <p className="text-[11px] font-mono text-stone-400 truncate">
                          {station.name}
                        </p>
                      </div>
                    </div>

                    {/* Location & Tagline */}
                    <div className="space-y-1.5">
                      {station.location && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-300/80 font-sans">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{station.location}</span>
                        </div>
                      )}
                      <p className="text-xs text-stone-300/80 line-clamp-2 leading-relaxed">
                        {station.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Controls */}
                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-200/70">
                      {station.language}
                    </span>

                    <button
                      onClick={() => {
                        if (isCurrentPlaying) {
                          handlePause();
                        } else {
                          handlePlay(station);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow active:scale-95 cursor-pointer ${
                        isCurrentPlaying
                          ? 'bg-red-600 text-white hover:bg-red-500'
                          : 'bg-amber-500 hover:bg-amber-400 text-black'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>থামান</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>প্লে করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= RADIO INDIA OFFICIAL PORTAL SECTION (radioindia.in) ================= */}
      <section className="rounded-3xl bg-gradient-to-br from-[#1c130b] via-[#120a05] to-[#080402] border border-amber-500/35 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
                  রেডিও ইন্ডিয়া অফিসিয়াল নেটওয়ার্ক
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                ওয়েবসাইট: <span className="text-amber-300 font-mono">https://www.radioindia.in/</span>
              </p>
            </div>
          </div>

          <a
            href={RADIO_INDIA_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 self-start md:self-auto"
          >
            <span>রেডিও ইন্ডিয়া ওয়েবসাইটে যান</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>১০০০+ ভারতীয় স্টেশন</span>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              পশ্চিমবঙ্গ, দিল্লি, মহারাষ্ট্র, তামিলনাড়ু সহ ভারতের সকল রাজ্যের আঞ্চলিক ও জাতীয় রেডিও স্টেশন।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>অল ইন্ডিয়া রেডিও ও এফএম চ্যানেল</span>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              আকাশবাণী কলকাতা, এফএম গোল্ড, বিবিধ ভারতী, মির্চি, বিগ এফএম এবং রেড এফএম এর সরাসরি নেটওয়ার্ক।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>স্মার্টফোন ও পিসিতে স্মুথ প্লেব্যাক</span>
            </div>
            <p className="text-stone-300 text-xs leading-relaxed">
              স্ক্রিন লক থাকা অবস্থায় কিংবা ব্যাকগ্রাউন্ডেও এক ক্লিকে স্পষ্ট ও উচ্চমানের লাইভ স্ট্রিমিং সেবা।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0f0904] border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-stone-300 text-center sm:text-left">
            <span className="font-bold text-amber-300 block font-serif-bengali">
              📻 11 স্টার ক্লাবের বিশেষ রেডিও সংযোজন
            </span>
            <span>ক্লাবের সদস্য ও দর্শনার্থীদের জন্য ভারতের সেরা রেডিও বিনোদন এই একক পেজেই পরিবেশিত হয়েছে।</span>
          </div>
          <button
            onClick={() => handlePlay(RADIO_STATIONS[0])}
            className="px-4 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400 text-amber-200 font-bold text-xs transition-all shadow shrink-0 active:scale-95"
          >
            শীর্ষ স্টেশনটি শুনুন
          </button>
        </div>
      </section>
    </div>
  );
};
