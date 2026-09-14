import React from 'react';
import { motion } from 'motion/react';
import {
  HeartPulse,
  HandHeart,
  GraduationCap,
  Trees,
  HeartHandshake,
  ExternalLink,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { PageId } from '../types';
import { CLUB_INFO, SERVICES_LIST } from '../data/clubData';

interface SocialServicesPageProps {
  onNavigate: (page: PageId) => void;
}

export const SocialServicesPage: React.FC<SocialServicesPageProps> = ({ onNavigate }) => {
  return (
    <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-semibold">
          <HeartHandshake className="w-4 h-4 text-amber-400" />
          <span>সেবা ও মানবতার কল্যাণ</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          সামাজিক সেবা ও কল্যাণমূলক কার্যক্রম
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          11 স্টার ক্লাবের মূল লক্ষ্য হলো সমাজের পিছিয়ে পড়া ও দুস্থ মানুষদের পাশে দাঁড়ানো, অসুস্থ রোগীদের চিকিৎসা সহায়তা দেওয়া, মেধাবী ছাত্র-ছাত্রীদের স্কলারশিপ প্রদান করা এবং পরিবেশ রক্ষায় কাজ করা।
        </p>
      </motion.div>

      {/* Mandatory Verification & Guidelines Box (Preserved Authentic Rule) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-red-950/20 to-black/60 border border-amber-500/40 text-stone-200 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-amber-200">
              আবেদনকারীদের জন্য বিশেষ নির্দেশিকা ও যাচাইকরণ নীতি
            </h3>
            <p className="text-xs text-amber-300/80">আবেদনের আগে অবশ্যই মনোযোগ দিয়ে পড়ুন</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">1</span>
              <span>গুগল অ্যাকাউন্ট প্রয়োজন</span>
            </div>
            <p className="text-stone-300 text-xs">
              আবেদনপত্রটি জমা দেওয়ার জন্য আপনার একটি বৈধ Google Account (Gmail) দিয়ে লগ-ইন করা প্রয়োজন।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
              <span>সরেজমিনে নিরপেক্ষ যাচাই</span>
            </div>
            <p className="text-stone-300 text-xs">
              ফর্ম পূরণ করলেই সাহায্য নিশ্চিত নয়। আমাদের টিম তথ্য ও নথি সরাসরি পরিদর্শন করে যাচাই করবে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
              <span>নথি আপলোড বাধ্যতামূলক</span>
            </div>
            <p className="text-stone-300 text-xs">
              ডাক্তারের প্রেসক্রিপশন, আয়ের প্রমাণপত্র বা রেজাল্টের মতো প্রয়োজনীয় কাগজপত্র সঠিক ফরম্যাটে আপলোড করতে হবে।
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-gold-gradient border-b border-white/10 pb-4">
          আমাদের প্রধান সেবাসমূহ ও ফর্ম লিঙ্ক
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES_LIST.map((service, idx) => {
            const iconMap: Record<string, React.ReactNode> = {
              HeartPulse: <HeartPulse className="w-8 h-8 text-rose-400" />,
              HandHeart: <HandHeart className="w-8 h-8 text-amber-400" />,
              GraduationCap: <GraduationCap className="w-8 h-8 text-blue-400" />,
              Trees: <Trees className="w-8 h-8 text-emerald-400" />,
              Gift: <HeartHandshake className="w-8 h-8 text-yellow-400" />,
            };

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 sm:p-8 rounded-3xl glass-card border border-amber-500/30 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-amber-400 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                      {iconMap[service.icon]}
                    </div>
                    <button
                      onClick={() => onNavigate(service.id)}
                      className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                    >
                      <span>বিস্তারিত পেজ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-serif-bengali text-white group-hover:text-amber-200 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
                      {service.englishTitle}
                    </p>
                  </div>

                  <p className="text-sm text-stone-300 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Documents & Features */}
                  {service.documents && service.documents.length > 0 && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5" /> প্রয়োজনীয় কাগজপত্র:
                      </span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300">
                        {service.documents.map((doc, dIdx) => (
                          <li key={dIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Direct Action Link */}
                <div className="pt-2">
                  {service.formUrl ? (
                    <a
                      href={service.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 group/btn"
                    >
                      <span>সরাসরি Google Form-এ আবেদন করুন</span>
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>
                  ) : (
                    <button
                      onClick={() => onNavigate(service.id)}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>উদ্যোগ সম্পর্কে জানুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
