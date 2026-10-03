import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  ExternalLink,
  Youtube,
  Sparkles,
  RefreshCw,
  Radio,
  Tv,
  Film,
  Share2,
  Check,
  Plus,
  Users,
  Trash2,
  Heart,
  Video,
  Clock,
  AlertCircle,
  Eye,
  Globe,
  MessageCircle,
  Instagram
} from 'lucide-react';
import { CLUB_INFO, FEATURED_VIDEOS } from '../data/clubData';
import { INITIAL_MEMBER_VIDEOS } from '../data/memberVideosData';
import { VideoItem, MemberVideoItem } from '../types';
import { AddOfficialVideoModal } from '../components/AddOfficialVideoModal';
import { MemberVideoUploadModal } from '../components/MemberVideoUploadModal';
import { HlsVideoPlayer } from '../components/HlsVideoPlayer';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { getVideoBlob, deleteVideoBlob } from '../utils/videoStorageHelper';
import { parseUniversalMedia, getPublicMediaUrl, isFacebookVideoUrl, isInstagramUrl } from '../utils/mediaEmbedHelper';
import { extractYouTubeId } from '../utils/youtubeHelper';
import { copyTextToClipboard } from '../utils/clipboardHelper';
import { broadcastMediaPlaybackStarted, subscribeToMediaStop, registerHtmlMediaElement } from '../utils/mediaCoordinator';
import { getDeviceId, isDeviceUploader } from '../utils/deviceHelper';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { loadPersistentItems, savePersistentItems, addDeletedId, isDeleted, mergeItemsWithLocal, markItemGloballyDeleted } from '../utils/persistentStorage';
import { sendAppNotification } from '../utils/notificationHelper';

const OFFICIAL_STORAGE_KEY = '11star_custom_official_videos_v5';
const MEMBER_STORAGE_KEY = '11star_member_community_videos_v5';
const LIKES_STORAGE_KEY = '11star_videos_likes_v5';

// 1. Exact 4 Default Official Videos & Exact 1 Default Sodosoo Video initially as requested (Point 1)
const DEFAULT_OFFICIAL_VIDEOS_4 = FEATURED_VIDEOS.slice(0, 4);
const DEFAULT_MEMBER_VIDEOS_1 = INITIAL_MEMBER_VIDEOS.slice(0, 1);

export interface UnifiedVideoCardItem {
  id: string;
  title: string;
  description: string;
  sourceType: 'official' | 'member';
  category: string;
  videoType: 'youtube' | 'local' | 'facebook' | 'direct' | 'drive' | 'stream';
  youtubeId?: string;
  youtubeUrl?: string;
  videoFileUrl?: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorRole?: string;
  duration?: string;
  tag?: string;
  likesCount: number;
  dateAdded: string;
  createdAt: number;
  uploaderDeviceId?: string;
  isCustom?: boolean;
}

const getTimestamp = (v: any): number => {
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

export const VideosPage: React.FC<VideosPageProps> = () => {
  // Official Videos (Club Admin Videos)
  const [officialVideos, setOfficialVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(OFFICIAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_OFFICIAL_VIDEOS_4;
  });

  // Member Videos (Sodosoo Videos)
  const [memberVideos, setMemberVideos] = useState<MemberVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(MEMBER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MEMBER_VIDEOS_1;
  });

  // UI Filters & Modals
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'member'>('all');
  const [isAddOfficialOpen, setIsAddOfficialOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  // Admin Auth Modals
  const [isAdminUploadAuthOpen, setIsAdminUploadAuthOpen] = useState(false);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<UnifiedVideoCardItem | null>(null);

  // Likes & Shares
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Lightbox Fullscreen Video Player State
  const [activeLightboxVideo, setActiveLightboxVideo] = useState<UnifiedVideoCardItem | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Load Likes State
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
      if (savedLikes) {
        setUserLikedMap(JSON.parse(savedLikes));
      }
    } catch (e) {}
  }, []);

  // Sync Official Videos from Firestore in Real-Time with persistent load merging
  useEffect(() => {
    loadPersistentItems<VideoItem>(OFFICIAL_STORAGE_KEY).then((saved) => {
      if (saved && saved.length > 0) {
        setOfficialVideos(saved);
      }
    });

    const unsub = onSnapshot(collection(db, 'officialVideos'), (snapshot) => {
      const firestoreList: VideoItem[] = [];
      snapshot.forEach((docSnap) => {
        firestoreList.push({
          ...(docSnap.data() as VideoItem),
          id: docSnap.id,
        });
      });

      loadPersistentItems<VideoItem>(OFFICIAL_STORAGE_KEY).then((local) => {
        const merged = mergeItemsWithLocal(firestoreList, local);
        const filteredWithDefaults = [
          ...merged,
          ...DEFAULT_OFFICIAL_VIDEOS_4.filter((init) => !merged.some((f) => f.id === init.id) && !isDeleted(init.id))
        ];
        const sorted = filteredWithDefaults.sort((a, b) => getTimestamp(b) - getTimestamp(a));
        setOfficialVideos(sorted);
        savePersistentItems(OFFICIAL_STORAGE_KEY, sorted);
      });
    }, (err) => {
      console.warn('Firestore officialVideos notice:', err);
    });

    return () => unsub();
  }, []);

  // Sync Member Videos from Firestore in Real-Time with persistent load merging
  useEffect(() => {
    loadPersistentItems<MemberVideoItem>(MEMBER_STORAGE_KEY).then((saved) => {
      if (saved && saved.length > 0) {
        setMemberVideos(saved);
      }
    });

    const unsub = onSnapshot(collection(db, 'memberVideos'), (snapshot) => {
      const firestoreList: MemberVideoItem[] = [];
      snapshot.forEach((docSnap) => {
        firestoreList.push({
          ...(docSnap.data() as MemberVideoItem),
          id: docSnap.id,
        });
      });

      loadPersistentItems<MemberVideoItem>(MEMBER_STORAGE_KEY).then((local) => {
        const merged = mergeItemsWithLocal(firestoreList, local);
        const filteredWithDefaults = [
          ...merged,
          ...DEFAULT_MEMBER_VIDEOS_1.filter((init) => !merged.some((f) => f.id === init.id) && !isDeleted(init.id))
        ];
        const sorted = filteredWithDefaults.sort((a, b) => getTimestamp(b) - getTimestamp(a));
        setMemberVideos(sorted);
        savePersistentItems(MEMBER_STORAGE_KEY, sorted);
      });
    }, (err) => {
      console.warn('Firestore memberVideos notice:', err);
    });

    return () => unsub();
  }, []);

  // Combine Official & Member Videos into a unified feed
  const unifiedFeed: UnifiedVideoCardItem[] = React.useMemo(() => {
    const list: UnifiedVideoCardItem[] = [];

    // Official Club Videos
    officialVideos.forEach((v) => {
      let vType: UnifiedVideoCardItem['videoType'] = 'youtube';
      const checkUrl = (v.videoFileUrl || v.youtubeUrl || '').toLowerCase();
      const isStreamOrLocal = v.videoType === 'local' || v.videoType === 'stream' || checkUrl.includes('m3u8') || checkUrl.includes('cloudflare') || checkUrl.includes('bunny') || checkUrl.includes('hls');
      if (isStreamOrLocal) {
        vType = 'local';
      } else if (v.youtubeUrl && isFacebookVideoUrl(v.youtubeUrl)) {
        vType = 'facebook';
      } else if (v.videoFileUrl && isFacebookVideoUrl(v.videoFileUrl)) {
        vType = 'facebook';
      }

      list.push({
        id: v.id,
        title: v.title,
        description: v.description || '১১ স্টার ক্লাবের অফিসিয়াল পরিবেশনা।',
        sourceType: 'official',
        category: v.category || 'puja',
        videoType: vType,
        youtubeId: v.youtubeId,
        youtubeUrl: v.youtubeUrl,
        videoFileUrl: v.videoFileUrl,
        thumbnailUrl: v.thumbnailUrl || (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg` : undefined),
        authorName: 'অ্যাডমিন (১১ স্টার ক্লাব)',
        authorRole: 'অফিসিয়াল পাবলিশার',
        duration: v.duration || 'ভিডিও',
        tag: v.tag || 'অফিসিয়াল',
        likesCount: likesMap[v.id] || 15,
        dateAdded: 'অফিসিয়াল ভিডিও',
        createdAt: getTimestamp(v),
        uploaderDeviceId: v.uploaderDeviceId,
        isCustom: v.isCustom
      });
    });

    // Member Submitted Videos
    memberVideos.forEach((m) => {
      let vType: UnifiedVideoCardItem['videoType'] = 'youtube';
      const checkUrl = (m.videoFileUrl || m.youtubeUrl || '').toLowerCase();
      const isStreamOrLocal = m.videoType === 'local' || m.videoType === 'stream' || checkUrl.includes('m3u8') || checkUrl.includes('cloudflare') || checkUrl.includes('bunny') || checkUrl.includes('hls');
      if (isStreamOrLocal) {
        vType = 'local';
      } else if (m.youtubeUrl && isFacebookVideoUrl(m.youtubeUrl)) {
        vType = 'facebook';
      } else if (m.videoFileUrl && isFacebookVideoUrl(m.videoFileUrl)) {
        vType = 'facebook';
      }

      list.push({
        id: m.id,
        title: m.title,
        description: m.description || 'ক্লাব সদস্যের শেয়ার করা স্মরণীয় ভিডিও।',
        sourceType: 'member',
        category: m.category || 'puja',
        videoType: vType,
        youtubeId: m.youtubeId !== 'local-member-video' ? m.youtubeId : undefined,
        youtubeUrl: m.youtubeUrl,
        videoFileUrl: m.videoFileUrl,
        thumbnailUrl: m.thumbnailUrl || (m.youtubeId && m.youtubeId !== 'local-member-video' ? `https://img.youtube.com/vi/${m.youtubeId}/hqdefault.jpg` : undefined),
        authorName: m.authorName || 'ক্লাব সদস্য',
        authorRole: m.authorRole || 'সদস্য',
        duration: m.duration || 'সদস্য ভিডিও',
        tag: 'সদস্য কর্নার',
        likesCount: (likesMap[m.id] || m.likes || 8),
        dateAdded: m.dateAdded || 'সাম্প্রতিক',
        createdAt: getTimestamp(m),
        uploaderDeviceId: m.uploaderDeviceId,
        isCustom: m.isCustom
      });
    });

    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [officialVideos, memberVideos, likesMap]);

  // Filtered List
  const filteredFeed = React.useMemo(() => {
    if (activeTab === 'official') return unifiedFeed.filter((item) => item.sourceType === 'official');
    if (activeTab === 'member') return unifiedFeed.filter((item) => item.sourceType === 'member');
    return unifiedFeed;
  }, [unifiedFeed, activeTab]);

  // Handle Official Video Upload Request (Requires Admin Authentication)
  const handleRequestOfficialUpload = () => {
    setIsAdminUploadAuthOpen(true);
  };

  // On Admin Upload Password Authenticated
  const handleAdminUploadAuthSuccess = () => {
    setIsAdminUploadAuthOpen(false);
    setIsAddOfficialOpen(true);
  };

  // Add Official Video Handler
  const handleAddOfficialVideo = async (newVideo: VideoItem) => {
    const updated = [newVideo, ...officialVideos.filter((v) => v.id !== newVideo.id)];
    setOfficialVideos(updated);
    savePersistentItems(OFFICIAL_STORAGE_KEY, updated);

    try {
      await setDoc(doc(db, 'officialVideos', newVideo.id), newVideo);
    } catch (e) {
      console.warn('Firestore official video sync error:', e);
    }

    // Corrected Notification call with correct parameters (Point 3)
    try {
      sendAppNotification(
        '🎬 নতুন অফিসিয়াল ভিডিও প্রকাশিত হয়েছে!',
        `"${newVideo.title}" ১১ স্টার ক্লাবের অফিশিয়াল ভিডিও গ্যালারিতে যোগ করা হয়েছে।`,
        'media',
        'videos'
      );
    } catch (err) {
      console.warn('App notification error:', err);
    }
  };

  // Add Member Video Handler
  const handleAddMemberVideo = async (newVideo: MemberVideoItem) => {
    const updated = [newVideo, ...memberVideos.filter((m) => m.id !== newVideo.id)];
    setMemberVideos(updated);
    savePersistentItems(MEMBER_STORAGE_KEY, updated);

    try {
      await setDoc(doc(db, 'memberVideos', newVideo.id), newVideo);
    } catch (e) {
      console.warn('Firestore member video sync error:', e);
    }

    // Corrected Notification call with correct parameters (Point 3)
    try {
      sendAppNotification(
        '📹 নতুন সদস্য ভিডিও যোগ হয়েছে!',
        `${newVideo.authorName} একটি নতুন সুন্দর ভিডিও শেয়ার করেছেন: "${newVideo.title}"`,
        'media',
        'videos'
      );
    } catch (err) {
      console.warn('App notification error:', err);
    }
  };

  // Smart Deletion Trigger Logic:
  // - Prompt Admin Passcode Auth PIN (Ayan@2024).
  const promptDeleteVideo = (item: UnifiedVideoCardItem) => {
    setItemToDelete(item);
    setIsDeleteAuthOpen(true);
  };

  // Global deletion event listener
  useEffect(() => {
    const handleGlobalDeleteEvent = () => {
      setOfficialVideos((prev) => prev.filter((v) => !isDeleted(v.id)));
      setMemberVideos((prev) => prev.filter((m) => !isDeleted(m.id)));
    };
    window.addEventListener('global_item_deleted', handleGlobalDeleteEvent);
    return () => window.removeEventListener('global_item_deleted', handleGlobalDeleteEvent);
  }, []);

  // Execute Deletion
  const executeDelete = async (item: UnifiedVideoCardItem) => {
    const colName = item.sourceType === 'official' ? 'officialVideos' : 'memberVideos';
    await markItemGloballyDeleted(item.id, colName);

    if (item.sourceType === 'official') {
      const updated = officialVideos.filter((v) => v.id !== item.id);
      setOfficialVideos(updated);
      savePersistentItems(OFFICIAL_STORAGE_KEY, updated);
    } else {
      const updated = memberVideos.filter((m) => m.id !== item.id);
      setMemberVideos(updated);
      savePersistentItems(MEMBER_STORAGE_KEY, updated);
    }

    try {
      await deleteVideoBlob(item.id);
    } catch (e) {}

    setItemToDelete(null);
    setIsDeleteAuthOpen(false);
  };

  // Toggle Like
  const handleToggleLike = (id: string) => {
    const isLiked = userLikedMap[id];
    const newLikedState = !isLiked;
    const newMap = { ...userLikedMap, [id]: newLikedState };
    setUserLikedMap(newMap);
    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(newMap));
    } catch (e) {}

    setLikesMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 12) + (newLikedState ? 1 : -1)
    }));
  };

  // Share
  const handleShareVideo = (item: UnifiedVideoCardItem) => {
    copyTextToClipboard(window.location.href);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen pb-24 text-stone-100 font-bengali">
      {/* Top Banner Header */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-950 via-red-950/30 to-stone-950 border-b border-amber-500/20">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{CLUB_INFO.nameBn} • ভিডিও ও মিডিয়া গ্যালারি</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
            ভিডিও গ্যালারি ও সরাসরি সম্প্রচার
          </h1>

          <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base leading-relaxed">
            ১১ স্টার ক্লাবের অফিশিয়াল দুর্গোৎসব, সাংস্কৃতিক পরিবেশনা এবং সম্মানীয় সদস্যদের শেয়ার করা ভিডিও পৃথিবীর যেকোনো প্রান্তে বসেই উপভোগ করুন।
          </p>

          {/* Action Buttons with Corrected (সদস্যের) Label Removal (Point 2) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRequestOfficialUpload}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-amber-300/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>অফিসিয়াল ভিডিও আপলোড (অ্যাডমিন)</span>
            </button>

            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span>আপনার ভিডিও পোস্ট করুন</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Authentic Official Social Media Channels Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-900/90 via-zinc-900/90 to-stone-900/90 border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>অফিসিয়াল সোশ্যাল মিডিয়া চ্যানেল ও সরাসরি সম্প্রচার</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-bengali text-amber-200">
                ১১ স্টার ক্লাবের অফিসিয়াল প্ল্যাটফর্মসমূহ
              </h2>
              <p className="text-xs sm:text-sm text-stone-300">
                আমাদের অফিশিয়াল সোশ্যাল চ্যানেলগুলিতে যুক্ত থাকুন ও দুর্গোৎসব ও ক্লাব কার্যক্রম সরাসরি দেখুন।
              </p>
            </div>

            {/* Official Authentic Links */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full md:w-auto">
              <a
                href={CLUB_INFO.youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={CLUB_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Facebook</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={CLUB_INFO.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={CLUB_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition-all"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 overflow-x-auto gap-2">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>সব ভিডিও ({unifiedFeed.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('official')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'official'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>অফিসিয়াল ভিডিও (অ্যাডমিন) ({officialVideos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('member')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'member'
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>সদস্যদের ভিডিও (সদস্য কর্নার) ({memberVideos.length})</span>
            </button>
          </div>
        </div>

        {/* Sequential Video Cards Feed ("পর পর ভিডিও তালিকা") */}
        {filteredFeed.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-stone-900/50 border border-amber-500/20 space-y-4">
            <Tv className="w-12 h-12 text-amber-500/40 mx-auto" />
            <h3 className="text-lg font-bold text-amber-200">কোনো ভিডিও পাওয়া যায়নি</h3>
            <p className="text-xs sm:text-sm text-stone-400">
              আপনি প্রথম সদস্য হিসেবে একটি সুন্দর ভিডিও পোস্ট করতে পারেন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeed.map((item) => (
              <VideoCard
                key={item.id}
                item={item}
                isLiked={Boolean(userLikedMap[item.id])}
                isCopied={copiedId === item.id}
                isActive={activeVideoId === item.id}
                onPlay={() => setActiveVideoId(item.id)}
                onToggleLike={() => handleToggleLike(item.id)}
                onShare={() => handleShareVideo(item)}
                onDelete={() => promptDeleteVideo(item)}
                onOpenLightbox={() => setActiveLightboxVideo(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Official Video Modal (Admin) */}
      <AddOfficialVideoModal
        isOpen={isAddOfficialOpen}
        onClose={() => setIsAddOfficialOpen(false)}
        onAddVideo={handleAddOfficialVideo}
      />

      {/* Add Member Video Modal */}
      <MemberVideoUploadModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddVideo={handleAddMemberVideo}
      />

      {/* Admin Passcode Modal for Official Video Upload */}
      <AdminPhotoAuthModal
        isOpen={isAdminUploadAuthOpen}
        onClose={() => setIsAdminUploadAuthOpen(false)}
        onAuthenticated={handleAdminUploadAuthSuccess}
      />

      {/* Admin Passcode Modal for Video Deletion */}
      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setItemToDelete(null);
        }}
        onAuthenticated={() => {
          if (itemToDelete) executeDelete(itemToDelete);
        }}
      />

      {/* Lightbox Fullscreen Video Player Modal */}
      <AnimatePresence>
        {activeLightboxVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-lg overflow-y-auto"
            onClick={() => setActiveLightboxVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl bg-stone-900 border border-amber-500/40 overflow-hidden shadow-2xl my-auto space-y-4 p-4 sm:p-6 relative"
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {activeLightboxVideo.sourceType === 'official' ? 'অফিসিয়াল ভিডিও (অ্যাডমিন)' : 'সদস্য পরিবেশনা'}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white font-serif-bengali">
                    {activeLightboxVideo.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveLightboxVideo(null)}
                  className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Player Container */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-stone-800 relative">
                <VideoPlayerEngine item={activeLightboxVideo} autoPlay={true} />
              </div>

              <div className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                <p>{activeLightboxVideo.description}</p>
                <div className="mt-3 flex items-center justify-between text-stone-400 text-xs">
                  <span>আপলোডার: {activeLightboxVideo.authorName}</span>
                  <span>{activeLightboxVideo.duration}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-Component: Individual Video Card
interface VideoCardProps {
  item: UnifiedVideoCardItem;
  isLiked: boolean;
  isCopied: boolean;
  isActive: boolean;
  onPlay: () => void;
  onToggleLike: () => void;
  onShare: () => void;
  onDelete: () => void;
  onOpenLightbox: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  item,
  isLiked,
  isCopied,
  isActive,
  onPlay,
  onToggleLike,
  onShare,
  onDelete,
  onOpenLightbox
}) => {
  const isOwner = isDeviceUploader(item.uploaderDeviceId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-gradient-to-b from-stone-900/90 via-zinc-900/80 to-stone-950 border border-amber-500/30 overflow-hidden shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition-all group"
    >
      <div className="space-y-3 p-4 sm:p-5">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                item.sourceType === 'official'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {item.sourceType === 'official' ? 'অফিসিয়াল' : 'সদস্য ভিডিও'}
            </span>

            <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px] font-semibold">
              {item.videoType === 'local' ? 'গ্যালারি ভিডিও' : item.videoType === 'facebook' ? 'Facebook' : 'YouTube'}
            </span>
          </div>

          <button
            onClick={onDelete}
            title="ভিডিও মুছুন (অ্যাডমিন পাসকোড প্রয়োজন)"
            className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1 text-xs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Engine Container with Mutual Exclusive Click-to-Play */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-stone-800/80 relative">
          {isActive ? (
            <VideoPlayerEngine item={item} autoPlay={true} />
          ) : (
            <div
              onClick={onPlay}
              className="w-full h-full relative cursor-pointer group/player overflow-hidden"
              title="ভিডিও প্লে করুন"
            >
              <img
                src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80'}
                alt={item.title}
                className="w-full h-full object-cover group-hover/player:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover/player:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/90 group-hover/player:bg-amber-400 group-hover/player:scale-110 flex items-center justify-center text-black shadow-lg shadow-amber-500/30 transition-all duration-300">
                  <Play className="w-6 h-6 fill-black translate-x-0.5 text-black" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Uploader Meta */}
        <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-stone-300">{item.authorName}</span>
          </div>
          <div className="flex items-center gap-1 text-stone-500 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{item.duration}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-stone-950/80 border-t border-amber-500/15 flex items-center justify-between gap-2 text-xs">
        <button
          onClick={onToggleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            isLiked
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'text-stone-400 hover:text-amber-300 hover:bg-stone-900'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{item.likesCount}</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-900 font-bold transition-all"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          <span>{isCopied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
        </button>

        <button
          onClick={onOpenLightbox}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>ফুলস্ক্রিন</span>
        </button>
      </div>
    </motion.div>
  );
};

// Sub-Component: Video Player Engine with Mutual Exclusive Auto-Pause
interface VideoPlayerEngineProps {
  item: UnifiedVideoCardItem;
  autoPlay?: boolean;
}

const VideoPlayerEngine: React.FC<VideoPlayerEngineProps> = ({ item, autoPlay = false }) => {
  const [resolvedBlobUrl, setResolvedBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isStreamType = item.videoType === 'stream' || item.videoType === 'local' || (item.videoFileUrl && (item.videoFileUrl.includes('m3u8') || item.videoFileUrl.includes('cloudflare') || item.videoFileUrl.includes('bunny') || item.videoFileUrl.includes('hls')));
  const rawMediaUrl = isStreamType ? (item.videoFileUrl || item.youtubeUrl || '') : (item.youtubeUrl || item.videoFileUrl || '');
  const mediaUrl = getPublicMediaUrl(rawMediaUrl);
  const parsed = parseUniversalMedia(mediaUrl);

  // Subscribe to mutual exclusivity media stop event
  useEffect(() => {
    const mediaId = `video-${item.id}`;
    const unsub = subscribeToMediaStop(mediaId, () => {
      if (videoRef.current && !videoRef.current.paused) {
        try {
          videoRef.current.pause();
        } catch {}
      }
    });
    return () => unsub();
  }, [item.id]);

  // Register HTML5 Video Element with Media Coordinator
  useEffect(() => {
    if (videoRef.current && (parsed.type === 'direct-video' || parsed.type === 'local' || resolvedBlobUrl)) {
      const mediaId = `video-${item.id}`;
      const unsub = registerHtmlMediaElement(videoRef.current, mediaId, 'video');
      return () => unsub();
    }
  }, [item.id, parsed.type, resolvedBlobUrl]);

  // Resolve Local Video Blob / URL or HLS / Stream files
  useEffect(() => {
    let isMounted = true;

    const isStreamOrLocal = parsed.type === 'direct-video' || parsed.type === 'local' || mediaUrl.includes('.m3u8') || mediaUrl.includes('cloudflare') || mediaUrl.includes('bunny');
    
    if (isStreamOrLocal) {
      setLoading(true);
      if (mediaUrl && !mediaUrl.startsWith('blob:')) {
        setResolvedBlobUrl(getPublicMediaUrl(mediaUrl));
        setLoading(false);
      } else {
        getVideoBlob(item.id).then((blobData) => {
          if (!isMounted) return;
          if (blobData) {
            if (typeof blobData === 'string') {
              setResolvedBlobUrl(getPublicMediaUrl(blobData));
            } else {
              const url = URL.createObjectURL(blobData);
              setResolvedBlobUrl(url);
            }
          } else if (mediaUrl) {
            setResolvedBlobUrl(getPublicMediaUrl(mediaUrl));
          } else {
            setError('ভিডিও ফাইলটি পাওয়া যায়নি।');
          }
          setLoading(false);
        }).catch(() => {
          if (isMounted) setLoading(false);
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [item, parsed.type, mediaUrl]);

  const handlePlayStart = () => {
    broadcastMediaPlaybackStarted(`video-${item.id}`, 'video', videoRef.current);
  };

  const isStreamOrLocal = parsed.type === 'direct-video' || parsed.type === 'local' || mediaUrl.includes('.m3u8') || mediaUrl.includes('cloudflare') || mediaUrl.includes('bunny') || resolvedBlobUrl;

  // 1. Stream or Local or direct MP4/M3U8
  if (isStreamOrLocal) {
    if (loading) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-amber-400 text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>ভিডিও প্রস্তুত হচ্ছে...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950 text-stone-400 text-xs p-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mb-1" />
          <span>{error}</span>
        </div>
      );
    }

    return (
      <HlsVideoPlayer
        src={resolvedBlobUrl || mediaUrl}
        poster={item.thumbnailUrl}
        autoPlay={autoPlay}
        onPlay={handlePlayStart}
      />
    );
  }

  // 2. Facebook or Instagram Embedded Video
  if (parsed.type === 'facebook' || isFacebookVideoUrl(mediaUrl) || isInstagramUrl(mediaUrl)) {
    const embedSrc = parsed.embedUrl || `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(mediaUrl)}&show_text=false`;
    return (
      <iframe
        src={embedSrc}
        className="w-full h-full border-0"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
        title={item.title}
      />
    );
  }

  // 3. Google Drive Video
  if (parsed.type === 'drive') {
    return (
      <iframe
        src={parsed.embedUrl}
        className="w-full h-full border-0"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title={item.title}
      />
    );
  }

  // 4. YouTube Video Embed (Default Fallback)
  const youtubeId = extractYouTubeId(mediaUrl) || item.youtubeId || '_65N3D5zTYg';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1${
    autoPlay ? '&autoplay=1' : ''
  }`;

  return (
    <iframe
      src={embedUrl}
      className="w-full h-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      title={item.title}
    />
  );
};
