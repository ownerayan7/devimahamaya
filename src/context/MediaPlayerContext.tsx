import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { broadcastMediaPlaybackStarted, subscribeToMediaStop } from '../utils/mediaCoordinator';
import {
  updateLockScreenMediaMetadata,
  pauseLockScreenMediaSession,
  clearLockScreenMediaMetadata
} from '../utils/mediaSessionHelper';

export interface GitaChapterInfo {
  number: number;
  title: string;
  description: string;
  durationEstimate?: string;
}

export const GITA_CHAPTERS: GitaChapterInfo[] = [
  {
    number: 1,
    title: 'অর্জুনবিষাদযোগ',
    description: 'কুরুক্ষেত্রে উভয় সেনার অবলোকন ও অর্জুনের বিষাদ।',
    durationEstimate: '১৫ মিনিট',
  },
  {
    number: 2,
    title: 'সাংখ্যযোগ (গীতার সার)',
    description: 'আত্মার অমরত্ব, কর্মযোগ ও স্থিতপ্রজ্ঞ লক্ষণ।',
    durationEstimate: '২০ মিনিট',
  },
  {
    number: 3,
    title: 'কর্মযোগ',
    description: 'ফলআকাঙ্ক্ষা ত্যাগ করে নিষ্কাম কর্ম করার মহান শিক্ষা।',
    durationEstimate: '১৩ মিনিট',
  },
  {
    number: 4,
    title: 'জ্ঞানকর্মসং্যাসযোগ',
    description: 'জ্ঞানযোগ ও নিষ্কাম কর্মের সমন্বয় এবং ঈশ্বরের অবতারবাদ।',
    durationEstimate: '১৪ মিনিট',
  },
  {
    number: 5,
    title: 'কর্মসং্যাসযোগ',
    description: 'কর্মসং্যাস ও কর্মযোগের সাম্য এবং পরম শান্তির পথ।',
    durationEstimate: '১০ মিনিট',
  },
  {
    number: 6,
    title: 'ধ্যানযোগ (আত্মসংযমযোগ)',
    description: 'মনোনিগ্রহ, ধ্যান ও যোগসাধনার প্রণালী।',
    durationEstimate: '১৫ মিনিট',
  },
  {
    number: 7,
    title: 'বিজ্ঞানযোগ',
    description: 'পরমেশ্বর ভগবান শ্রীকৃষ্ণের অপার প্রকৃতি ও বিভূতি তত্ত্ব।',
    durationEstimate: '11 মিনিট',
  },
  {
    number: 8,
    title: 'অক্ষরব্রহ্মযোগ',
    description: 'ব্রহ্ম, অধ্যাত্ম, কর্ম এবং অন্তিমকালে ঈশ্বরের স্মরণের মাহাত্ম্য।',
    durationEstimate: '১০ মিনিট',
  },
  {
    number: 9,
    title: 'রাজবিদ্যারাজগুহ্যযোগ',
    description: 'সর্বোত্তম গুহ্য জ্ঞান ও পরম ভক্তিমার্গের মহিমা।',
    durationEstimate: '১২ মিনিট',
  },
  {
    number: 10,
    title: 'বিভূতিযোগ',
    description: 'ভগবানের দিব্য বিভূতি ও বিশ্বব্যাপী ঐশ্বরিক প্রকাশ।',
    durationEstimate: '১৫ মিনিট',
  },
  {
    number: 11,
    title: 'বিশ্বরূপদর্শনযোগ',
    description: 'অর্জুনের প্রতি শ্রীকৃষ্ণের দিব্য বিরাট বিশ্বরূপ প্রকাশ।',
    durationEstimate: '১৯ মিনিট',
  },
  {
    number: 12,
    title: 'ভক্তিযোগ',
    description: 'সাকার ও নিরাকার উপাসনা এবং ভক্তের পরম গুণাবলী।',
    durationEstimate: '৭ মিনিট',
  },
  {
    number: 13,
    title: 'ক্ষেত্রক্ষেত্রজ্ঞবিভাগযোগ',
    description: 'শরীর (ক্ষেত্র) ও আত্মা (ক্ষেত্রজ্ঞ)-র নিগূঢ় তত্ত্ব।',
    durationEstimate: '১২ মিনিট',
  },
  {
    number: 14,
    title: 'গুণত্রয়বিভাগযোগ',
    description: 'সত্ত্ব, রজঃ ও তমঃ — প্রকৃতির এই তিন গুণের প্রভাব।',
    durationEstimate: '৯ মিনিট',
  },
  {
    number: 15,
    title: 'পুরুষোত্তমযোগ',
    description: 'সংসার বৃক্ষের রূপক এবং পরম পুরুষ শ্রীকৃষ্ণের স্বরূপ।',
    durationEstimate: '৭ মিনিট',
  },
  {
    number: 16,
    title: 'দৈভাসুরসম্পদ্বিভাগযোগ',
    description: 'দৈবী ও আসুরী প্রকৃতির মানুষের স্বভাব ও কর্মের পার্থক্য।',
    durationEstimate: '৮ মিনিট',
  },
  {
    number: 17,
    title: 'শ্রদ্ধাত্রয়বিভাগযোগ',
    description: 'ত্রিবিধ শ্রদ্ধা, যজ্ঞ, তপস্যা ও দানের বিস্তারিত রূপ।',
    durationEstimate: '১০ মিনিট',
  },
  {
    number: 18,
    title: 'মোক্ষসং্যাসযোগ (উপসংহার)',
    description: 'সর্বধর্ম পরিত্যাগ করে একমাত্র শরণাগতির পরম বার্তা।',
    durationEstimate: '২৫ মিনিট',
  },
];

export const GITA_YOUTUBE_ID = '28sptQICKCk';
export const GITA_YOUTUBE_URL = 'https://youtu.be/28sptQICKCk?si=wxdQPto4o0fqP6lS';

interface MediaPlayerContextType {
  isPlaying: boolean;
  isMuted: boolean;
  isPlayerActive: boolean;
  isMinimized: boolean;
  activeChapter: number;
  currentYoutubeId: string;
  currentTitle: string;
  currentSubtitle: string;
  startGitaBackgroundPlay: (chapterNum?: number) => void;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleMinimize: () => void;
  stopMedia: () => void;
  setActiveChapter: (chapterNum: number) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const MediaPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlayerActive, setIsPlayerActive] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeChapter, setActiveChapterState] = useState<number>(1);
  const [currentYoutubeId] = useState<string>(GITA_YOUTUBE_ID);
  const [currentTitle] = useState<string>('শ্রীমদ্ভগবদ্গীতা — সম্পূর্ণ অমৃতবাণী');
  const [currentSubtitle] = useState<string>('পবিত্র গীতা পাঠ ও জীবন দর্শন');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const sendIframeCommand = (func: string, args: string = '') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (err) {
        console.warn('Could not postMessage to YouTube iframe:', err);
      }
    }
  };

  const startGitaBackgroundPlay = (chapterNum: number = 1) => {
    broadcastMediaPlaybackStarted('global-gita-player', 'gita');
    setActiveChapterState(chapterNum);
    setIsPlayerActive(true);
    setIsPlaying(true);
    setIsMinimized(false);

    const chapterInfo = GITA_CHAPTERS[chapterNum - 1] || GITA_CHAPTERS[0];
    updateLockScreenMediaMetadata({
      title: `অধ্যায় ${chapterNum}: ${chapterInfo.title}`,
      artist: '11 স্টার ক্লাব',
      album: 'পবিত্র শ্রীমদ্ভগবদ্গীতা সম্পূর্ণ অমৃতবাণী',
      artworkUrl: '/icon.png',
      onPlay: () => {
        sendIframeCommand('playVideo');
        setIsPlaying(true);
      },
      onPause: () => {
        sendIframeCommand('pauseVideo');
        setIsPlaying(false);
      }
    });

    setTimeout(() => {
      sendIframeCommand('playVideo');
      if (isMuted) {
        sendIframeCommand('mute');
      } else {
        sendIframeCommand('unMute');
      }
    }, 300);
  };

  const togglePlay = () => {
    if (!isPlayerActive) {
      startGitaBackgroundPlay(activeChapter);
      return;
    }
    if (isPlaying) {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
      pauseLockScreenMediaSession();
    } else {
      broadcastMediaPlaybackStarted('global-gita-player', 'gita');
      sendIframeCommand('playVideo');
      setIsPlaying(true);
      const chapterInfo = GITA_CHAPTERS[activeChapter - 1] || GITA_CHAPTERS[0];
      updateLockScreenMediaMetadata({
        title: `অধ্যায় ${activeChapter}: ${chapterInfo.title}`,
        artist: '11 স্টার ক্লাব',
        album: 'পবিত্র শ্রীমদ্ভগবদ্গীতা সম্পূর্ণ অমৃতবাণী',
        artworkUrl: '/icon.png',
        onPlay: () => {
          sendIframeCommand('playVideo');
          setIsPlaying(true);
        },
        onPause: () => {
          sendIframeCommand('pauseVideo');
          setIsPlaying(false);
        }
      });
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      sendIframeCommand('mute');
    } else {
      sendIframeCommand('unMute');
    }
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const stopMedia = () => {
    sendIframeCommand('pauseVideo');
    setIsPlaying(false);
    setIsPlayerActive(false);
    clearLockScreenMediaMetadata();
  };

  const setActiveChapter = (chapterNum: number) => {
    setActiveChapterState(chapterNum);
  };

  // Subscribe to automatic pause when any other media in the app begins playing
  useEffect(() => {
    const unsubscribe = subscribeToMediaStop('global-gita-player', () => {
      sendIframeCommand('pauseVideo');
      setIsPlaying(false);
      pauseLockScreenMediaSession();
    });
    return () => unsubscribe();
  }, []);

  // Listen to state changes from YouTube iframe
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data?.event === 'onStateChange') {
            // 1 = playing, 2 = paused, 0 = ended
            if (data.info === 1) {
              setIsPlaying(true);
              setIsPlayerActive(true);
            } else if (data.info === 2 || data.info === 0) {
              setIsPlaying(false);
            }
          }
        }
      } catch {
        // Not a JSON message, ignore
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  return (
    <MediaPlayerContext.Provider
      value={{
        isPlaying,
        isMuted,
        isPlayerActive,
        isMinimized,
        activeChapter,
        currentYoutubeId,
        currentTitle,
        currentSubtitle,
        startGitaBackgroundPlay,
        togglePlay,
        toggleMute,
        toggleMinimize,
        stopMedia,
        setActiveChapter,
        iframeRef,
      }}
    >
      {children}
    </MediaPlayerContext.Provider>
  );
};

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (!context) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};
