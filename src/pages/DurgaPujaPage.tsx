import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Calendar,
  Sparkles,
  MapPin,
  ExternalLink,
  Eye,
  Clock,
  Music,
  Sun,
  Moon,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { PUJA_SCHEDULE_2026, CLUB_INFO, ANNOUNCEMENTS } from '../data/clubData';
import { ImageLightbox } from '../components/ImageLightbox';
import { AdminStorageAccessCard } from '../components/AdminStorageAccessCard';

interface DurgaPujaPageProps {
  onOpenAdminStorage?: () => void;
}

export const DurgaPujaPage: React.FC<DurgaPujaPageProps> = ({ onOpenAdminStorage }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(245,158,11,0.25)]">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span>শারদীয়া দুর্গোৎসব ২০২৬</span>
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient drop-shadow-lg">
          শারদীয়া দুর্গাপূজা ২০২৬ — সময়সূচী ও দিনপঞ্জি
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          11 স্টার ক্লাবের পক্ষ থেকে সকল ভক্ত ও শুভানুধ্যায়ীদের জানাই শারদীয়া দুর্গোৎসবের আন্তরিক প্রীতি, শুভেচ্ছা ও অভিনন্দন। পূজার সম্পূর্ণ নির্ঘণ্ট নিচে প্রকাশ করা হলো।
        </p>
      </motion.div>

      {/* Khuti Puja Notice Highlight Card */}
      <section className="rounded-3xl glass-card border border-amber-500/30 p-6 sm:p-10 gold-glow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-xs">
                📢 বিশেষ সূচনা
              </span>
              <span className="text-xs text-amber-300">খুঁটি পূজার বিজ্ঞপ্তি</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-white">
              খুঁটি পূজার আনুষ্ঠানিক বিজ্ঞপ্তি
            </h2>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-100 text-base sm:text-lg font-medium leading-relaxed">
              "{ANNOUNCEMENTS[0].content}"
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 pt-2">
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">তারিখ: ৪ সেপ্টেম্বর, ২০২৬ (শুক্রবার)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>স্থান: 11 স্টার ক্লাব প্রাঙ্গণ</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={() => setLightboxOpen(true)}
              className="cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-black/60 shadow-2xl transition-all hover:scale-105 hover:border-amber-400 max-w-sm"
            >
              <img
                src={CLUB_INFO.images.khutiPujaNotice}
                alt="খুঁটি পূজা নোটিশ"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.currentTarget.src = CLUB_INFO.images.heroDurga;
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                <Eye className="w-8 h-8 text-amber-300 mb-2" />
                <span className="text-xs font-bold text-white bg-amber-500/30 px-3 py-1 rounded-full border border-amber-400/50">
                  সম্পূর্ণ নোটিশ পত্র দেখুন
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Puja 2026 Full Day-by-Day Schedule */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Calendar className="w-4 h-4" />
            <span>পঞ্জিকানুযায়ী দিনপঞ্জি</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif-bengali text-gold-gradient">
            পূজার দিনভিত্তিক পূর্ণাঙ্গ নির্ঘণ্ট
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            খুঁটি পূজা থেকে বিজয়া দশমী পর্যন্ত সমস্ত পর্ব
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PUJA_SCHEDULE_2026.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`rounded-2xl p-6 glass-card glass-card-hover border relative overflow-hidden flex flex-col justify-between space-y-4 ${
                item.highlight
                  ? 'border-amber-500/40 bg-gradient-to-b from-[#22100a]/80 to-[#120708]/90 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                  : 'border-white/10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    পর্ব 0{idx + 1}
                  </span>
                  {item.highlight && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/40 text-red-200 border border-red-500/40">
                      মহাপর্ব
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold font-serif-bengali text-white">
                  {item.event}
                </h3>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>বাংলা: {item.dateBengali}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>ইংরেজি: {item.dateEnglish}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed pt-2 border-t border-white/5">
                  {item.description}
                </p>
              </div>

              <div className="text-[11px] text-amber-400/80 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>11 স্টার ক্লাব দুর্গাপূজা প্রাঙ্গণ</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cultural Announcements & Updates */}
      <section className="rounded-3xl glass-card border border-amber-500/30 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif-bengali text-gold-gradient">
              ঘোষণা ও শিল্পী সংক্রান্ত আপডেট
            </h3>
            <p className="text-xs text-stone-400">সাংস্কৃতিক অনুষ্ঠান ও বিশেষ আয়োজন</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/20 space-y-3">
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
            সাংস্কৃতিক অনুষ্ঠান, অঞ্জলির সময় ও বিশেষ ঘোষণার সময়সূচী পরবর্তীতে ক্লাবের নোটিশ বোর্ডে ও এই পেজে নিয়মিত প্রকাশ করা হবে। নজর রাখুন আমাদের বিজ্ঞপ্তিতে।
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={CLUB_INFO.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>WhatsApp চ্যানেলে নোটিফিকেশন পান</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={CLUB_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>মণ্ডপে আসার দিকনির্দেশনা (Map)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={CLUB_INFO.images.khutiPujaNotice}
        title="শারদীয়া দুর্গাপূজা ২০২৬ — খুঁটি পূজার অফিসিয়াল বিজ্ঞপ্তি"
        subtitle="11 স্টার ক্লাব"
      />

      {/* Admin Locked Club Storage Access */}
      <div className="pt-8">
        <AdminStorageAccessCard onOpenAdminStorage={onOpenAdminStorage} />
      </div>
    </div>
  );
};
