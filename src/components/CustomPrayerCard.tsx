import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Music,
  Video,
  Volume2,
  BookOpen,
  FileText,
  Trash2,
  Calendar,
  User
} from 'lucide-react';
import { PrayerItem } from '../types';
import { getVideoBlob } from '../utils/videoStorageHelper';
import { getDriveVideoEmbedUrl, extractDriveFileId } from '../utils/driveHelper';
import { registerHtmlMediaElement, subscribeToMediaStop } from '../utils/mediaCoordinator';

interface CustomPrayerCardProps {
  item: PrayerItem;
  index: number;
  onDeleteRequest: (id: string) => void;
}

const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((d) => bengaliDigits[parseInt(d, 10)] || d)
    .join('');
};

export const CustomPrayerCard: React.FC<CustomPrayerCardProps> = ({
  item,
  index,
  onDeleteRequest
}) => {
  const [showLyrics, setShowLyrics] = useState(true);
  const [resolvedUrl, setResolvedUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    let createdUrl: string | null = null;

    if (item.mediaSource === 'local') {
      getVideoBlob(item.id)
        .then((blob) => {
          if (!isMounted) return;
          if (blob && blob instanceof Blob) {
            createdUrl = URL.createObjectURL(blob);
            setResolvedUrl(createdUrl);
          } else if (item.mediaUrl) {
            setResolvedUrl(item.mediaUrl);
          }
        })
        .catch(() => {
          if (isMounted && item.mediaUrl) {
            setResolvedUrl(item.mediaUrl);
          }
        });
    } else {
      setResolvedUrl(item.mediaUrl);
    }

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [item.id, item.mediaSource, item.mediaUrl]);

  const mediaSrc = resolvedUrl || item.mediaUrl;
  let embedSrc = item.embedUrl || mediaSrc;

  if (extractDriveFileId(mediaSrc)) {
    embedSrc = getDriveVideoEmbedUrl(mediaSrc);
  }

  const isDirectVideo =
    item.mediaSource === 'local' ||
    mediaSrc.startsWith('blob:') ||
    mediaSrc.startsWith('data:video') ||
    embedSrc.startsWith('blob:') ||
    mediaSrc.includes('.mp4') ||
    mediaSrc.includes('.webm') ||
    mediaSrc.includes('.mov');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const unsub = registerHtmlMediaElement(videoRef.current, `prayer-video-${item.id}`, 'video');
      return () => unsub();
    }
  }, [mediaSrc, item.id]);

  useEffect(() => {
    if (audioRef.current) {
      const unsub = registerHtmlMediaElement(audioRef.current, `prayer-audio-${item.id}`, 'audio');
      return () => unsub();
    }
  }, [mediaSrc, item.id]);

  useEffect(() => {
    const unsub = subscribeToMediaStop(`prayer-iframe-${item.id}`, () => {
      const iframe = document.querySelector('iframe[title="' + item.title + '"]') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
        } catch {}
      }
    });
    return () => unsub();
  }, [item.id, item.title]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-[#110b06] border border-amber-500/35 p-5 sm:p-8 shadow-2xl space-y-6"
    >
      {/* Top Bar with Title, Badges, and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
            {item.type === 'video' ? (
              <Video className="w-5 h-5 text-amber-300" />
            ) : (
              <Music className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                প্রার্থনা #{toBengaliNumber(index)}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-300/80">
                {item.type === 'video' ? 'ভিডিও প্রার্থনা' : 'সঙ্গীত / অডিও প্রার্থনা'}
              </span>
            </div>
            <h3 className="text-base sm:text-2xl font-bold font-serif-bengali text-white mt-1 truncate">
              {item.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.lyrics && (
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                showLyrics
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-white/5 border-white/10 text-stone-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showLyrics ? 'লিরিক্স লুকান' : 'লিরিক্স দেখুন'}</span>
            </button>
          )}

          <button
            onClick={() => onDeleteRequest(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 transition-colors"
            title="এই প্রার্থনা মুছে ফেলুন (অ্যাডমিন)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">মুছুন</span>
          </button>
        </div>
      </div>

      {/* Full Media Player: Video (Iframe or HTML5 Video) or Audio Player */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black shadow-lg relative">
        {item.type === 'video' ? (
          isDirectVideo ? (
            <video
              ref={videoRef}
              src={mediaSrc}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            <iframe
              src={embedSrc}
              title={item.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        ) : item.type === 'audio' ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#241306] via-[#140b05] to-black space-y-4 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Music className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
                {item.title}
              </h4>
              <p className="text-xs text-amber-300/80">
                {item.authorName || '11 স্টার ক্লাব প্রার্থনা পরিষদ'}
              </p>
            </div>
            <audio
              ref={audioRef}
              src={mediaSrc}
              controls
              className="w-full max-w-md rounded-xl shadow-md border border-amber-500/30"
              preload="metadata"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 text-amber-300 space-y-2">
            <Flame className="w-12 h-12 text-amber-400 animate-pulse" />
            <p className="text-sm font-serif-bengali">{item.title}</p>
          </div>
        )}
      </div>

      {/* Lyrics & Prayer Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        <div className={`${showLyrics && item.lyrics ? 'md:col-span-7' : 'md:col-span-12'} space-y-3`}>
          <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/25 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Volume2 className="w-4 h-4 text-amber-400" />
                প্রার্থনার বিবরণ
              </span>
              {item.dateAdded && (
                <span className="text-stone-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
                  {item.dateAdded}
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-bold font-serif-bengali text-white">
              {item.title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {item.description || '11 স্টার ক্লাবের বিশেষ প্রার্থনা।'}
            </p>
            {item.authorName && (
              <div className="pt-2 border-t border-amber-500/15 flex items-center gap-1.5 text-xs text-amber-300/85">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>নিবেদনে: {item.authorName}</span>
              </div>
            )}
          </div>
        </div>

        {showLyrics && item.lyrics && (
          <div className="md:col-span-5 p-5 rounded-2xl bg-[#160e08] border border-amber-500/25 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-serif-bengali">
                <BookOpen className="w-4 h-4 text-amber-400" />
                প্রার্থনার বাণী / লিরিক্স
              </span>
            </div>
            <div className="text-xs sm:text-sm font-serif-bengali leading-relaxed text-amber-100/90 whitespace-pre-line">
              {item.lyrics}
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};
