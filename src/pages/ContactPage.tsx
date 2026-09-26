import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Mail,
  ExternalLink,
  MessageSquare,
  Youtube,
  Instagram,
  Send,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  KeyRound
} from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';
import { saveMessageToStorage } from '../components/AdminInboxModal';

interface ContactPageProps {
  onOpenAdminInbox?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenAdminInbox }) => {
  const [submitted, setSubmitted] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    
    // Save to real local storage for Admin Inbox
    const saved = saveMessageToStorage({
      name: formData.name,
      phone: formData.phone,
      subject: formData.subject || 'সাধারণ যোগাযোগ',
      message: formData.message,
    });

    setLastSavedId(saved.id);
    setSubmitted(true);
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>যোগাযোগ ও দিকনির্দেশনা</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          যোগাযোগ ও মণ্ডপ লোকেশন
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed">
          যেকোনো জিজ্ঞাসা, পূজার অনুদান, চিকিৎসা বা সামাজিক সহায়তা সংক্রান্ত বিষয়ে আমাদের সাথে সরাসরি যোগাযোগ করুন।
        </p>

        {/* Prominent Admin Inbox Banner Button */}
        {onOpenAdminInbox && (
          <div className="pt-2">
            <button
              onClick={onOpenAdminInbox}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] border-2 border-amber-400/80 hover:scale-105 active:scale-95 transition-all"
              id="contact-admin-inbox-header-btn"
            >
              <ShieldCheck className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>🔒 ক্লাব অ্যাডমিন ইনবক্স (প্রাপ্ত বার্তাসমূহ দেখুন)</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Grid: Left Contact Info + Right Interactive Maps & Inquiry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Cards & Social Channels */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Address Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/30 space-y-6 gold-glow">
            <h3 className="text-xl font-bold font-serif-bengali text-gold-gradient flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>অফিসিয়াল ঠিকানা ও তথ্য</span>
            </h3>

            {/* Address */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                  ক্লাব ও মণ্ডপ প্রাঙ্গণ:
                </span>
                <p className="text-sm font-bold text-white">
                  {CLUB_INFO.address}
                </p>
                <p className="text-xs text-amber-300/80">
                  {CLUB_INFO.locationName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                  ইমেল ঠিকানা:
                </span>
                <a
                  href={`mailto:${CLUB_INFO.email}`}
                  className="text-sm font-bold text-amber-200 hover:underline font-mono"
                >
                  {CLUB_INFO.email}
                </a>
              </div>
            </div>

            {/* Google Maps Button */}
            <a
              href={CLUB_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
            >
              <span>📍 Google Maps-এ সরাসরি লোকেশন দেখুন</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Social Channels Card */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <h4 className="text-base font-bold font-serif-bengali text-white">
              আমাদের অফিসিয়াল সোশ্যাল মিডিয়া
            </h4>

            <div className="space-y-2.5">
              <a
                href={CLUB_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CLUB_INFO.facebookUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full p-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2]/25 border border-[#1877F2]/40 text-blue-200 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" />
                  <span>Facebook Official Page</span>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-300" />
              </a>

              <a
                href={CLUB_INFO.whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CLUB_INFO.whatsappChannelUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full p-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-emerald-200 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Community Channel</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-300" />
              </a>

              <a
                href={CLUB_INFO.youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CLUB_INFO.youtubeChannelUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full p-3 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/25 border border-[#FF0000]/40 text-red-200 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Youtube className="w-4 h-4 text-[#FF0000]" />
                  <span>YouTube Video Channel</span>
                </div>
                <ExternalLink className="w-4 h-4 text-red-300" />
              </a>

              <a
                href={CLUB_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(CLUB_INFO.instagramUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-full p-3 rounded-xl bg-[#E4405F]/15 hover:bg-[#E4405F]/25 border border-[#E4405F]/40 text-pink-200 text-xs font-bold transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-[#E4405F]" />
                  <span>Instagram Official Page</span>
                </div>
                <ExternalLink className="w-4 h-4 text-pink-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Google Maps Embed + Quick Message */}
        <div className="lg:col-span-7 space-y-6">
          {/* Responsive Map Embed */}
          <div className="rounded-3xl overflow-hidden border-2 border-amber-500/35 glass-card shadow-2xl space-y-0">
            {/* Google Maps Header */}
            <div className="px-5 py-3 bg-[#18181b] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-white font-serif-bengali">Google Maps ম্যাপ ভিউ</span>
              </div>
              <span className="text-[11px] text-amber-300 font-mono">Arkhana, PIN 721641</span>
            </div>

            <div className="w-full h-80 sm:h-96 relative bg-stone-900">
              <iframe
                title="11 Star Club Exact Map"
                src="https://maps.google.com/maps?q=Arkhana+Uttar+Malik+Para+721641&hl=bn&z=15&output=embed"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-t border-amber-500/20 text-xs text-stone-300">
              <span>📍 {CLUB_INFO.address}</span>
              <a
                href={CLUB_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1 transition-colors"
              >
                <span>গুগল ম্যাপে খুলুন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Message / Feedback Form */}
          <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-5">
            <h3 className="text-xl font-bold font-serif-bengali text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>সরাসরি বার্তা বা অনুসন্ধান পাঠান</span>
            </h3>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center space-y-3"
              >
                <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="text-lg font-bold text-amber-200 font-serif-bengali">
                  আপনার বার্তা সফলভাবে ক্লাবের সিস্টেমে জমা হয়েছে!
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  বার্তা আইডি: <span className="font-mono text-amber-400 font-bold bg-black/40 px-2 py-0.5 rounded">{lastSavedId}</span>। ক্লাবের প্রতিনিধি দল শীঘ্রই যোগাযোগ করবে।
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <a
                    href="https://whatsapp.com/channel/0029Va8LsgcB4hdNxmQWye03"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`নমস্কার 11 স্টার ক্লাব,\nবার্তা আইডি: ${lastSavedId}\nনাম: ${formData.name}\nবিষয়: ${formData.subject || 'সাধারণ বার্তা'}\nবার্তা: ${formData.message}`);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>হোয়াটসঅ্যাপ চ্যানেলেও এই বার্তাটি পাঠান</span>
                  </a>

                  {onOpenAdminInbox && (
                    <button
                      onClick={onOpenAdminInbox}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>ইনবক্সে দেখুন</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', phone: '', subject: '', message: '' });
                  }}
                  className="mt-3 text-xs font-semibold text-stone-400 hover:text-amber-300 underline block mx-auto"
                >
                  নতুন আরেকটি বার্তা লিখুন
                </button>
              </motion.div>
            ) : (
              <form key="contact-form" onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-medium block">আপনার নাম *</label>
                    <input
                      key="contact-name-input"
                      id="contact-name-input"
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="পুরো নাম লিখুন"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-medium block">মোবাইল নম্বর</label>
                    <input
                      key="contact-phone-input"
                      id="contact-phone-input"
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="১০ সংখ্যার মোবাইল নম্বর"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-medium block">বিষয় / প্রসঙ্গের নাম</label>
                  <input
                    key="contact-subject-input"
                    id="contact-subject-input"
                    type="text"
                    value={formData.subject || ""}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="যেমন: দুর্গাপূজা অনুদান / চিকিৎসা সহায়তা / সাধারণ জিজ্ঞাসা"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-medium block">আপনার বার্তা *</label>
                  <textarea
                    key="contact-message-input"
                    id="contact-message-input"
                    rows={4}
                    required
                    value={formData.message || ""}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="আপনার বার্তা বিস্তারিত লিখুন..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>বার্তা পাঠিয়ে দিন</span>
                </button>
              </form>
            )}

            {/* Bottom Inbox Shortcut Card */}
            {onOpenAdminInbox && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ক্লাব কর্মকর্তাদের জন্য:</span>
                </span>
                <button
                  onClick={onOpenAdminInbox}
                  className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
                >
                  <span>সব বার্তা ইনবক্সে দেখুন</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
