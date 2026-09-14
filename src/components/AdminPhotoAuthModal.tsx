import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  X,
  ArrowRight,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export interface AdminPhotoAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  onGoToMemberSection?: () => void;
  actionTitle?: string;
  description?: string;
  submitButtonText?: string;
  isDangerousAction?: boolean;
}

const ADMIN_PASSWORD = "Ayan@2024";

export const AdminPhotoAuthModal: React.FC<AdminPhotoAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  onGoToMemberSection,
  actionTitle = "অফিসিয়াল কন্টেন্ট অ্যাডমিন প্যানেল",
  description,
  submitButtonText,
  isDangerousAction = false
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin } = useAdminAuth();

  // Reset states whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const trimmed = password.trim();
    if (trimmed === ADMIN_PASSWORD) {
      loginAdmin(trimmed);
      setIsSubmitting(false);
      setPassword('');
      onAuthenticated();
      onClose();
    } else {
      setIsSubmitting(false);
      setError('ভুল পাসওয়ার্ড! ক্লাবের সঠিক অ্যাডমিন পাসওয়ার্ড দিন।');
    }
  };

  return (
    <div
      id="admin-photo-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border ${
          isDangerousAction
            ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)]'
            : 'border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)]'
        } overflow-hidden`}
      >
        {/* Header Bar */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner ${
                isDangerousAction
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}
            >
              {isDangerousAction ? (
                <Trash2 className="w-6 h-6 animate-pulse" />
              ) : (
                <Lock className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isDangerousAction
                    ? 'bg-red-500/20 border-red-500/30 text-red-300'
                    : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                }`}
              >
                <ShieldAlert
                  className={`w-3 h-3 ${isDangerousAction ? 'text-red-400' : 'text-amber-400'}`}
                />
                {isDangerousAction ? 'অ্যাডমিন ডিলিট সুরক্ষা' : 'অ্যাডমিন সিকিউরিটি যাচাই'}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white">
                {actionTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              isDangerousAction
                ? 'bg-red-500/10 border-red-500/30 text-red-200/90'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-200/90'
            }`}
          >
            <p
              className={`font-semibold mb-1 flex items-center gap-1.5 ${
                isDangerousAction ? 'text-red-300' : 'text-amber-300'
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 shrink-0 ${
                  isDangerousAction ? 'text-red-400' : 'text-amber-400'
                }`}
              />
              {isDangerousAction
                ? 'শুধুমাত্র অ্যাডমিনরাই ডিলিট করতে পারবেন:'
                : 'প্রতিবার আপলোডের জন্য অ্যাডমিন সুরক্ষা:'}
            </p>
            {description ||
              (isDangerousAction
                ? 'ক্লাব অ্যাডমিনদের আপলোড করা অফিসিয়াল ফটো বা ভিডিও সাধারণ সদস্যরা মুছে ফেলতে পারবেন না। নিশ্চিত করতে অ্যাডমিন পাসওয়ার্ড দিন।'
                : 'অননুমোদিত আপলোড প্রতিরোধে ক্লাবের অফিসিয়াল প্যানেলে প্রতিবার প্রবেশের জন্য অ্যাডমিন পাসওয়ার্ড প্রদান বাধ্যতামূলক।')}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                ক্লাব অ্যাডমিন পাসওয়ার্ড দিন:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound
                    className={`w-4 h-4 ${isDangerousAction ? 'text-red-400' : 'text-amber-400'}`}
                  />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password || ""}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                  autoFocus
                  required
                  className={`w-full pl-10 pr-10 py-3 rounded-xl bg-black/60 border text-white placeholder-stone-500 text-sm focus:outline-none transition-all ${
                    isDangerousAction
                      ? 'border-red-500/30 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                      : 'border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-amber-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isDangerousAction
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              }`}
            >
              {isDangerousAction ? (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{submitButtonText || 'পাসওয়ার্ড যাচাই করে মুছে ফেলুন'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{submitButtonText || 'পাসওয়ার্ড যাচাই করে আনলক করুন'}</span>
                </>
              )}
            </button>
          </form>

          {/* Member section prompt (only for non-delete action and when callback provided) */}
          {!isDangerousAction && onGoToMemberSection && (
            <div className="pt-2 border-t border-white/10">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>আপনি কি ক্লাবের সাধারণ সদস্য বা শুভানুধ্যায়ী?</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  আপনার তোলা পূজা ও ক্লাবের স্মৃতি শেয়ার করতে <strong>কোনো পাসওয়ার্ডের প্রয়োজন নেই</strong>! সদস্যদের নিজস্ব উন্মুক্ত সেকশনে সরাসরি নিজের ভিডিও বা ছবি আপলোড করুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoToMemberSection();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors pt-1"
                >
                  <span>সদস্যদের উন্মুক্ত সেকশনে যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
