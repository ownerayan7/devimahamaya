import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Video,
  Play,
  Heart,
  Plus,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Tag as TagIcon,
  User,
  Calendar,
  Clock,
  Radio,
  ExternalLink
} from 'lucide-react';
import { MemberVideoItem, VideoItem } from '../types';
import { INITIAL_MEMBER_VIDEOS } from '../data/memberVideosData';
import { MemberVideoUploadModal } from './MemberVideoUploadModal';
import { getYouTubeThumbnail } from '../utils/youtubeHelper';
import { CLUB_INFO } from '../data/clubData';
import { deleteVideoBlob, getVideoBlob } from '../utils/videoStorageHelper';
import { broadcastMediaPlaybackStarted, registerHtmlMediaElement } from '../utils/mediaCoordinator';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = '11star_member_community_videos_v2';
const LIKES_STORAGE_KEY = '11star_member_video_likes_v2';

const getCreatedTimestamp = (v: any): number => {
  if (typeof v?.createdAt === 'number' && !isNaN(v.createdAt)) return v.createdAt;
  const match = String(v?.id || '').match(/\d{10,}/);
  if (match) {
    const ts = parseInt(match[0], 10);
    if (!isNaN(ts)) return ts;
  }
  return 0;
};

interface MemberCommunityVideosProps {
  onPlayVideo?: (video: VideoItem) => void;
  activeVideoId?: string;
}

export const MemberCommunityVideos: React.FC<MemberCommunityVideosProps> = () => {
  const [memberVideos, setMemberVideos] = useState<MemberVideoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dedicated member in-section player state
  const [selectedVideo, setSelectedVideo] = useState<MemberVideoItem | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const memberPlayerRef = useRef<HTMLDivElement | null>(null);
  const hasUserSelectedRef = useRef<boolean>(false);

  // Select and play member video directly inside this member section
  const handlePlayMemberVideo = async (v: MemberVideoItem, shouldScroll: boolean = false) => {
    hasUserSelectedRef.current = true;
    setSelectedVideo(v);
    broadcastMediaPlaybackStarted(`member-video-${v.id}`, v.videoType === 'local' ? 'video' : 'youtube');

    if (v.videoType === 'local' || Boolean(v.videoFileUrl)) {
      if (v.videoFileUrl && !v.videoFileUrl.startsWith('blob:')) {
        setSelectedFileUrl(v.videoFileUrl);
      } else {
        const blobData = await getVideoBlob(v.id);
        if (blobData) {
          if (typeof blobData === 'string') {
            setSelectedFileUrl(blobData);
          } else {
            const url = URL.createObjectURL(blobData);
            setSelectedFileUrl(url);
          }
        } else if (v.videoFileUrl) {
          setSelectedFileUrl(v.videoFileUrl);
        }
      }
    } else {
      setSelectedFileUrl('');
    }

    if (shouldScroll && memberPlayerRef.current) {
      memberPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Register HTML5 video with global media coordinator when active
  useEffect(() => {
    if (localVideoRef.current && selectedVideo?.videoType === 'local') {
      const unsub = registerHtmlMediaElement(localVideoRef.current, `member-video-${selectedVideo.id}`, 'video');
      return () => unsub();
    }
  }, [selectedVideo, selectedFileUrl]);

  // Load member videos and likes from localStorage on mount
  useEffect(() => {
    // 1. Initial load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let list = INITIAL_MEMBER_VIDEOS;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = [...parsed].sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
        }
      }
      setMemberVideos(list);
      if (list.length > 0) {
        handlePlayMemberVideo(list[0], false);
      }

      // Load like counts
      const counts: Record<string, number> = {};
      list.forEach((v) => {
        counts[v.id] = v.likes || 1;
      });

      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
      if (savedLikes) {
        setLikedMap(JSON.parse(savedLikes));
      }
      setLikeCounts(counts);
    } catch (e) {
      console.error('Failed to load member videos:', e);
      setMemberVideos(INITIAL_MEMBER_VIDEOS);
      if (INITIAL_MEMBER_VIDEOS.length > 0) {
        handlePlayMemberVideo(INITIAL_MEMBER_VIDEOS[0], false);
      }
    }

    // 2. Real-time Firestore sync
    try {
      const unsub = onSnapshot(
        collection(db, 'memberVideos'),
        (snapshot) => {
          const firestoreList: MemberVideoItem[] = [];
          snapshot.forEach((docSnap) => {
            firestoreList.push({
              ...(docSnap.data() as MemberVideoItem),
              id: docSnap.id,
            });
          });
          firestoreList.sort((a: any, b: any) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
          const finalList = firestoreList.length > 0 ? firestoreList : INITIAL_MEMBER_VIDEOS;
          setMemberVideos(finalList);

          if (!hasUserSelectedRef.current && finalList.length > 0) {
            handlePlayMemberVideo(finalList[0], false);
          }

          const counts: Record<string, number> = {};
          finalList.forEach((v) => {
            counts[v.id] = v.likes || 1;
          });
          setLikeCounts((prev) => ({ ...prev, ...counts }));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList));
          } catch {}
        },
        (err) => {
          console.warn('Firestore memberVideos snapshot notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore listener fallback:', e);
    }
  }, []);

  const saveVideos = (videos: MemberVideoItem[]) => {
    setMemberVideos(videos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to persist member videos:', e);
    }
  };

  const handleAddVideo = async (newVideo: MemberVideoItem) => {
    const videoWithTime: MemberVideoItem = {
      ...newVideo,
      createdAt: newVideo.createdAt || Date.now()
    };
    const updated = [videoWithTime, ...memberVideos.filter((v) => v.id !== videoWithTime.id)];
    updated.sort((a, b) => getCreatedTimestamp(b) - getCreatedTimestamp(a));
    saveVideos(updated);
    setLikeCounts((prev) => ({ ...prev, [videoWithTime.id]: videoWithTime.likes || 1 }));

    // Immediately play the newly added video inside THIS member section's player
    // (Stays strictly within this section, does NOT affect the top of the video page)
    await handlePlayMemberVideo(videoWithTime, true);

    try {
      await setDoc(doc(db, 'memberVideos', videoWithTime.id), videoWithTime);
    } catch (err) {
      console.warn('Firestore set memberVideo warning:', err);
    }
  };

  const handleDeleteVideo = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('আপনি কি নিশ্চিত যে এই সদস্য ভিডিওটি মুছে ফেলতে চান?')) {
      const updated = memberVideos.filter((v) => v.id !== id);
      saveVideos(updated);

      if (selectedVideo?.id === id) {
        if (updated.length > 0) {
          handlePlayMemberVideo(updated[0], false);
        } else {
          setSelectedVideo(null);
          setSelectedFileUrl('');
        }
      }

      try {
        await deleteVideoBlob(id);
      } catch (err) {
        console.warn('Failed to delete blob from storage:', err);
      }

      try {
        await deleteDoc(doc(db, 'memberVideos', id));
      } catch (err) {
        console.warn('Firestore delete memberVideo warning:', err);
      }
    }
  };

  const handleToggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isLiked = likedMap[id];
    const currentCount = likeCounts[id] || 0;
    const newCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

    const newLikedMap = { ...likedMap, [id]: !isLiked };
    const newCounts = { ...likeCounts, [id]: newCount };

    setLikedMap(newLikedMap);
    setLikeCounts(newCounts);

    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(newLikedMap));
    } catch (err) {
      console.error('Failed to save likes:', err);
    }
  };

  const handleShare = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url || window.location.href);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredVideos = activeCategory === 'all'
    ? memberVideos
    : memberVideos.filter((v) => v.category === activeCategory);

  const categories = [
    { id: 'all', label: `সব ভিডিও (${memberVideos.length})` },
    { id: 'puja', label: `🪔 দুর্গোৎসব ও পূজার মুহূর্ত (${memberVideos.filter((v) => v.category === 'puja').length})` },
    { id: 'work', label: `🔨 মণ্ডপসজ্জা ও প্রস্তুতি পর্ব (${memberVideos.filter((v) => v.category === 'work').length})` },
    { id: 'plantation', label: `🌱 বৃক্ষরোপণ ও পরিবেশ সচেতনতা (${memberVideos.filter((v) => v.category === 'plantation').length})` },
    { id: 'social', label: `❤️ রক্তদান ও সমাজসেবা (${memberVideos.filter((v) => v.category === 'social').length})` },
    { id: 'cultural', label: `🎨 সাংস্কৃতিক অনুষ্ঠান (${memberVideos.filter((v) => v.category === 'cultural').length})` },
    { id: 'memories', label: `👥 বন্ধু আড্ডা ও ক্লাবের স্মৃতি (${memberVideos.filter((v) => v.category === 'memories').length})` },
  ];

  return (
    <section id="member-community-videos" className="space-y-6 pt-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>কমিউনিটি ও মেম্বার্স ভিডিও প্ল্যাটফর্ম</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-white flex items-center gap-2 mt-0.5">
            <span>ক্লাব সদস্যদের নিজস্ব ভিডিও কর্নার</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-sans font-bold">
              {memberVideos.length}টি ক্লিপ
            </span>
          </h3>
          <p className="text-stone-300 text-xs mt-1 max-w-2xl">
            11 স্টার ক্লাবের সদস্য ও গ্রামবাসীদের তোলা পূজার আনন্দ, ঢাকের বোল, আরতি ও নাটকের ভিডিও — এই সেকশনেই সরাসরি দেখা যাবে।
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নিজের ভিডিও যোগ করুন (সদস্য)</span>
        </button>
      </div>

      {/* 1. Dedicated In-Section Member Video Player */}
      {selectedVideo && (
        <motion.div
          ref={memberPlayerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-emerald-950/40 via-black/85 to-[#05110d] border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.18)] space-y-4"
        >
          {/* Player Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-emerald-300 uppercase tracking-wider font-sans">
                সদস্যদের ভিডিও প্লেয়ার (এই সেকশনেই সম্প্রচার)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>তোলা হয়েছে: {selectedVideo.authorName}</span>
                {selectedVideo.authorRole && (
                  <span className="text-emerald-400/80 font-normal">({selectedVideo.authorRole})</span>
                )}
              </span>
              {selectedVideo.tag && (
                <span className="px-2.5 py-1 rounded-full bg-black/60 text-amber-300 border border-amber-500/20 font-medium">
                  {selectedVideo.tag}
                </span>
              )}
            </div>
          </div>

          {/* Player Media Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-emerald-500/30 shadow-inner flex items-center justify-center">
            {selectedVideo.videoType === 'local' && selectedFileUrl ? (
              <video
                ref={localVideoRef}
                key={selectedFileUrl}
                src={selectedFileUrl}
                controls
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <iframe
                key={selectedVideo.youtubeId || selectedVideo.id}
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
                title={selectedVideo.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}
          </div>

          {/* Video Metadata & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                {selectedVideo.title}
              </h4>
              {selectedVideo.description && (
                <p className="text-xs sm:text-sm text-stone-300">
                  {selectedVideo.description}
                </p>
              )}
              <p className="text-[11px] text-emerald-400/90 font-medium">
                ✨ সদস্যদের নিজস্ব তোলার ভিডিও এই সেকশনেই সরাসরি সম্প্রচার হচ্ছে | তারিখ: {selectedVideo.dateAdded || 'সাম্প্রতিক'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => handleToggleLike(e, selectedVideo.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  likedMap[selectedVideo.id]
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-white/5 text-stone-300 border-white/10 hover:border-red-400/40'
                }`}
                title="ভিডিও পছন্দ করুন"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${likedMap[selectedVideo.id] ? 'fill-red-500 text-red-500' : 'text-stone-400'}`}
                />
                <span>{likeCounts[selectedVideo.id] || 0} লাইক</span>
              </button>

              <button
                onClick={(e) => handleShare(e, selectedVideo.youtubeUrl || window.location.href, selectedVideo.id)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="শেয়ার করুন"
              >
                {copiedId === selectedVideo.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>শেয়ার</span>
                  </>
                )}
              </button>

              {selectedVideo.youtubeUrl && (
                <a
                  href={selectedVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>ইউটিউবে</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105'
                : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="p-8 rounded-3xl bg-black/40 border border-dashed border-emerald-500/30 text-center space-y-3">
          <Video className="w-10 h-10 text-emerald-400 mx-auto opacity-60" />
          <p className="text-stone-300 text-sm font-semibold">এই ক্যাটাগরিতে এখনো কোনো ভিডিও যোগ করা হয়নি।</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400"
          >
            প্রথম ভিডিও যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVideos.map((video, idx) => {
            const isPlaying = selectedVideo?.id === video.id;
            const isLiked = likedMap[video.id];
            const likes = likeCounts[video.id] || 0;
            const isNewest = idx === 0;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                onClick={() => handlePlayMemberVideo(video, true)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isPlaying
                    ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-[1.02]'
                    : 'border-emerald-500/25 bg-black/60 hover:border-emerald-400 hover:scale-[1.02] hover:shadow-lg'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={
                      video.thumbnailUrl ||
                      (video.youtubeId && video.youtubeId !== 'local-member-video'
                        ? getYouTubeThumbnail(video.youtubeId)
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
                          ? 'bg-emerald-400 text-black scale-110 shadow-lg'
                          : 'bg-black/75 text-emerald-300 group-hover:bg-emerald-400 group-hover:text-black group-hover:scale-110'
                      }`}
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges: Duration & Tags */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                    {isNewest && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold text-[10px] shadow">
                        সর্বশেষ আপলোড
                      </span>
                    )}
                    {isPlaying && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[10px] animate-pulse">
                        ▶ প্লে হচ্ছে
                      </span>
                    )}
                    {video.videoType === 'local' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                        গ্যালারি
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 backdrop-blur-md text-emerald-300 font-semibold text-[10px] border border-emerald-500/30">
                        {video.duration || 'সদস্য ক্লিপ'}
                      </span>
                    )}
                    {video.tag && (
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-amber-300 text-[10px] border border-white/10">
                        {video.tag}
                      </span>
                    )}
                  </div>

                  {/* Delete Button for member videos */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={(e) => handleDeleteVideo(e, video.id)}
                      title="এই ভিডিওটি মুছে ফেলুন"
                      className="p-1.5 rounded-lg bg-black/70 hover:bg-red-600/90 text-stone-300 hover:text-white border border-white/10 transition-colors shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-serif-bengali text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {video.title}
                    </h4>
                    {video.description && (
                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Author / Member Profile Bar */}
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-emerald-200 block truncate leading-tight">
                          {video.authorName}
                        </span>
                        <span className="text-[10px] text-stone-400 block truncate">
                          {video.authorRole || 'ক্লাব সদস্য'}
                        </span>
                      </div>
                    </div>

                    {/* Like & Share Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleToggleLike(e, video.id)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all ${
                          isLiked
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-white/5 text-stone-300 border-white/10 hover:border-red-400/40'
                        }`}
                        title="ভিডিও পছন্দ করুন"
                      >
                        <Heart
                          className={`w-3 h-3 ${isLiked ? 'fill-red-500 text-red-500' : 'text-stone-400'}`}
                        />
                        <span>{likes}</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(e, video.youtubeUrl || window.location.href, video.id)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors"
                        title="লিংক কপি করুন"
                      >
                        {copiedId === video.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Member Video Upload Modal */}
      <MemberVideoUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAddVideo={handleAddVideo}
      />
    </section>
  );
};
