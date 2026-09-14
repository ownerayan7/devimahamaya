import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Music,
  Video,
  Play,
  Plus,
  Trash2,
  Volume2
} from 'lucide-react';
import { RabindraSongItem } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AddRabindraSangeetModal } from '../components/AddRabindraSangeetModal';
import { AdminPhotoAuthModal } from '../components/AdminPhotoAuthModal';
import { broadcastMediaPlaybackStarted, registerHtmlMediaElement, subscribeToMediaStop } from '../utils/mediaCoordinator';
import { updateLockScreenMediaMetadata, pauseLockScreenMediaSession, clearLockScreenMediaMetadata } from '../utils/mediaSessionHelper';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = '11starclub_rabindra_songs_v1';

export const RabindraSangeetPage: React.FC = () => {
  // Songs state initialized from localStorage
  const [songs, setSongs] = useState<RabindraSongItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [activeSong, setActiveSong] = useState<RabindraSongItem | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isDeleteAuthOpen, setIsDeleteAuthOpen] = useState(false);
  const [songToDeleteId, setSongToDeleteId] = useState<string | null>(null);

  const { isAdminLoggedIn } = useAdminAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Firestore Real-Time Listener
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'rabindraSongs'),
        (snapshot) => {
          const firestoreItems: RabindraSongItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as RabindraSongItem;
            firestoreItems.push({
              ...data,
              id: docSnap.id,
            });
          });
          firestoreItems.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
          if (firestoreItems.length > 0) {
            setSongs(firestoreItems);
            setActiveSong((prev) => prev ? (firestoreItems.find(s => s.id === prev.id) || firestoreItems[0]) : firestoreItems[0]);
          } else {
            setSongs([]);
            setActiveSong(null);
          }
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(firestoreItems));
          } catch {}
        },
        (err) => {
          console.warn('Firestore rabindraSongs snapshot notice:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firestore connection fallback:', e);
    }
  }, []);

  // HTML5 Audio / Video coordination registration
  useEffect(() => {
    if (audioRef.current && activeSong) {
      const unsub = registerHtmlMediaElement(audioRef.current, `rabindra-${activeSong.id}`, 'audio');
      return () => unsub();
    }
  }, [activeSong]);

  useEffect(() => {
    if (videoRef.current && activeSong) {
      const unsub = registerHtmlMediaElement(videoRef.current, `rabindra-${activeSong.id}`, 'video');
      return () => unsub();
    }
  }, [activeSong]);

  const handleSelectActiveSong = (song: RabindraSongItem) => {
    setActiveSong(song);
    broadcastMediaPlaybackStarted(`rabindra-${song.id}`, 'rabindra');
    updateLockScreenMediaMetadata({
      title: song.title,
      artist: song.artist || 'রবীন্দ্রনাথ ঠাকুর',
      album: 'রবীন্দ্র সঙ্গীত সংগ্রহ — 11 স্টার ক্লাব',
      artworkUrl: '/icon.png',
      onPlay: () => {
        if (audioRef.current) audioRef.current.play().catch(() => {});
        if (videoRef.current) videoRef.current.play().catch(() => {});
      },
      onPause: () => {
        if (audioRef.current) audioRef.current.pause();
        if (videoRef.current) videoRef.current.pause();
        pauseLockScreenMediaSession();
      }
    });
  };

  const handleAddSong = async (newSong: RabindraSongItem) => {
    const updated = [newSong, ...songs];
    setSongs(updated);
    setActiveSong(newSong);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'rabindraSongs', newSong.id), newSong);
    } catch (err) {
      console.warn('Firestore add rabindra song warning:', err);
    }
  };

  const handleConfirmDeleteSong = async () => {
    if (songToDeleteId) {
      const updated = songs.filter((i) => i.id !== songToDeleteId);
      setSongs(updated);
      if (activeSong?.id === songToDeleteId) {
        setActiveSong(updated.length > 0 ? updated[0] : null);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn(err);
      }

      // Delete from Firestore
      try {
        await deleteDoc(doc(db, 'rabindraSongs', songToDeleteId));
      } catch (err) {
        console.warn('Firestore delete rabindra song error:', err);
      }
    }
    setIsDeleteAuthOpen(false);
    setSongToDeleteId(null);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header - Strictly "রবীন্দ্র সঙ্গীত" */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-b from-[#180f08] via-[#100a05] to-[#070402] border border-amber-500/30 p-6 sm:p-8 text-center space-y-3 shadow-xl"
      >
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold">
            <Music className="w-4 h-4 text-amber-400" />
            <span>রবীন্দ্র সঙ্গীত</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-serif-bengali text-gold-gradient">
          রবীন্দ্র সঙ্গীত
        </h1>

        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto">
          11 স্টার ক্লাবের বিশেষ রবীন্দ্র সঙ্গীত সংকলন।
        </p>

        {/* Admin Action Button - Always prompts for password */}
        <div className="pt-2 flex justify-center">
          <button
            id="add-rabindra-sangeet-btn"
            onClick={() => setIsAdminAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন রবীন্দ্র সঙ্গীত যোগ করুন</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {songs.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-[#120c08] border border-amber-500/25 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold font-serif-bengali text-white">
            এখনো কোনো রবীন্দ্র সঙ্গীত যোগ করা হয়নি
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
            শুধুমাত্র ক্লাবের অনুমোদিত অ্যাডমিন এখানে গান বা ভিডিও যুক্ত করতে এবং পরিচালনা করতে পারবেন।
          </p>
          <button
            onClick={() => setIsAdminAuthModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-200 text-xs font-bold transition-all active:scale-95"
          >
            + রবীন্দ্র সঙ্গীত যোগ করুন
          </button>
        </div>
      ) : (
        /* Player & Song List */
        <div className="space-y-8">
          {activeSong && (
            <div className="rounded-3xl bg-[#120c08] border border-amber-500/35 p-5 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                      {activeSong.title}
                    </h2>
                    {activeSong.artist && (
                      <span className="text-xs text-stone-400">শিল্পী / পরিবেশক: {activeSong.artist}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSongToDeleteId(activeSong.id);
                    setIsDeleteAuthOpen(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>মুছুন</span>
                </button>
              </div>

              {/* Media Embed / Player */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black shadow-lg">
                {activeSong.embedUrl ? (
                  <iframe
                    src={activeSong.embedUrl}
                    title={activeSong.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : activeSong.mediaType === 'audio' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-950/60 via-stone-900 to-black space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center shadow">
                      <Music className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white font-serif-bengali">{activeSong.title}</h3>
                    <audio ref={audioRef} src={activeSong.mediaUrl} controls className="w-full max-w-md rounded-lg" />
                  </div>
                ) : (
                  <video ref={videoRef} src={activeSong.mediaUrl} controls playsInline className="w-full h-full object-contain" />
                )}
              </div>

              {activeSong.description && (
                <p className="text-xs sm:text-sm text-stone-300 p-3 rounded-xl bg-black/40 border border-white/5">
                  {activeSong.description}
                </p>
              )}
            </div>
          )}

          {/* Songs List */}
          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif-bengali text-amber-200">
              সকল রবীন্দ্র সঙ্গীত ({songs.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleSelectActiveSong(song)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    activeSong?.id === song.id
                      ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-[#120c08] border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white font-serif-bengali truncate">
                        {song.title}
                      </h4>
                      {song.artist && (
                        <span className="text-[11px] text-stone-400 truncate block">
                          {song.artist}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSongToDeleteId(song.id);
                      setIsDeleteAuthOpen(true);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-colors shrink-0"
                    title="মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Song Modal */}
      <AddRabindraSangeetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSong={handleAddSong}
      />

      {/* Gate 1: Password Prompt for Adding Song (Requested Every Time) */}
      <AdminPhotoAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthenticated={() => {
          setIsAdminAuthModalOpen(false);
          setIsAddModalOpen(true);
        }}
        actionTitle="নতুন রবীন্দ্র সঙ্গীত যোগ করুন"
        description="ক্লাবের রবীন্দ্র সঙ্গীত সংকলনে নতুন গান বা ভিডিও যোগ করতে অ্যাডমিন পাসওয়ার্ড দিন। প্রতিটি সংযোজনের জন্য পাসওয়ার্ড যাচাই বাধ্যতামূলক।"
        submitButtonText="পাসওয়ার্ড যাচাই করে গান যোগ করুন"
      />

      {/* Gate 2: Password Prompt for Deleting Song (Requested Every Time) */}
      <AdminPhotoAuthModal
        isOpen={isDeleteAuthOpen}
        onClose={() => {
          setIsDeleteAuthOpen(false);
          setSongToDeleteId(null);
        }}
        onAuthenticated={handleConfirmDeleteSong}
        actionTitle="রবীন্দ্র সঙ্গীত মুছে ফেলুন"
        description="যুক্ত করা এই রবীন্দ্র সঙ্গীতটি নিশ্চিতভাবে মুছে ফেলতে অ্যাডমিন পাসওয়ার্ড দিন।"
        submitButtonText="পাসওয়ার্ড যাচাই করে নিশ্চিত মুছুন"
        isDangerousAction={true}
      />
    </div>
  );
};
