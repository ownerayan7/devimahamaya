import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Moon,
  HeartHandshake,
  Video,
  Phone,
  Flame,
  ChevronDown,
  Info,
  ExternalLink,
  ShieldCheck,
  Download,
  LogOut,
  KeyRound,
  BookOpen,
  Bell,
  BellRing,
  Music,
  Radio,
  Settings
} from 'lucide-react';
import { PageId } from '../types';
import { CLUB_INFO } from '../data/clubData';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useMediaPlayer } from '../context/MediaPlayerContext';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onOpenAdminInbox?: () => void;
  onOpenInstallModal?: () => void;
  onOpenNotificationModal?: () => void;
  onReplayWelcome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  reducedMotion,
  onToggleReducedMotion,
  onOpenAdminInbox,
  onOpenInstallModal,
  onOpenNotificationModal,
  onReplayWelcome,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const { isAdminLoggedIn, openAdminLoginModal, logoutAdmin } = useAdminAuth();
  const { isPlayerActive, isPlaying } = useMediaPlayer();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: PageId) => {
    if (page === 'settings') {
      if (onOpenNotificationModal) {
        onOpenNotificationModal();
      }
      setMobileMenuOpen(false);
      setServiceDropdownOpen(false);
      return;
    }
    onNavigate(page);
    setMobileMenuOpen(false);
    setServiceDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: Array<{
    id: PageId;
    label: string;
    icon?: React.ReactNode;
    isNew?: boolean;
    isHighlight?: boolean;
  }> = [
    { id: 'home', label: 'Home' },
    { id: 'durga-puja', label: 'দুর্গাপূজা ২০২৬', isHighlight: true },
    { id: 'prayer', label: 'প্রার্থনা', isNew: true, icon: <Flame className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'rabindra-sangeet', label: 'রবীন্দ্র সঙ্গীত', isNew: true, icon: <Music className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'mahalaya', label: 'মহালয়া', icon: <Moon className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'radio', label: 'রেডিও', isNew: true, icon: <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> },
    { id: 'gita', label: 'গীতা পাঠ', icon: <BookOpen className="w-3.5 h-3.5 text-yellow-300" /> },
    { id: 'social-services', label: 'সামাজিক সেবা' },
    { id: 'videos', label: 'ভিডিও', icon: <Video className="w-3.5 h-3.5 text-red-400" /> },
    { id: 'shopping', label: 'Online Shopping', isNew: true, icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'donate', label: 'সহযোগিতা', icon: <HeartHandshake className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-3.5 h-3.5 text-stone-300" /> },
    { id: 'settings', label: 'সেটিংস', icon: <Settings className="w-3.5 h-3.5 text-amber-300" /> },
  ];

  const subServices: Array<{ id: PageId; label: string; tag: string }> = [
    { id: 'prayer', label: 'প্রার্থনা', tag: 'আগুনের পরশমণি' },
    { id: 'rabindra-sangeet', label: 'রবীন্দ্র সঙ্গীত', tag: 'গান ও ভিডিও' },
    { id: 'medical', label: 'চিকিৎসা সাহায্য', tag: 'জরুরি ফর্ম' },
    { id: 'needy', label: 'দরিদ্র সেবা', tag: 'খাদ্য ও বস্ত্র' },
    { id: 'scholarship', label: 'স্কলারশিপ আবেদন', tag: 'মেধাবৃত্তি' },
    { id: 'tree-plantation', label: 'বৃক্ষরোপণ কর্মসূচি', tag: 'সবুজায়ন' },
    { id: 'gallery', label: 'গ্যালারি', tag: 'ফটো' },
    { id: 'about', label: 'আমাদের কথা', tag: 'ইতিহাস' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0e0a12]/98 backdrop-blur-md py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.9)] border-b border-amber-500/30'
          : 'bg-[#0e0a12]/95 backdrop-blur-md py-3 sm:py-3.5 border-b border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95"
            id="nav-brand-btn"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-red-600/20 p-0.5 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center overflow-hidden group-hover:border-amber-400 transition-colors">
              <img
                src={CLUB_INFO.images.logo}
                alt={CLUB_INFO.nameEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg drop-shadow"
                onError={(e) => {
                  const current = e.currentTarget.src;
                  if (!current.includes('thumbnail') && CLUB_INFO.images.logoThumbnail) {
                    e.currentTarget.src = CLUB_INFO.images.logoThumbnail;
                  } else if (!current.includes('logo_maa_aschen.jpg')) {
                    e.currentTarget.src = CLUB_INFO.images.logoFallback;
                  }
                }}
              />
              <div className="absolute inset-0 bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold font-serif-bengali text-gold-gradient tracking-tight">
                  {CLUB_INFO.nameBn}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-cinzel-title uppercase tracking-wider hidden sm:inline-block">
                  ESTD.
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 font-medium tracking-wide line-clamp-1">
                {CLUB_INFO.tagline}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-amber-200 bg-amber-500/15 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'text-stone-300 hover:text-amber-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === 'gita' && isPlayerActive && isPlaying && (
                    <span className="flex items-end gap-0.5 h-3 px-1" title="ব্যাকগ্রাউন্ডে অডিও চলছে">
                      <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-2" />
                      <span className="w-0.5 bg-yellow-300 rounded-full animate-[bounce_1s_ease-in-out_infinite] h-3" />
                      <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-2.5" />
                    </span>
                  )}
                  {item.isNew && !(item.id === 'gita' && isPlayerActive && isPlaying) && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-black uppercase tracking-wider">
                      NEW
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b]"
                    />
                  )}
                </button>
              );
            })}

            {/* More / Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  ['medical', 'needy', 'scholarship', 'tree-plantation', 'gallery', 'about'].includes(currentPage)
                    ? 'text-amber-200 bg-amber-500/15 border border-amber-500/30'
                    : 'text-stone-300 hover:text-amber-100 hover:bg-white/5'
                }`}
                id="nav-dropdown-btn"
              >
                <span>আরও সেবা</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {serviceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl glass-card p-2 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border border-amber-500/30 z-50"
                  >
                    <div className="text-[11px] font-semibold text-amber-400/80 px-3 py-1 uppercase tracking-wider border-b border-white/10 mb-1">
                      বিশেষ সেবা ও পেজ
                    </div>
                    {subServices.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleNavClick(sub.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          currentPage === sub.id
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                            : 'text-stone-300 hover:bg-white/5 hover:text-amber-100'
                        }`}
                      >
                        <span>{sub.label}</span>
                        <span className="text-[10px] text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {sub.tag}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Action Icons & Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Install App Quick Trigger */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-300/60 text-xs font-bold text-white transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
                title="অ্যাপ হিসেবে মোবাইলে বা কম্পিউটারে ইনস্টল করুন"
                id="nav-install-app-btn"
              >
                <Download className="w-3.5 h-3.5 text-amber-200" />
                <span className="font-serif-bengali">অ্যাপ ডাউনলোড</span>
              </button>
            )}

            {/* Admin Inbox Shortcut Button */}
            {onOpenAdminInbox && (
              <button
                onClick={onOpenAdminInbox}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-xs font-bold text-amber-200 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-300 active:scale-95"
                title="গোপন অ্যাডমিন ইনবক্স"
                id="nav-admin-inbox-btn"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>🔒 ইনবক্স</span>
              </button>
            )}

            {/* Replay Welcome Animation Button */}
            {onReplayWelcome && (
              <button
                onClick={onReplayWelcome}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 border border-amber-400/50 text-xs font-bold text-amber-200 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-95"
                title="পূজা আগমনী অ্যানিমেশন দেখুন"
                id="nav-replay-welcome-btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                <span className="font-serif-bengali">অ্যানিমেশন</span>
              </button>
            )}

            {/* Direct Google Maps Link Shortcut */}
            <a
              href={CLUB_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-200 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:border-amber-400"
              title="মণ্ডপের ম্যাপ লোকেশন"
            >
              <span>📍 লোকেশন</span>
              <ExternalLink className="w-3 h-3 text-amber-400" />
            </a>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-amber-500/30 text-amber-200 transition-colors"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden glass-nav border-t border-amber-500/20 px-4 pt-3 pb-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="grid grid-cols-1 gap-1.5">
              <div className="text-[11px] font-semibold text-amber-400/80 px-2 py-1 uppercase tracking-wider">
                প্রধান মেনু
              </div>

              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/25 to-red-500/20 text-amber-200 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'text-stone-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon || <Sparkles className="w-4 h-4 text-amber-400" />}
                      <span>{item.label}</span>
                      {item.id === 'gita' && isPlayerActive && isPlaying && (
                        <span className="flex items-end gap-0.5 h-3 px-1">
                          <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-2" />
                          <span className="w-0.5 bg-yellow-300 rounded-full animate-[bounce_1s_ease-in-out_infinite] h-3" />
                          <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-2.5" />
                        </span>
                      )}
                    </div>
                    {item.isNew && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-black uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                    {item.id === 'settings' && (
                      <span className="text-[10px] font-medium text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Bell className="w-3 h-3 text-amber-300" />
                        <span>নোটিফিকেশন</span>
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="text-[11px] font-semibold text-amber-400/80 px-2 pt-3 pb-1 uppercase tracking-wider border-t border-white/10 mt-2">
                আবেদন ও সেবা পোর্টাল
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {subServices.map((sub) => {
                  const isActive = currentPage === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleNavClick(sub.id)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                          : 'bg-white/5 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold text-amber-100">{sub.label}</div>
                      <div className="text-[10px] text-amber-400/70">{sub.tag}</div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                {onOpenInstallModal && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenInstallModal();
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 border border-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                    id="mobile-install-app-btn"
                  >
                    <Download className="w-4 h-4 text-stone-950" />
                    <span>অ্যাপ হিসেবে ফোনে ইনস্টল করুন (Install App)</span>
                  </button>
                )}

                {onOpenAdminInbox && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminInbox();
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 border border-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                    id="mobile-admin-inbox-btn"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>🔒 ক্লাব অ্যাডমিন ইনবক্স</span>
                  </button>
                )}

                {onReplayWelcome && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onReplayWelcome();
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-red-950/70 border border-amber-400/50 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-red-900/80 active:scale-95"
                    id="mobile-replay-welcome-btn"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                    <span>✨ পূজা আগমনী অ্যানিমেশন আবার দেখুন</span>
                  </button>
                )}

                <a
                  href={CLUB_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <span>📍 মণ্ডপের লোকেশন (Google Maps)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center justify-between px-2 pt-1 text-xs text-stone-400">
                  <span>অ্যানিমেশন নিয়ন্ত্রণ</span>
                  <button
                    onClick={onToggleReducedMotion}
                    className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-amber-300 text-xs"
                  >
                    {reducedMotion ? 'সাধারণ মোড' : 'কম অ্যানিমেশন'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
