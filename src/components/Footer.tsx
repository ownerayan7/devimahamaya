import React from 'react';
import {
  MapPin,
  Mail,
  ExternalLink,
  Heart,
  Youtube,
  Instagram,
  Phone,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { PageId } from '../types';
import { CLUB_INFO } from '../data/clubData';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onReplayWelcome?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onReplayWelcome }) => {
  const quickLinks: Array<{ id: PageId; label: string }> = [
    { id: 'home', label: 'হোম পেজ (Home)' },
    { id: 'durga-puja', label: 'শারদীয়া দুর্গাপূজা ২০২৬' },
    { id: 'social-services', label: 'সামাজিক সেবাসমূহ' },
    { id: 'prayer', label: 'প্রার্থনা' },
    { id: 'rabindra-sangeet', label: 'রবীন্দ্র সঙ্গীত' },
    { id: 'mahalaya', label: 'মহালয়া' },
    { id: 'radio', label: 'ইন্ডিয়ান রেডিও লাইভ (Radio India)' },
    { id: 'shopping', label: 'Online Shopping (পুজো কেনাকাটা)' },
    { id: 'gita', label: 'শ্রীমদ্ভগবদ্গীতা পাঠ ও অমৃতবাণী' },
    { id: 'videos', label: 'ভিডিও ও ডকুমেন্টারি' },
    { id: 'tree-plantation', label: 'বৃক্ষরোপণ ও সবুজায়ন' },
    { id: 'gallery', label: 'স্মৃতির পাতায় গ্যালারি' },
    { id: 'about', label: 'আমাদের ইতিহাস ও স্বপ্ন' },
    { id: 'donate', label: 'সহযোগিতা ও অনুদান' },
    { id: 'contact', label: 'যোগাযোগ ও মণ্ডপ ম্যাপ' },
  ];

  const serviceLinks: Array<{ id: PageId; label: string }> = [
    { id: 'medical', label: 'চিকিৎসা সাহায্য আবেদন' },
    { id: 'needy', label: 'দরিদ্র ও দুস্থ সেবা' },
    { id: 'scholarship', label: 'শিক্ষাবৃত্তি ও স্কলারশিপ' },
  ];

  return (
    <footer className="relative bg-[#060406] border-t border-amber-500/20 pt-16 pb-8 text-stone-300 overflow-hidden">
      {/* Background festive glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.15),_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand & About Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-red-600/20 p-1 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden">
                <img
                  src={CLUB_INFO.images.logo}
                  alt={CLUB_INFO.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const current = e.currentTarget.src;
                    if (!current.includes('thumbnail') && CLUB_INFO.images.logoThumbnail) {
                      e.currentTarget.src = CLUB_INFO.images.logoThumbnail;
                    } else if (!current.includes('logo_maa_aschen.jpg')) {
                      e.currentTarget.src = CLUB_INFO.images.logoFallback;
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-serif-bengali text-gold-gradient">
                  {CLUB_INFO.nameBn}
                </h3>
              </div>
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold">
              ✨ {CLUB_INFO.tagline}
            </div>

            <p className="text-sm text-stone-300/85 leading-relaxed pr-4">
              {CLUB_INFO.description}
            </p>

            {/* Social Media Channels */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 block mb-2.5">
                অফিসিয়াল সোশ্যাল লিংক:
              </span>
              <div className="flex flex-col items-start gap-3 w-full">
                {/* Facebook */}
                <a
                  href={CLUB_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-4 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-blue-100 text-sm font-semibold transition-all flex items-center justify-between shadow-sm"
                  title="Facebook পেজ"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2] animate-pulse" />
                    <span>Facebook Page</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-300" />
                </a>

                {/* WhatsApp Channel */}
                <a
                  href={CLUB_INFO.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-4 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-emerald-100 text-sm font-semibold transition-all flex items-center justify-between shadow-sm"
                  title="WhatsApp চ্যানেল"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Channel</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-emerald-300" />
                </a>

                {/* YouTube */}
                <a
                  href={CLUB_INFO.youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-4 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/30 border border-[#FF0000]/40 text-red-100 text-sm font-semibold transition-all flex items-center justify-between shadow-sm"
                  title="YouTube চ্যানেল"
                >
                  <div className="flex items-center gap-3">
                    <Youtube className="w-4 h-4 text-[#FF0000]" />
                    <span>YouTube Channel</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-red-300" />
                </a>

                {/* Instagram */}
                <a
                  href={CLUB_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-4 rounded-xl bg-[#E4405F]/15 hover:bg-[#E4405F]/30 border border-[#E4405F]/40 text-pink-100 text-sm font-semibold transition-all flex items-center justify-between shadow-sm"
                  title="Instagram পেজ"
                >
                  <div className="flex items-center gap-3">
                    <Instagram className="w-4 h-4 text-[#E4405F]" />
                    <span>Instagram</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-pink-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-base font-bold font-serif-bengali text-amber-200 flex items-center gap-2 border-b border-white/10 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>প্রধান পেজসমূহ</span>
            </h4>
            <ul className="space-y-1.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      onNavigate(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group flex items-center gap-1.5 text-stone-300 hover:text-amber-200 transition-colors py-0.5 text-left"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400/60 group-hover:translate-x-1 transition-transform" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
              {onReplayWelcome && (
                <li>
                  <button
                    onClick={onReplayWelcome}
                    className="group flex items-center gap-1.5 text-amber-300 font-semibold hover:text-amber-100 transition-colors py-1 text-left"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>✨ উৎসব আগমনী অ্যানিমেশন দেখুন</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>



        {/* Social Services & Forms Column & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          <div className="lg:col-span-12 space-y-4">
            <h4 className="text-base font-bold font-serif-bengali text-amber-200 flex items-center gap-2 border-b border-white/10 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>ঠিকানা ও যোগাযোগ</span>
            </h4>

            {/* Address Box */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-stone-400 block font-medium">ক্লাবের স্থায়ী ঠিকানা:</span>
                  <p className="text-stone-200 font-semibold mt-0.5">
                    {CLUB_INFO.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="text-stone-400">অফিসিয়াল ইমেল:</span>
                  <a
                    href={`mailto:${CLUB_INFO.email}`}
                    className="text-amber-300 hover:underline block font-mono"
                  >
                    {CLUB_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Button */}
            <a
              href={CLUB_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 border border-amber-500/40 text-amber-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)] group"
            >
              <span>📍 Google Maps-এ মণ্ডপের লোকেশন দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Services Portal links */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/80 block mb-1.5">
                অনলাইন সহায়তা ফর্ম:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {serviceLinks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onNavigate(s.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 text-stone-300 hover:text-amber-200 border border-white/10 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © 2026 <span className="text-amber-200 font-bold">{CLUB_INFO.nameBn}</span>। সর্বস্বত্ব সংরক্ষিত।
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>সেবা • সংস্কৃতি • সম্প্রীতি • একতা</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
