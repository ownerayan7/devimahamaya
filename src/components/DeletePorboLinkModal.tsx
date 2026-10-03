import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, Lock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PorboLinkItem } from '../types';
import { emitSocketDelete, emitSocketPorboLink } from '../utils/socketClient';

const ADMIN_PASSWORD = "Ayan@2024";

interface DeletePorboLinkModalProps {
  isOpen: boolean;
  linkToDelete: PorboLinkItem | null;
  onClose: () => void;
  onConfirmDelete: (linkId: string) => Promise<void>;
}

export const DeletePorboLinkModal: React.FC<DeletePorboLinkModalProps> = ({
  isOpen,
  linkToDelete,
  onClose,
  onConfirmDelete,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setError('');
      setIsDeleting(false);
    }
  }, [isOpen, linkToDelete]);

  if (!isOpen || !linkToDelete) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordInput.trim() !== ADMIN_PASSWORD) {
      setError('ভুল অ্যাডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirmDelete(linkToDelete.id);
      emitSocketDelete({ id: linkToDelete.id, type: 'porbo_link' });
      emitSocketPorboLink({ action: 'delete', id: linkToDelete.id });
      setIsDeleting(false);
      onClose();
    } catch (err: any) {
      setError('লিঙ্কটি মোছার সময় সমস্যা হয়েছে: ' + (err?.message || 'Error'));
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-stone-950 border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-stone-900 to-red-950 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-200 font-serif-bengali">
                পর্বের লিঙ্ক মুছে ফেলুন
              </h3>
              <p className="text-[11px] text-stone-400">অ্যাডমিন পাসওয়ার্ড দিয়ে নিশ্চিত করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-stone-200 text-xs space-y-1">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
              যে লিঙ্কটি মোছা হবে:
            </span>
            <p className="font-bold text-white text-sm line-clamp-2">{linkToDelete.title}</p>
            <span className="text-[11px] text-stone-400 truncate block">{linkToDelete.url}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>অ্যাডমিন পাসওয়ার্ড দিন (Ayan@2024) *</span>
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন..."
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-red-500/40 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 text-xs font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'মুছে ফেলা হচ্ছে...' : 'স্থায়ীভাবে মুছুন'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
