import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Database,
  Upload,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ClubDataStorageSection } from './ClubDataStorageSection';

const ADMIN_PASSWORD = "Ayan@2024";

interface AdminClubStorageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminClubStorageModal: React.FC<AdminClubStorageModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIsAuthenticated(false);
      setIsPublicMode(false);
      setPasswordInput('');
      setShowPassword(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setIsPublicMode(false);
      setErrorMsg('');
      setPasswordInput('');
    } else {
      setErrorMsg('ভুল পাসওয়ার্ড! সঠিক অ্যাডমিন পাসওয়ার্ড দিন।');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-3xl bg-gradient-to-b from-stone-950 via-zinc-950 to-black border-2 border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden my-6 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>অ্যাডমিন লকড স্টোরেজ সিকিউরিটি</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif-bengali text-gold-gradient">
                11 স্টার ক্লাব • গোপন ডাটা স্টোরেজ ও ফাইল ম্যানেজার
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {!isAuthenticated && !isPublicMode ? (
            <div className="max-w-md mx-auto py-12 px-6 rounded-2xl bg-black/60 border border-amber-500/30 text-center space-y-6 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Lock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold font-serif-bengali text-white">
                  অ্যাডমিন পাসওয়ার্ড প্রদান করুন
                </h4>
                <p className="text-xs text-stone-400">
                  ক্লাব ডাটা স্টোরেজে ফাইল আপলোড বা ডিলিট করার জন্য অ্যাডমিন পাসওয়ার্ড প্রয়োজন। সাধারণ দর্শকরা ফাইল দেখতে ও শুনতে পারবেন।
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-black/80 border border-amber-500/40 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-stone-500 outline-none focus:border-amber-400 shadow-inner"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>অ্যাডমিন স্টোরেজ আনলক করুন</span>
                </button>
              </form>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => setIsPublicMode(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>👥 সাধারণ দর্শক হিসেবে ফাইলগুলো দেখুন (Public View)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>অ্যাডমিন অথেন্টিকেশন সফল! আপনি ফাইল আপলোড ও ডিলিট করতে পারবেন।</span>
                  </div>
                  <button
                    onClick={() => { setIsAuthenticated(false); setIsPublicMode(true); }}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition"
                  >
                    পাবলিক মোডে ফিরুন
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>পাবলিক ভিউ মোড: আপনি সমস্ত ফাইল দেখতে ও শুনতে পারবেন (আপলোড/ডিলিট বন্ধ)।</span>
                  </div>
                  <button
                    onClick={() => setIsPublicMode(false)}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold text-[11px] transition hover:bg-amber-400"
                  >
                    অ্যাডমিন লগিন করুন
                  </button>
                </div>
              )}

              {/* Render Club Data Storage Section */}
              <ClubDataStorageSection isAdmin={isAuthenticated} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
