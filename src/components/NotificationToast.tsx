import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ChevronRight } from 'lucide-react';
import { AppNotification } from '../utils/notificationHelper';
import { PageId } from '../types';

interface NotificationToastProps {
  onNavigate?: (page: PageId) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      if (customEvent.detail) {
        setActiveToast(customEvent.detail);
        // Auto hide after 7 seconds
        setTimeout(() => {
          setActiveToast((prev) => (prev?.id === customEvent.detail.id ? null : prev));
        }, 7000);
      }
    };

    window.addEventListener('11starclub-notification-received', handleNotification);
    return () => {
      window.removeEventListener('11starclub-notification-received', handleNotification);
    };
  }, []);

  if (!activeToast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="p-4 rounded-2xl bg-[#180e08]/95 backdrop-blur-md border border-amber-500/50 shadow-[0_10px_35px_rgba(245,158,11,0.3)] text-stone-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Bell className="w-5 h-5 text-amber-300 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                11 স্টার ক্লাব বিজ্ঞপ্তি
              </span>
              <span className="text-[10px] text-stone-400">
                {activeToast.timestamp}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white leading-snug truncate">
              {activeToast.title}
            </h4>
            <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
              {activeToast.message}
            </p>

            {activeToast.linkPage && onNavigate && (
              <button
                onClick={() => {
                  onNavigate(activeToast.linkPage as PageId);
                  setActiveToast(null);
                }}
                className="pt-1.5 text-xs text-amber-300 font-bold hover:text-amber-200 flex items-center gap-1 group"
              >
                <span>বিস্তারিত দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
