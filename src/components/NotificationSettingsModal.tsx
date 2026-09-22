import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  BellRing,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  Lock,
  Eye,
  EyeOff,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ExternalLink,
  KeyRound,
  Volume2,
  FileText
} from 'lucide-react';
import {
  getStoredNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendAppNotification,
  playNotificationChime,
  dispatchNativePushNotification,
  NotificationSettings,
  LEAD_TIME_OPTIONS
} from '../utils/notificationHelper';
import { useAdminAuth } from '../context/AdminAuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: any) => void;
  reducedMotion?: boolean;
  onToggleReducedMotion?: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  reducedMotion,
  onToggleReducedMotion
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(getStoredNotificationSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [testSent, setTestSent] = useState(false);
  const [customLeadInput, setCustomLeadInput] = useState<string>('');
  const [isCustomLeadActive, setIsCustomLeadActive] = useState(false);

  // Admin Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState<string>('🕊️ সান্ধ্য প্রার্থনা ও সঙ্গীত সভা');
  const [broadcastDate, setBroadcastDate] = useState<string>('');
  const [broadcastTime, setBroadcastTime] = useState<string>('19:00');
  const [broadcastTargetLink, setBroadcastTargetLink] = useState<string>('sunday-prayer');
  const [broadcastMessage, setBroadcastMessage] = useState<string>(
    'আজকের সান্ধ্য প্রার্থনা ও "আগুনের পরশমণি" সঙ্গীত শুরু হতে যাচ্ছে। আপনারা সকলে অংশ নিন।'
  );

  // Inline Password Verification State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [isAlertSent, setIsAlertSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { verifyPassword } = useAdminAuth();

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredNotificationSettings();
      setSettings(stored);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      setIsAlertSent(false);
      setTestSent(false);
      setIsAdminUnlocked(false);
      setAdminPasswordInput('');
      setAuthError('');
      setShowPassword(false);

      // Check if stored lead time is custom
      const isPreset = LEAD_TIME_OPTIONS.some((o) => o.value === stored.leadTimeMinutes);
      if (!isPreset && stored.leadTimeMinutes) {
        setIsCustomLeadActive(true);
        setCustomLeadInput(String(stored.leadTimeMinutes));
      } else {
        setIsCustomLeadActive(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEnable = async () => {
    if (!settings.enabled) {
      // Turn ON
      const updated = { ...settings, enabled: true };
      setSettings(updated);
      saveNotificationSettings(updated);

      const res = await requestNotificationPermission();
      setPermissionStatus(res);
      try {
        playNotificationChime();
      } catch (e) {}
    } else {
      // Turn OFF
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
    }
  };

  const handleSelectLeadTime = (minutes: number) => {
    setIsCustomLeadActive(false);
    const updated = { ...settings, leadTimeMinutes: minutes };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleApplyCustomLeadTime = () => {
    const mins = parseInt(customLeadInput, 10);
    if (isNaN(mins) || mins <= 0) {
      alert('দয়া করে সঠিক মিনিট লিখুন।');
      return;
    }
    setIsCustomLeadActive(true);
    const updated = { ...settings, leadTimeMinutes: mins };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSendTestNotification = async () => {
    setTestSent(true);
    playNotificationChime();
    const timeLabel = settings.leadTimeMinutes >= 60 ? `${settings.leadTimeMinutes / 60} ঘন্টা` : `${settings.leadTimeMinutes} মিনিট`;
    await dispatchNativePushNotification(
      '🔔 লক স্ক্রিন টেস্ট নোটিফিকেশন',
      `আপনার ফোনে নোটিফিকেশন সক্রিয় রয়েছে! প্রার্থনার ${timeLabel} পূর্বে আপনি নোটিফিকেশন পাবেন।`,
      settings.soundEnabled,
      'sunday-prayer'
    );
    setTimeout(() => setTestSent(false), 3500);
  };

  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleVerifyInlinePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!adminPasswordInput.trim()) {
      setAuthError('দয়া করে অ্যাডমিন পাসওয়ার্ড লিখুন।');
      return;
    }

    const isValid = verifyPassword(adminPasswordInput.trim());
    if (isValid) {
      setIsAdminUnlocked(true);
      setAuthError('');
      setAdminPasswordInput('');
    } else {
      setAuthError('ভুল পাসওয়ার্ড! ক্লাবের সঠিক অ্যাডমিন পাসওয়ার্ড দিন।');
    }
  };

  const handleSendBroadcastDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      alert('দয়া করে নোটিফিকেশনের বার্তা লিখুন।');
      return;
    }

    setIsSending(true);
    const formattedTime = broadcastTime ? `সময়: ${broadcastTime}` : '';
    const formattedDate = broadcastDate ? `তারিখ: ${broadcastDate}` : '';
    const datePrefix = [formattedDate, formattedTime].filter(Boolean).join(' | ');

    const fullMessage = datePrefix ? `[${datePrefix}] ${broadcastMessage}` : broadcastMessage;
    const finalTitle = broadcastTitle.trim() || '📢 11 স্টার ক্লাব বিজ্ঞপ্তি';

    // 1. In-app notification
    sendAppNotification(finalTitle, fullMessage, 'prayer', broadcastTargetLink);

    // 2. Lock screen / OS push notification
    await dispatchNativePushNotification(
      finalTitle,
      fullMessage,
      settings.soundEnabled,
      broadcastTargetLink
    );

    // 3. Save to Firestore for real-time live sync across devices
    try {
      await addDoc(collection(db, 'notifications'), {
        title: finalTitle,
        message: fullMessage,
        type: 'broadcast',
        linkPage: broadcastTargetLink,
        createdAt: Date.now(),
        date: broadcastDate,
        time: broadcastTime
      });
    } catch (err) {
      console.warn('Firestore notification broadcast notice:', err);
    }

    setIsSending(false);
    setIsAlertSent(true);
    setTimeout(() => {
      setIsAlertSent(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-stone-900 via-stone-920 to-black border border-amber-500/30 text-white shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif-bengali">
                বিজ্ঞপ্তি ও নোটিফিকেশন সেটিংস
              </h3>
              <p className="text-xs text-stone-400">
                লক স্ক্রিন অ্যালার্ট ও প্রার্থনা নোটিফিকেশন পরিচালনা করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 sm:p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Section 1: User Notification Preferences */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 font-serif-bengali">
                  <BellRing className="w-4 h-4 text-amber-400" />
                  লক স্ক্রিন নোটিফিকেশন চালু রাখুন
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  সুইচ অন রাখলে ক্লাবের যে কোনো নতুন বিজ্ঞপ্তি, আপডেট বা নোটিফিকেশন সরাসরি আপনার মোবাইলে আসবে
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                onClick={handleToggleEnable}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out focus:outline-none ${
                  settings.enabled
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.45)]'
                    : 'bg-stone-800 border-stone-600 shadow-inner'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out mt-0.5 ${
                    settings.enabled
                      ? 'translate-x-7.5 bg-gradient-to-b from-white to-amber-100'
                      : 'translate-x-1 bg-stone-300'
                  }`}
                />
              </button>
            </div>

            {settings.enabled && (
              <div className="pt-3 border-t border-white/5 space-y-4">
                {/* Sound toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    শব্দ সহ নোটিফিকেশন বাজান
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => {
                      const updated = { ...settings, soundEnabled: e.target.checked };
                      setSettings(updated);
                      saveNotificationSettings(updated);
                    }}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {/* Customizable Lead Time Options - Simple & Clean */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>প্রার্থনার পূর্বে স্মরণ করান</span>
                    </label>
                    <span className="text-[11px] text-amber-400/90 font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                      {settings.leadTimeMinutes >= 60 ? `${settings.leadTimeMinutes / 60} ঘন্টা` : `${settings.leadTimeMinutes} মিনিট`} পূর্বে
                    </span>
                  </div>

                  {/* Preset Chips */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {LEAD_TIME_OPTIONS.map((opt) => {
                      const isSelected = !isCustomLeadActive && settings.leadTimeMinutes === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelectLeadTime(opt.value)}
                          className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              : 'bg-stone-900/80 border-white/10 text-stone-300 hover:border-amber-500/30'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom minutes input - clean without placeholder */}
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="text-[11px] text-stone-400 shrink-0">অথবা নিজের ইচ্ছামতো সময় (মিনিট):</span>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={customLeadInput}
                      onChange={(e) => setCustomLeadInput(e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomLeadTime}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      সেট করুন
                    </button>
                  </div>
                </div>

                {/* Test button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    disabled={testSent}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{testSent ? 'টেস্ট নোটিফিকেশন পাঠানো হয়েছে!' : 'লক স্ক্রিনে টেস্ট নোটিফিকেশন পাঠান'}</span>
                  </button>
                </div>
              </div>
            )}

            {isInsideIframe && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">লক স্ক্রিন নোটিফিকেশন ও বন্ধ থাকা অবস্থা (Background/Lock Screen):</span>
                    <p className="mt-1 text-stone-300 text-[11px] leading-relaxed">
                      ওয়েবসাইট বা অ্যাপ বন্ধ থাকলে মোবাইলের লক স্ক্রিনে সরাসরি নোটিফিকেশন পাওয়ার জন্য নিশ্চিত করুন:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-300 mt-1 pl-1">
                      <li>ব্রাউজারে নোটিফিকেশন পারমিশন <strong>Allow (অনুমোদিত)</strong> করা আছে।</li>
                      <li>অ্যাপটি ফুল ব্রাউজারে খোলা আছে অথবা মোবাইলের হোম স্ক্রিনে <strong>PWA (Add to Home Screen)</strong> হিসেবে ইনস্টল করা আছে।</li>
                      <li>ফোনের নোটিফিকেশন সেটিংসে ব্রাউজার ও 11 স্টার ক্লাবের নোটিফিকেশন চালু রাখা হয়েছে।</li>
                    </ul>
                    <a
                      href={typeof window !== 'undefined' ? window.location.href : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ফুল ব্রাউজার ট্যাবে ওপেন করুন</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {permissionStatus === 'denied' && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>আপনার ব্রাউজারে নোটিফিকেশন ব্লক করা আছে। ব্রাউজার সেটিংসে গিয়ে অনুমতি দিন।</span>
              </div>
            )}
          </div>

          {/* Section 2: Admin Broadcast Hub (Password Protected) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/40 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-amber-200 font-serif-bengali">
                  প্রার্থনা ও নোটিফিকেশন পাঠান (অ্যাডমিন)
                </h4>
              </div>

              {isAdminUnlocked ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    আনলকড
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminUnlocked(false);
                      setAdminPasswordInput('');
                      setAuthError('');
                    }}
                    className="text-[10px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
                  >
                    লক করুন
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-amber-400/80 flex items-center gap-1 font-mono">
                  <Lock className="w-3 h-3" />
                  পাসওয়ার্ড সুরক্ষিত
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {!isAdminUnlocked ? (
                /* State 1: Inline Password Verification */
                <motion.div
                  key="password-gate"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-3.5 pt-1"
                >
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      প্রার্থনা, নোটিশ বা যে কোনো আপডেট সকল সদস্যের মোবাইলে পাঠাতে ক্লাবের সঠিক অ্যাডমিন পাসওয়ার্ড দিন।
                    </span>
                  </div>

                  <form onSubmit={handleVerifyInlinePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>ক্লাব অ্যাডমিন পাসওয়ার্ড লিখুন:</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={adminPasswordInput}
                          onChange={(e) => {
                            setAdminPasswordInput(e.target.value);
                            setAuthError('');
                          }}
                          placeholder="অ্যাডমিন পাসওয়ার্ড লিখুন..."
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-stone-900/95 border border-white/15 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {authError && (
                      <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-black" />
                      <span>পাসওয়ার্ড যাচাই করে পেজ খুলুন</span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* State 2: Unlocked - Simple Broadcast Form */
                <motion.form
                  key="notification-form"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onSubmit={handleSendBroadcastDirectly}
                  className="space-y-4 pt-1"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>পাসওয়ার্ড যাচাই সফল হয়েছে! নোটিফিকেশনের তথ্য দিয়ে সম্প্রচার করুন।</span>
                  </div>

                  {/* Broadcast Title */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>বিজ্ঞপ্তির শিরোনাম (Title)</span>
                    </label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="বিজ্ঞপ্তির শিরোনাম লিখুন..."
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>তারিখ (প্রযোজ্য ক্ষেত্রে)</span>
                      </label>
                      <input
                        type="date"
                        value={broadcastDate}
                        onChange={(e) => setBroadcastDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>সময় (প্রযোজ্য ক্ষেত্রে)</span>
                      </label>
                      <input
                        type="time"
                        value={broadcastTime}
                        onChange={(e) => setBroadcastTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Target Page Link */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                      <span>ক্লিক করলে যে পেজটি খুলবে</span>
                    </label>
                    <select
                      value={broadcastTargetLink}
                      onChange={(e) => setBroadcastTargetLink(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="sunday-prayer">🕊️ সান্ধ্য প্রার্থনা পেজ (Sunday Prayer)</option>
                      <option value="notices">📢 নোটিশ ও ঘোষণা পেজ (Notices)</option>
                      <option value="gallery">📸 ফটো গ্যালারি পেজ (Gallery)</option>
                      <option value="videos">🎥 ভিডিও পেজ (Videos)</option>
                      <option value="social-activities">🩸 রক্তদান ও সমাজসেবা পেজ</option>
                      <option value="durga-puja">🪔 শারদীয়া দুর্গাপূজা পেজ</option>
                      <option value="home">🏠 হোম পেজ</option>
                    </select>
                  </div>

                  {/* Message Box */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>বিস্তারিত নোটিফিকেশন বার্তা (Message Box)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="বিস্তারিত বার্তা লিখুন যা ব্যবহারকারীদের মোবাইলে যাবে..."
                      className="w-full p-3 rounded-xl bg-stone-900/90 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'নোটিফিকেশন পাঠানো হচ্ছে...' : 'সকলের ডিভাইসে নোটিফিকেশন পাঠান'}</span>
                  </button>

                  {isAlertSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>নোটিফিকেশন সফলভাবে সকল ডিভাইসে সম্প্রচার করা হয়েছে!</span>
                    </motion.div>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </motion.div>
    </div>
  );
};
