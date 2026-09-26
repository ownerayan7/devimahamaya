import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExternalLink,
  Youtube,
  Sparkles,
  RefreshCw,
  Play,
  Flame,
  Radio,
  Tv,
  Film,
  Smartphone,
  Share2,
  Check,
  Maximize2,
  Lock,
  Plus,
  Users,
  Trash2,
  FileVideo
} from 'lucide-react';
import { CLUB_INFO, FEATURED_VIDEOS } from '../data/clubData';
import { VideoItem } from '../types';
import { AddOfficialVideoModal } from '../components/AddOfficialVideoModal';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { MemberCommunityVideos } from '../components/MemberCommunityVideos';
import { AdminStorageAccessCard } from '../components/AdminStorageAccessCard';
import { getVideoBlob, deleteVideoBlob } from '../utils/videoStorageHelper';
import { copyTextToClipboard } from '../utils/clipboardHelper';
import { broadcastMediaPlaybackStarted, registerHtmlMediaElement, subscribeToMediaStop } from '../utils/mediaCoordinator';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { sendAppNotification } from '../utils/notificationHelper';
import { loadPersistentItems, savePersistentItems, mergeItemsWithLocal } from '../utils/persistentStorage';

const LOCAL_STORAGE_KEY = '11star_custom_official_videos_v2';

// Helper to extract upload timestamp from createdAt or id (fallback)
const getCreatedTimestamp = (v: any): number => {
  if (typeof v?.createdAt === 'number' && !isNaN(v.createdAt)) return v.createdAt;
  const match = String(v?.id || '').match(/\d{10,}/);
  if (match) {
    const ts = parseInt(match[0], 10);
    if (!isNaN(ts)) return ts;
  }
  return 0;
};

interface VideosPageProps {
  onOpenAdminStorage?: () => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({ onOpenAdminStorage }) => {
  // 1. Initialize customVideos synchronously from localStorage sorted newest-first
  const [customVideos, setCustomVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed].sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
        }
      }
    } catch (e) {
      console.error('Failed to load custom videos from localStorage:', e);
    }
    return [];
  });

  // Automatically make the last uploaded video the initial active video
  const initialVideo: VideoItem = (customVideos.length > 0 ? customVideos[0] : FEATURED_VIDEOS[0]) || {
    id: 'live-stream-1',
    youtubeId: '_65N3D5zTYg',
    title: 'সার্বজনীন শ্রী শ্রী শারদীয় দুর্গোৎসব',
    description: '',
    category: 'durga-puja',
    duration: 'চলমান ভিডিও',
    tag: 'অফিসিয়াল'
  };

  const [activeVideoId, setActiveVideoId] = useState<string>(initialVideo.youtubeId || initialVideo.id || '_65N3D5zTYg');
  const [activeVideoType, setActiveVideoType] = useState<'youtube' | 'local' | 'direct'>(
    initialVideo.videoType === 'local' || Boolean(initialVideo.videoFileUrl) ? 'local' : 'youtube'
  );
  const [activeVideoFileUrl, setActiveVideoFileUrl] = useState<string>(initialVideo.videoFileUrl || '');
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(initialVideo.title || '');
  const [activeVideoDesc, setActiveVideoDesc] = useState<string>(initialVideo.description || '');
  const [activeVideoDuration, setActiveVideoDuration] = useState<string>(initialVideo.duration || 'চলমান ভিডিও');
  const [activeVideoTag, setActiveVideoTag] = useState<string>(initialVideo.tag || '');

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'theme' | 'cultural' | 'shorts'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isAddOfficialOpen, setIsAddOfficialOpen] = useState(false);
  const [videoToDeleteId, setVideoToDeleteId] = useState<string | null>(null);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasUserManuallySelectedRef = useRef<boolean>(false);

  useEffect(() => {
    if (localVideoRef.current && activeVideoType === 'local') {
      const unsub = registerHtmlMediaElement(localVideoRef.current, `official-video-${activeVideoId}`, 'video');
      return () => unsub();
    }
  }, [activeVideoType, activeVideoFileUrl, activeVideoId]);

  // Subscribe to media stop to pause when any other media plays
  useEffect(() => {
    const currentId = `official-video-${activeVideoId}`;
    const unsub = subscribeToMediaStop(currentId, () => {
      if (localVideoRef.current && !localVideoRef.current.paused) {
        try {
          localVideoRef.current.pause();
        } catch {}
      }
    });
    return () => unsub();
  }, [activeVideoId]);

  // Load custom official videos from persistent storage + Firestore in real time
  useEffect(() => {
    // 1. Initial persistent load
    loadPersistentItems<VideoItem>(LOCAL_STORAGE_KEY).then((saved) => {
      if (saved && saved.length > 0) {
        const sorted = [...saved].sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
        setCustomVideos(sorted);
        if (!hasUserManuallySelectedRef.current && sorted.length > 0) {
          handleSelectVideo(sorted[0], false, false);
        }
      }
    });

    // 2. Real-time Firestore sync with merge
    try {
      const unsub = onSnapshot(
        collection(db, 'officialVideos'),
        (snapshot) => {
          const firestoreList: VideoItem[] = [];
          snapshot.forEach((docSnap) => {
            firestoreList.push({
              ...(docSnap.data() as VideoItem),
              id: docSnap.id,
            });
          });

          loadPersistentItems<VideoItem>(LOCAL_STORAGE_KEY).then((local) => {
            const merged = mergeItemsWithLocal(firestoreList, local);
            merged.sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
            setCustomVideos(merged);
            savePersistentItems(LOCAL_STORAGE_KEY, merged);

            if (!hasUserManuallySelectedRef.current && merged.length > 0) {
              handleSelectVideo(merged[0], false, false);
            }
          });
        },
        (err) => {
          console.warn('Firestore officialVideos snapshot notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore officialVideos listener notice:', e);
    }
  }, []);

  useEffect(() => {
    // Load Elfsight platform script safely for auto-sync YouTube widget
    try {
      const existingScript = document.querySelector('script[src="https://elfsightcdn.com/platform.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://elfsightcdn.com/platform.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onerror = () => {
          // Gracefully ignore third-party network blocking
        };
        document.body.appendChild(script);
      } else {
        try {
          if ((window as any).eapps?.reinitialize) {
            (window as any).eapps.reinitialize();
          }
        } catch {
          // Safe fallback
        }
      }
    } catch {}
  }, []);

  const saveCustomVideos = (items: VideoItem[]) => {
    setCustomVideos(items);
    savePersistentItems(LOCAL_STORAGE_KEY, items);
  };

  const handleAddOfficialVideo = async (newVideo: VideoItem) => {
    const videoWithTime: VideoItem = {
      ...newVideo,
      createdAt: newVideo.createdAt || Date.now()
    };
    const updated = [videoWithTime, ...customVideos.filter((v) => v.id !== videoWithTime.id)];
    updated.sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
    saveCustomVideos(updated);
    
    // Immediately set and focus on the newly uploaded video
    hasUserManuallySelectedRef.current = false;
    await handleSelectVideo(videoWithTime, true, true);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'officialVideos', videoWithTime.id), {
        ...videoWithTime,
        videoFileUrl: videoWithTime.videoFileUrl?.startsWith('blob:') ? '' : videoWithTime.videoFileUrl,
        createdAt: videoWithTime.createdAt
      });
      
      // Send notification
      await sendAppNotification(
        'নতুন ভিডিও যোগ করা হয়েছে!',
        `অফিসিয়াল ভিডিও: ${videoWithTime.title}`,
        'media',
        'videos'
      );
    } catch (err) {
      console.warn('Firestore officialVideos write fallback:', err);
    }
  };

  const handlePromptDeleteOfficialVideo = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setVideoToDeleteId(id);
    setIsDeleteAuthOpen(true);
  };

  const handleConfirmDeleteOfficialVideo = async () => {
    if (!videoToDeleteId) return;
    const id = videoToDeleteId;
    const updated = customVideos.filter((v) => v.id !== id);
    saveCustomVideos(updated);

    try {
      await deleteDoc(doc(db, 'officialVideos', id));
    } catch (err) {
      console.warn('Firestore officialVideos delete fallback:', err);
    }

    try {
      await deleteVideoBlob(id);
    } catch (err) {
      console.warn('Failed to delete blob from IndexedDB:', err);
    }
    if (activeVideoId === id) {
      const fallback = updated[0] || FEATURED_VIDEOS[0];
      if (fallback) {
        handleSelectVideo(fallback, false, false);
      }
    }
    setVideoToDeleteId(null);
    setIsDeleteAuthOpen(false);
  };

  const handleOpenAdminAddVideo = () => {
    // Always prompt for password every time
    setIsAdminAuthOpen(true);
  };

  const scrollToMemberSection = () => {
    const el = document.getElementById('member-community-videos');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Combine custom official videos (sorted newest-first) + default official videos
  const allOfficialVideos: VideoItem[] = [...customVideos, ...FEATURED_VIDEOS];

  const handleSelectVideo = async (
    video: VideoItem,
    isManualClick: boolean = true,
    shouldScroll: boolean = true
  ) => {
    if (isManualClick) {
      hasUserManuallySelectedRef.current = true;
      broadcastMediaPlaybackStarted(`video-player-${video.id || video.youtubeId}`, 'video');
    }
    const isLocal = video.videoType === 'local' || Boolean(video.videoFileUrl);
    setActiveVideoType(isLocal ? 'local' : 'youtube');
    setActiveVideoId(video.youtubeId || video.id);
    setActiveVideoTitle(video.title);
    setActiveVideoDesc(video.description);
    setActiveVideoDuration(video.duration || 'চলমান ভিডিও');
    setActiveVideoTag(video.tag || '');

    if (isLocal) {
      // Check if blob is cached in IndexedDB
      try {
        const storedBlob = await getVideoBlob(video.id);
        if (storedBlob) {
          const freshBlobUrl = URL.createObjectURL(storedBlob as Blob);
          setActiveVideoFileUrl(freshBlobUrl);
        } else if (video.videoFileUrl) {
          setActiveVideoFileUrl(video.videoFileUrl);
        }
      } catch {
        if (video.videoFileUrl) {
          setActiveVideoFileUrl(video.videoFileUrl);
        }
      }
    } else {
      setActiveVideoFileUrl('');
    }

    if (shouldScroll && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleShare = async () => {
    const url = activeVideoType === 'youtube'
      ? `https://www.youtube.com/watch?v=${activeVideoId}`
      : window.location.href;
    await copyTextToClipboard(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredVideos = selectedFilter === 'all'
    ? allOfficialVideos
    : allOfficialVideos.filter((v) => v.category === selectedFilter);

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/15 border border-red-500/30 text-red-300 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <span>অফিসিয়াল ও মেম্বার্স ভিডিও প্ল্যাটফর্ম</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          ভিডিও ও লাইভ সম্প্রচার
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          11 স্টার ক্লাবের সার্বজনীন শারদীয়া দুর্গোৎসবের লাইভ সম্প্রচার, নাট্যানুষ্ঠান ও ভিডিও সংকলন — আলাদা ট্যাবে না গিয়ে এই পেজেই সরাসরি উপভোগ করুন। ক্লাব সদস্য ও অ্যাডমিনরা সরাসরি নতুন ভিডিও যোগ ও পরিচালনা করতে পারেন।
        </p>

        {/* Action Controls: Admin Add Video & Member Section Button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleOpenAdminAddVideo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all hover:scale-105 active:scale-95"
            title="শুধুমাত্র ক্লাব অ্যাডমিনদের জন্য পাসওয়ার্ড সুরক্ষিত"
          >
            <Lock className="w-4 h-4" />
            <span>নতুন অফিসিয়াল ভিডিও যোগ করুন (অ্যাডমিন লক)</span>
          </button>

          <button
            onClick={scrollToMemberSection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>সদস্যদের ভিডিও কর্নার ➔</span>
          </button>

          <a
            href={CLUB_INFO.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              window.open(CLUB_INFO.youtubeChannelUrl, '_blank', 'noopener,noreferrer');
            }}
            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Youtube className="w-4 h-4 fill-white" />
            <span>YouTube চ্যানেল</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>

      {/* 1. Main Interactive In-Page Theater Player */}
      <section ref={playerRef} id="main-video-player" className="space-y-6">
        <div className="rounded-3xl glass-card border border-amber-500/35 p-4 sm:p-7 relative overflow-hidden gold-glow shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {activeVideoDuration?.includes('লাইভ') && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${activeVideoDuration?.includes('লাইভ') ? 'text-red-400' : 'text-amber-300'}`}>
                    {activeVideoDuration}
                  </span>
                  {activeVideoTag && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                      {activeVideoTag}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white mt-0.5">
                  {activeVideoTitle}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-auto">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-all"
                title="ভিডিও লিংক কপি করুন"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{copiedLink ? 'কপি হয়েছে!' : 'শেয়ার লিংক'}</span>
              </button>

              {activeVideoType === 'youtube' && activeVideoId && activeVideoId !== 'local-video' && (
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-all"
                  title="প্রয়োজনে ইউটিউবে দেখুন"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Unified Video Player - Plays both local gallery video and YouTube directly on this page */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-inner flex items-center justify-center">
            {activeVideoType === 'local' && activeVideoFileUrl ? (
              <video
                ref={localVideoRef}
                key={activeVideoFileUrl}
                src={activeVideoFileUrl}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <iframe
                key={activeVideoId}
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                title={activeVideoTitle}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}
          </div>

          {/* Video Description & Information */}
          <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm text-stone-300">
            <div className="space-y-1">
              <p className="font-medium text-stone-200">{activeVideoDesc}</p>
              <p className="text-amber-300/80 text-xs">
                📍 স্থান: 11 স্টার ক্লাব, খুকুড়দহ আড়খানা, পশ্চিম মেদিনীপুর | {activeVideoType === 'local' ? 'অফিসিয়াল গ্যালারি ভিডিও' : '@devimahamaya11starclub'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeVideoType === 'local' ? 'গ্যালারি ভিডিও প্লে হচ্ছে' : 'এখানেই প্লে হচ্ছে'}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Official Channel Feed & Videos Collection (In-Page Click & Play) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>অফিসিয়াল ভিডিও তালিকা (ইন-পেজ প্লেয়ার)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
              সমস্ত অফিসিয়াল ভিডিও ও লাইভ ({filteredVideos.length}টি ভিডিও)
            </h3>
            <p className="text-stone-400 text-xs mt-0.5">
              যেকোনো ভিডিও কার্ডে ক্লিক করলে সরাসরি উপরের প্রধান প্লেয়ারে চালু হবে।
            </p>
          </div>

          {/* Filter Tabs & Admin Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `সব ভিডিও (${allOfficialVideos.length})` },
              { id: 'puja', label: '🪔 দুর্গোৎসব ও পূজার মুহূর্ত' },
              { id: 'work', label: '🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব' },
              { id: 'plantation', label: '🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা' },
              { id: 'social', label: '❤️ রক্তদান ও সমাজসেবা' },
              { id: 'cultural', label: '🎨 সাংস্কৃতিক অনুষ্ঠান' },
              { id: 'memories', label: '👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFilter === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                    : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10 hover:border-amber-500/30'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={handleOpenAdminAddVideo}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="অ্যাডমিন দ্বারা অফিসিয়াল ভিডিও যোগ করুন"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>অফিসিয়াল ভিডিও যোগ</span>
            </button>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video, idx) => {
            const isPlaying = (video.youtubeId && activeVideoId === video.youtubeId) || activeVideoId === video.id;
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                onClick={() => handleSelectVideo(video)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isPlaying
                    ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-[1.02]'
                    : 'border-amber-500/25 bg-black/60 hover:border-amber-400 hover:scale-[1.02] hover:shadow-lg'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={
                      video.thumbnailUrl ||
                      (video.youtubeId && video.youtubeId !== 'local-video'
                        ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                        : CLUB_INFO.images.heroDurga)
                    }
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = CLUB_INFO.images.heroDurga;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'bg-amber-500 text-black scale-110 shadow-lg'
                          : 'bg-black/75 text-amber-300 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {video.videoType === 'local' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
                        <FileVideo className="w-3 h-3" /> গ্যালারি ভিডিও
                      </span>
                    ) : video.duration?.includes('লাইভ') ? (
                      <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
                        <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-300 font-semibold text-[10px] border border-amber-500/30">
                        {video.duration || 'ভিডিও'}
                      </span>
                    )}
                  </div>

                  {/* Delete Button (If custom added official video - Admin only) */}
                  {video.isCustom && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <button
                        onClick={(e) => handlePromptDeleteOfficialVideo(e, video.id)}
                        title="এই অফিসিয়াল ভিডিওটি মুছে ফেলুন (অ্যাডমিন পাসওয়ার্ড আবশ্যক)"
                        className="p-1.5 rounded-lg bg-black/75 hover:bg-red-600/90 text-stone-300 hover:text-white border border-white/10 transition-colors shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {video.tag && (
                    <div className="absolute bottom-2 right-2">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-white/10">
                        {video.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-serif-bengali text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">
                      {video.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        isPlaying ? 'text-amber-400' : 'text-stone-300 group-hover:text-amber-300'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                          <span>বর্তমানে প্লে হচ্ছে</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current text-amber-400" />
                          <span>এখানেই চালান</span>
                        </>
                      )}
                    </span>

                    <span className="text-[10px] text-stone-400">
                      {video.isCustom ? 'অ্যাডমিন আপলোড' : '11 স্টার ক্লাব'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Community / Member Video Section */}
      <MemberCommunityVideos />

      {/* 4. Auto-Updating Live Feed Section (Auto Sync Channel Feed) */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
              <span>স্বয়ংক্রিয় আপডেট চ্যানেল ফিড (Auto-Sync Updated Videos)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
              ইউটিউব চ্যানেলের নতুন আপলোড ও লাইভ ফিড
            </h3>
            <p className="text-stone-300 text-xs mt-1">
              ইউটিউব চ্যানেলে যেকোনো নতুন ভিডিও আপলোড হওয়ার সাথে সাথে এখানে স্বয়ংক্রিয়ভাবে আপডেট চলে আসে।
            </p>
          </div>

          <a
            href={CLUB_INFO.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-500/30 w-fit"
          >
            <span>@devimahamaya11starclub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Elfsight Auto-Updating YouTube Gallery Widget Container */}
        <div className="rounded-3xl glass-card border border-amber-500/30 p-4 sm:p-6 min-h-[360px] relative overflow-hidden shadow-xl bg-black/40">
          <div
            className="elfsight-app-f61ac18e-a89c-4e34-bb00-5239d967a40e w-full"
            data-elfsight-app-lazy
          />
        </div>
      </section>

      {/* 5. Info Card / Footer Note */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm text-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <Youtube className="w-5 h-5 text-red-500 shrink-0" />
          <span>
            নতুন যেকোনো ভিডিও বা লাইভ স্ট্রিম আপলোড হওয়া মাত্রই এই পেজের প্লেয়ারে স্বয়ংক্রিয়ভাবে দেখার সুবিধা যুক্ত থাকে।
          </span>
        </div>
        <button
          onClick={() => {
            if (playerRef.current) {
              playerRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="text-xs font-bold text-amber-400 hover:underline shrink-0"
        >
          উপরে প্লেয়ারে যান ↑
        </button>
      </div>

      {/* Modals */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthOpen(false);
          setIsAddOfficialOpen(true);
        }}
        onGoToMemberSection={scrollToMemberSection}
        actionTitle="অফিসিয়াল ভিডিও যোগ করুন"
        description="ক্লাবের অফিসিয়াল চ্যানেলে নতুন ভিডিও যুক্ত করতে অ্যাডমিন পাসওয়ার্ড দিন। প্রতিটি আপলোডের ক্ষেত্রে অ্যাডমিন যাচাই বাধ্যতামূলক।"
        submitButtonText="পাসওয়ার্ড যাচাই করে আপলোড করুন"
      />

      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setVideoToDeleteId(null);
        }}
        onAuthenticated={handleConfirmDeleteOfficialVideo}
        actionTitle="অফিসিয়াল ভিডিও মুছে ফেলুন"
        description="অ্যাডমিনদের আপলোড করা এই অফিসিয়াল ভিডিওটি সাধারণ সদস্যরা মুছতে পারবেন না। নিশ্চিতভাবে মুছে ফেলতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নিশ্চিত মুছুন"
        isDangerousAction={true}
      />

      <AddOfficialVideoModal
        isOpen={isAddOfficialOpen}
        onClose={() => setIsAddOfficialOpen(false)}
        onAddVideo={handleAddOfficialVideo}
      />

      {/* Admin Locked Club Storage Access */}
      <div className="px-4 sm:px-6 lg:px-8 mt-12">
        <AdminStorageAccessCard onOpenAdminStorage={onOpenAdminStorage} />
      </div>
    </div>
  );
};
