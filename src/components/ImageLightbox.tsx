import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 select-none"
        >
          {/* Top Controls Bar */}
          <div
            className="absolute top-4 right-4 z-50 flex items-center gap-2 sm:gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={imageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="ডাউনলোড / সম্পূর্ণ ভিউ"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 border border-amber-500/40 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Prev Button */}
          {hasPrev && onPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-amber-500/30 text-white hover:text-amber-300 border border-white/20 hover:border-amber-500/50 transition-all shadow-xl backdrop-blur-md"
              title="পূর্ববর্তী ছবি"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Navigation Next Button */}
          {hasNext && onNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-amber-500/30 text-white hover:text-amber-300 border border-white/20 hover:border-amber-500/50 transition-all shadow-xl backdrop-blur-md"
              title="পরবর্তী ছবি"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Modal Content Container */}
          <motion.div
            key={imageUrl}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl glass-card border border-amber-500/40 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.3)]"
          >
            <div className="relative w-full max-h-[72vh] flex items-center justify-center overflow-auto rounded-xl bg-black/70">
              <img
                src={imageUrl}
                alt={title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Bottom Title Info */}
            <div className="w-full px-4 pt-3 pb-1 text-center">
              <h4 className="text-base sm:text-lg font-bold font-serif-bengali text-gold-gradient">
                {title}
              </h4>
              {subtitle && (
                <p className="text-xs sm:text-sm text-stone-300/80 mt-0.5 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
