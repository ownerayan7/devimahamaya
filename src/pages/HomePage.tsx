import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Flame,
  Moon,
  Radio,
  HeartHandshake,
  ArrowRight,
  ExternalLink,
  MapPin,
  Play,
  ShoppingBag,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  Trees,
  GraduationCap,
  HeartPulse,
  HandHeart,
  Download,
  BookOpen,
  Mail,
  MessageSquare,
  Youtube,
  ShieldCheck
} from 'lucide-react';
import { PageId } from '../types';
import { CLUB_INFO, SERVICES_LIST, ACTIVITIES_TIMELINE, FEATURED_VIDEOS } from '../data/clubData';
import { Countdowns } from '../components/Countdowns';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { AdminStorageAccessCard } from '../components/AdminStorageAccessCard';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenInstallModal?: () => void;
  onReplayWelcome?: () => void;
  onOpenAdminStorage?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenInstallModal, onReplayWelcome, onOpenAdminStorage }) => {

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 sm:pt-28 pb-12 overflow-hidden">
        {/* Background Aura & Radial Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.18)_0%,_rgba(220,38,38,0.1)_35%,_transparent_70%)] blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-red-900/15 blur-2xl" />
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-amber-600/15 blur-2xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6 sm:space-y-8">
          {/* Top Pill / Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/15 to-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>11 STAR CLUB • COMMUNITY & CULTURE</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          </motion.div>

          {/* Main Titles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-2"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-serif-bengali text-gold-gradient drop-shadow-[0_5px_30px_rgba(245,158,11,0.4)]">
              {CLUB_INFO.nameBn}
            </h1>
          </motion.div>

          {/* Tagline Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold font-serif-bengali text-festive-gradient max-w-2xl mx-auto drop-shadow-md"
          >
            {CLUB_INFO.tagline}
          </motion.div>

          {/* Preserved Authentic Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl mx-auto p-5 sm:p-7 rounded-2xl glass-card border border-amber-500/30 text-stone-200 text-sm sm:text-base sm:leading-relaxed text-justify sm:text-center font-medium shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <p>{CLUB_INFO.description}</p>
          </motion.div>

          {/* Hero Action Buttons - 5 Separate Lines (Boro Theke Choto / Pyramid) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center justify-center gap-2.5 sm:gap-3 pt-3 max-w-xl mx-auto w-full"
          >
            {/* 1. দুর্গাপূজা ২০২৬ (Line 1: Largest & Most Prominent) */}
            <div className="w-full flex justify-center">
              <button
                id="hero-durga-puja-btn"
                onClick={() => onNavigate('durga-puja')}
                className="w-full max-w-[320px] sm:max-w-md py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-sm sm:text-base transition-all shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:shadow-[0_0_35px_rgba(245,158,11,0.65)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Flame className="w-5 h-5 text-red-700 shrink-0" />
                <span>দুর্গাপূজা ২০২৬</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* 2. সামাজিক সেবা ও আবেদন (Line 2) */}
            <div className="w-full flex justify-center">
              <button
                id="hero-social-services-btn"
                onClick={() => onNavigate('social-services')}
                className="w-full max-w-[280px] sm:max-w-sm py-3 px-5 sm:px-6 rounded-xl bg-[#18100a] hover:bg-[#25180f] border border-amber-500/50 hover:border-amber-400 text-amber-200 font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
                <span>সামাজিক সেবা ও আবেদন</span>
              </button>
            </div>

            {/* 3. প্রার্থনা (Line 3) */}
            <div className="w-full flex justify-center">
              <button
                id="hero-prayer-btn"
                onClick={() => onNavigate('prayer')}
                className="w-full max-w-[240px] sm:max-w-[280px] py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl bg-[#1a1109] hover:bg-[#26180c] border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>প্রার্থনা</span>
              </button>
            </div>

            {/* 4. রবীন্দ্র সঙ্গীত (Line 4) */}
            <div className="w-full flex justify-center">
              <button
                id="hero-rabindra-sangeet-btn"
                onClick={() => onNavigate('rabindra-sangeet')}
                className="w-full max-w-[200px] sm:max-w-[230px] py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl bg-[#190f08] hover:bg-[#25150a] border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>রবীন্দ্র সঙ্গীত</span>
              </button>
            </div>

            {/* 5. মহালয়া (Line 5: Most Compact) */}
            <div className="w-full flex justify-center">
              <button
                id="hero-mahalaya-btn"
                onClick={() => onNavigate('mahalaya')}
                className="w-full max-w-[160px] sm:max-w-[185px] py-2 px-3.5 sm:px-4 rounded-xl bg-[#0e172a] hover:bg-[#15223d] border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 font-bold text-xs transition-all shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Moon className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>মহালয়া</span>
              </button>
            </div>

            {/* 6. রেডিও (Line 6: Right after Mahalaya - progressively smaller) */}
            <div className="w-full flex justify-center">
              <button
                id="hero-radio-btn"
                onClick={() => onNavigate('radio')}
                className="w-full max-w-[125px] sm:max-w-[145px] py-1.5 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-[#180d06] to-[#241208] hover:from-[#241208] hover:to-[#30170a] border border-amber-500/40 hover:border-amber-300 text-amber-200 font-bold text-[11px] sm:text-xs transition-all shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Radio className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                <span>রেডিও</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* ================= LIVE COUNTDOWNS ================= */}
        <section id="countdowns-section">
          <Countdowns
            onNavigateToMahalaya={() => onNavigate('mahalaya')}
            onNavigateToPuja={() => onNavigate('durga-puja')}
          />
        </section>

        {/* ================= ANNOUNCEMENT & KHUTI PUJA NOTICE ================= */}
        <section id="announcements-section">
          <AnnouncementCard />
        </section>

        {/* ================= KEY SERVICES & OFFICIAL GOOGLE FORMS ================= */}
        <section id="services-grid" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                <HeartHandshake className="w-4 h-4" />
                <span>মানবতার কল্যাণে আমাদের অঙ্গীকার</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif-bengali text-gold-gradient">
                জরুরি সামাজিক সেবা ও সহায়তা
              </h2>
            </div>
            <button
              onClick={() => onNavigate('social-services')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200 hover:underline"
            >
              <span>সকল সামাজিক উদ্যোগ দেখুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Core Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES_LIST.slice(0, 4).map((service, idx) => {
              const iconMap: Record<string, React.ReactNode> = {
                HeartPulse: <HeartPulse className="w-7 h-7 text-rose-400" />,
                HandHeart: <HandHeart className="w-7 h-7 text-amber-400" />,
                GraduationCap: <GraduationCap className="w-7 h-7 text-blue-400" />,
                Trees: <Trees className="w-7 h-7 text-emerald-400" />,
              };

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-2xl bg-[#140e11] hover:bg-[#1e141a] p-6 flex flex-col justify-between border border-amber-500/30 transition-all duration-300 shadow-lg relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                        {iconMap[service.icon]}
                      </div>
                      <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider font-cinzel-title">
                        0{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold font-serif-bengali text-white group-hover:text-amber-200 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
                        {service.englishTitle}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-300/85 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {service.features && (
                      <ul className="space-y-1.5 pt-2 border-t border-white/5">
                        {service.features.slice(0, 2).map((feat, fIdx) => (
                          <li key={fIdx} className="text-xs text-stone-300 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Button Action */}
                  <div className="pt-6 space-y-2">
                    {service.formUrl ? (
                      <a
                        href={service.formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)] group/btn"
                      >
                        <span>আবেদন ফর্ম খুলুন</span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <button
                        onClick={() => onNavigate(service.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-stone-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>বিস্তারিত দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate(service.id)}
                      className="w-full text-center text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
                    >
                      নিয়মাবলী ও বিস্তারিত পেজ →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Form Verification Warning Note Preserved from Old Website */}
          <div className="p-4 sm:p-5 rounded-xl bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300 block">
                ⚠️ আবেদনকারীদের জন্য বিশেষ দ্রষ্টব্য ও যাচাইকরণ নির্দেশিকা:
              </span>
              <p className="text-stone-300 leading-relaxed">
                ১. আবেদনপত্র জমা দেওয়ার জন্য আপনার গুগল অ্যাকাউন্ট (Gmail) দিয়ে সাইন-ইন করা বাধ্যতামূলক। 
                ২. ফর্ম জমা দিলেই সাহায্য সুনিশ্চিত হয় না। আপনার প্রদান করা তথ্য ও নথি 11 স্টার ক্লাবের নিরপেক্ষ টিম দ্বারা সরেজমিনে সরাসরি যাচাই (Physical & Document Verification) করা হবে। 
                ৩. সঠিক ও সৎ আবেদনকারীদের ক্লাব কমিটির সিদ্ধান্ত অনুযায়ী সাহায্য প্রদান করা হবে।
              </p>
            </div>
          </div>
        </section>

        {/* ================= RECENT ACTIVITIES (Prompt #16) ================= */}
        <section id="recent-activities" className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>ক্লাবের অগ্রগতি ও উদ্যোগ</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-gold-gradient">
                সাম্প্রতিক কার্যক্রম
              </h2>
            </div>
            <span className="text-xs text-stone-400">২০২৬ বছরব্যাপী পরিকল্পনা</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACTIVITIES_TIMELINE.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-5 rounded-2xl glass-card border border-amber-500/20 hover:border-amber-400/50 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    {item.tag}
                  </span>
                  <span className="text-xs text-stone-400 font-mono font-bold">
                    {item.year}
                  </span>
                </div>

                <h4 className="text-lg font-bold font-serif-bengali text-white group-hover:text-amber-200 transition-colors">
                  {item.bengaliTitle}
                </h4>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= NEW SHOPPING & MAHALAYA PROMO BANNER ================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Online Shopping Teaser */}
          <div
            onClick={() => onNavigate('shopping')}
            className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer group gold-glow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-black text-xs font-extrabold uppercase tracking-wider">
                  NEW FEATURE
                </span>
                <ShoppingBag className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold font-serif-bengali text-white group-hover:text-amber-200 transition-colors">
                🛍️ Online Shopping (পুজোর সেরা কেনাকাটা)
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Flipkart, Amazon ও Meesho-র অফিশিয়াল ফেস্টিভ্যাল অফারে পোশাক, উপহার ও পুজো সাজের কেনাকাটা করুন এক ক্লিকে।
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-sm font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>শপিং পোর্টাল খুলুন</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Mahalaya Teaser */}
          <div
            onClick={() => onNavigate('mahalaya')}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0b1736]/90 to-[#040816]/90 border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer group shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-bold uppercase tracking-wider">
                  SPECIAL DEVOTIONAL
                </span>
                <Moon className="w-6 h-6 text-cyan-300 group-hover:rotate-12 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold font-serif-bengali text-white group-hover:text-cyan-200 transition-colors">
                🌙 মহালয়া
              </h3>
              <p className="text-cyan-100/80 text-xs sm:text-sm leading-relaxed">
                বীরেন্দ্রকৃষ্ণ ভদ্রের চণ্ডীপাঠ, মহিষাসুরমর্দিনী ও মহালয়ার বিশেষ ভিডিও প্লেলিস্ট শুনুন ভক্তিভরে।
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-sm font-bold text-cyan-300 group-hover:translate-x-1 transition-transform">
              <span>মহালয়া পেজে যান</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Bhagavad Gita Teaser */}
          <div
            onClick={() => onNavigate('gita')}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1b1207]/90 to-[#080402]/90 border border-amber-500/40 hover:border-amber-300 transition-all cursor-pointer group shadow-[0_0_30px_rgba(245,158,11,0.2)] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold uppercase tracking-wider">
                  DIVINE WISDOM
                </span>
                <BookOpen className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-bold font-serif-bengali text-white group-hover:text-amber-200 transition-colors">
                📖 শ্রীমদ্ভগবদ্গীতা — সম্পূর্ণ অধ্যায়
              </h3>
              <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed">
                জীবনবোধের অমূল্য শিক্ষা ও শ্রীকৃষ্ণের মুখনিঃসৃত অমৃতবাণী শুনুন।
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-sm font-bold text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>গীতা পাঠ পেজে যান</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </section>

        {/* ================= PROMINENT HOMEPAGE VIDEO SECTION (Prompt #13) ================= */}
        <section id="homepage-video" className="space-y-6">
          <div className="rounded-3xl glass-card border border-amber-500/30 p-6 sm:p-10 relative overflow-hidden gold-glow">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(220,38,38,0.18)_0%,_transparent_70%)] pointer-events-none blur-2xl" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Video Thumbnail & Play Interaction */}
              <div className="lg:col-span-7">
                <div
                  onClick={() => onNavigate('videos')}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-black/80 aspect-video shadow-[0_0_35px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.01] hover:border-amber-400"
                >
                  <img
                    src="https://img.youtube.com/vi/_65N3D5zTYg/hqdefault.jpg"
                    alt="11 স্টার ক্লাব দুর্গাপূজা লাইভ ভিডিও"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    onError={(e) => {
                      e.currentTarget.src = CLUB_INFO.images.heroDurga;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Pulsing Play Button */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-50" />
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-[0_0_30px_rgba(239,68,68,0.8)] group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 fill-black ml-1" />
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20">
                      লাইভ ভিডিও গ্যালারিতে প্রবেশ করুন
                    </span>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Flame className="w-3.5 h-3.5" /> অফিসিয়াল লাইভ ভিডিও
                    </span>
                  </div>
                </div>
              </div>

              {/* Text & Button */}
              <div className="lg:col-span-5 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-semibold border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ক্লাব ভিডিও ও লাইভ হাব</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-white leading-snug">
                  আমাদের দুর্গাপূজা ও সামাজিক উদ্যোগের ভিডিও
                </h3>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  সার্বজনীন শারদীয়া দুর্গোৎসবের লাইভ সম্প্রচার, আরতি, মণ্ডপ পরিক্রমা ও মনোজ্ঞ সাংস্কৃতিক অনুষ্ঠানের ৪টি বিশেষ লাইভ ভিডিও দেখতে ভিজিট করুন আমাদের ভিডিও গ্যালারি।
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onNavigate('videos')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Watch Videos (৪টি লাইভ ভিডিও দেখুন)</span>
                  </button>

                  <a
                    href={CLUB_INFO.youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(CLUB_INFO.youtubeChannelUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>YouTube চ্যানেল সাবস্ক্রাইব</span>
                    <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Locked Club Storage Access Section */}
        <section className="px-4 sm:px-6 lg:px-8">
          <AdminStorageAccessCard onOpenAdminStorage={onOpenAdminStorage} />
        </section>
      </div>
    </div>
  );
};
