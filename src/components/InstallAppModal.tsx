import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  Chrome,
  X,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Settings
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'apk'>('android');
  const [showBrowserGuide, setShowBrowserGuide] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowBrowserGuide(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#110d14] border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden text-stone-100 my-auto z-10"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 px-5 py-4 flex items-center justify-between border-b border-amber-400/30">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="11 স্টার ক্লাব অ্যাপ আইকন"
                className="w-10 h-10 rounded-xl object-cover border-2 border-amber-300 shadow-md flex-shrink-0"
              />
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg font-serif-bengali flex items-center gap-1.5">
                  <span>11 স্টার ক্লাব মোবাইল অ্যাপ</span>
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-sans font-black">
                    PWA
                  </span>
                </h3>
                <p className="text-xs text-amber-200/90 font-serif-bengali">
                  মোবাইল ও কম্পিউটারে সরাসরি অ্যাপ ডাউনলোড ও ইনস্টল
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-stone-300 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {/* Quick 1-Click Install Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>১ ক্লিকে ফোনে অ্যাপ হিসেবে রাখুন</span>
                </div>
                <p className="text-xs text-stone-300">
                  প্লে-স্টোরে যাওয়ার বা কোনো ফাইল ডাউনলোড করার দরকার নেই, সরাসরি ফুল-স্ক্রিন অ্যাপ ইনস্টল হবে!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                {isInIframe && (
                  <button
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ফুল ব্রাউজারে খুলুন</span>
                  </button>
                )}
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 flex-shrink-0 transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4 text-stone-950" />
                  <span>ইনস্টল করুন</span>
                </button>
              </div>
            </div>

            {/* Official Installed Home Screen App Icon Preview */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/30 flex items-center gap-3.5 shadow-inner">
              <div className="relative flex-shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="ফোনের হোম স্ক্রিন অ্যাপ আইকন"
                  className="w-16 h-16 rounded-[18px] object-cover shadow-[0_0_20px_rgba(245,158,11,0.4)] border-2 border-amber-300"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-black"></span>
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-amber-300/90 font-medium">ইনস্টল হওয়ার পর হোম স্ক্রিন আইকন:</div>
                <div className="text-sm font-bold text-white truncate">11 স্টার ক্লাব (11 Star Club)</div>
                <div className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                  মা দুর্গার চোখ ও "মা আসছেন" অঙ্কিত অফিশিয়াল আইকনটি আপনার ফোনের হোম স্ক্রিনে অ্যাপের লোগো হিসেবে প্রদর্শিত হবে।
                </div>
              </div>
            </div>

            {/* Play Protect & Permissions Trouble Guide Card */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>প্লে প্রোটেক্ট (Play Protect) বা পারমিশন নিয়ে সমস্যা?</span>
                </div>
                <button
                  onClick={() => setShowPermissionGuide(!showPermissionGuide)}
                  className="text-[11px] text-amber-300 underline font-medium hover:text-amber-200"
                >
                  {showPermissionGuide ? 'লুকান' : 'সহজ সমাধান দেখুন'}
                </button>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                <strong>প্লে প্রোটেক্ট অফ করার কোনো দরকার নেই!</strong> এটি কোনো ক্ষতিকারক ফাইল নয়, এটি গুগল অনুমোদিত সুরক্ষিত ওয়েব অ্যাপ (PWA)।
              </p>

              {showPermissionGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 border-t border-emerald-500/20 text-xs text-stone-300 space-y-2"
                >
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>Redmi / Realme / Vivo / Samsung ফোনে শর্টকাট না বসলে:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] pl-1 text-stone-300">
                    <li>আপনার ফোনের <strong>Settings &gt; Apps &gt; Chrome</strong>-এ যান (অথবা Chrome অ্যাপ আইকনটিতে ২ সেকেন্ড চেপে ধরে <strong>'App Info'</strong>-তে চাপুন)।</li>
                    <li>সেখান থেকে <strong>'Other permissions'</strong> (অন্যান্য অনুমতি)-তে ক্লিক করুন।</li>
                    <li><strong>'Home screen shortcuts' (হোম স্ক্রিন শর্টকাট)</strong> অপশনটিতে গিয়ে <strong>'Always allow'</strong> (অনুমোদন) নির্বাচন করে দিন।</li>
                    <li>এবার Chrome ব্রাউজারের থ্রি-ডট (⋮) মেনু থেকে <strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> চাপলে নিমেষেই অ্যাপটি হোম স্ক্রিনে চলে আসবে!</li>
                  </ol>
                </motion.div>
              )}
            </div>

            {showBrowserGuide && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-400 text-xs sm:text-sm text-amber-100 space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>ব্রাউজার থেকে সরাসরি ইনস্টল করার নিয়ম:</span>
                </div>
                <p className="text-stone-200 text-xs leading-relaxed">
                  ব্রাউজারের উপরে ডানদিকের তিনটি ডট মেনু (⋮) অথবা শেয়ার অপশনে চাপ দিয়ে <strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> নির্বাচন করুন। সাথে সাথে আপনার ফোনের স্ক্রিনে অফিশিয়াল অ্যাপ আইকনটি চলে আসবে।
                </p>
              </motion.div>
            )}

            {/* Tab Selection */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-stone-900/80 border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('android')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Chrome className="w-3.5 h-3.5" />
                <span>Android / Chrome</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Share className="w-3.5 h-3.5" />
                <span>iPhone / Safari</span>
              </button>
              <button
                onClick={() => setActiveTab('apk')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'apk'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>APK ফাইল তৈরি</span>
              </button>
            </div>

            {/* Tab 1: Android Guide */}
            {activeTab === 'android' && (
              <div className="space-y-3 p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-xs sm:text-sm">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>অ্যান্ড্রয়েড ফোনে যেভাবে অ্যাপ বানাবেন:</span>
                </h4>
                <ol className="space-y-2.5 text-stone-300 list-decimal list-inside leading-relaxed">
                  <li>
                    আপনার ফোনের <strong>Google Chrome</strong> ব্রাউজারে এই পেজটি খুলুন।
                  </li>
                  <li>
                    উপরে ডানদিকের <strong>তিনটি ডট মেনু (⋮)</strong>-তে চাপ দিন।
                  </li>
                  <li>
                    মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> (হোম স্ক্রিনে যোগ করুন) অপশনে ক্লিক করুন।
                  </li>
                  <li>
                    কনফার্ম করলে সঙ্গে সঙ্গে ফোনের স্ক্রিনে <strong>11 স্টার ক্লাব</strong> অ্যাপ আইকন তৈরি হয়ে যাবে!
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 2: iPhone / Safari Guide */}
            {activeTab === 'ios' && (
              <div className="space-y-3 p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-xs sm:text-sm">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>আইফোন / আইপ্যাডে অ্যাপ ইনস্টল:</span>
                </h4>
                <ol className="space-y-2.5 text-stone-300 list-decimal list-inside leading-relaxed">
                  <li>
                    আইফোনের <strong>Safari</strong> ব্রাউজারে এই ওয়েবসাইটের লিঙ্ক খুলুন।
                  </li>
                  <li>
                    নিচে থাকা <strong>Share (শেয়ার) বাটন</strong>-এ (<Share className="w-3.5 h-3.5 inline mx-1 text-amber-400" />) ট্যাপ করুন।
                  </li>
                  <li>
                    একটু নিচে স্ক্রোল করে <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-1 text-amber-400" />) চাপুন।
                  </li>
                  <li>
                    উপরে <strong>"Add"</strong> বাটনে ক্লিক করলেই আপনার হোম স্ক্রিনে অ্যাপটি চলে আসবে।
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 3: APK / Store Guide */}
            {activeTab === 'apk' && (
              <div className="space-y-3 p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-xs sm:text-sm leading-relaxed">
                <h4 className="font-bold text-amber-300 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>রেডিমেড APK প্যাকেজ তৈরি (Google Play Store):</span>
                </h4>
                <p className="text-stone-300">
                  আপনি যদি সরাসরি একটি <strong>.apk</strong> ফাইল বানিয়ে সবাইকে শেয়ার করতে চান:
                </p>
                <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20 space-y-2">
                  <p className="text-xs text-amber-200">
                    ১. নিচের লিঙ্কে ক্লিক করে এই সাইটের URL কপি করুন।
                  </p>
                  <p className="text-xs text-amber-200">
                    ২. <strong>PWABuilder.com</strong> সাইটে লিঙ্কটি পেস্ট করে "Start" চাপলেই ফ্রি-তে Android APK / Package ডাউনলোড হবে।
                  </p>
                </div>
                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-200 font-bold text-xs transition-colors"
                >
                  <span>PWABuilder.com-এ যান</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Copy Link to Share with Members */}
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
              <div className="text-xs text-stone-400 flex items-center gap-1.5 truncate">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">অন্যান্য ক্লাব সদস্যদের লিঙ্কটি পাঠান:</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>লিঙ্ক কপি</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
