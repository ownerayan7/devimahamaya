import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSuccess
}) => {
  const { isAdminLoginModalOpen, closeAdminLoginModal, loginAdmin } = useAdminAuth();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isAdminLoginModalOpen;
  const handleClose = propOnClose || closeAdminLoginModal;

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginAdmin(password);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
        handleClose();
      }, 700);
    } else {
      setError('ভুল পাসওয়ার্ড! ক্লাবের সঠিক অ্যাডমিন পাসওয়ার্ড দিন।');
    }
  };

  return (
    <div
      id="global-admin-login-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-gradient-to-b from-stone-900 via-zinc-900 to-black border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                ক্লাব অ্যাডমিন প্রমাণীকরণ
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white">
                অ্যাডমিন প্যানেল লগইন
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            লগইন করার পর আপনি অফিসিয়াল ফটো/ভিডিও পরিচালনা করতে পারবেন এবং প্রয়োজনবোধে যেকোনো পোস্ট মডারেট ও মুছে ফেলতে পারবেন।
          </p>

          {isSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-bengali">
                অ্যাডমিন লগইন সফল!
              </h4>
              <p className="text-xs text-emerald-300">
                অ্যাডমিন ক্ষমতা সক্রিয় করা হয়েছে।
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  অ্যাডমিন পাসওয়ার্ড:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password || ""}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="পাসওয়ার্ড লিখুন..."
                    autoFocus
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/60 border border-amber-500/30 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
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
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!password.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>লগইন করুন</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
