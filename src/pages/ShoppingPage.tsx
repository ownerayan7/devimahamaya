import React from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Tag,
  Percent,
  Truck,
  ShieldCheck,
  Search,
  Gift,
  Shirt
} from 'lucide-react';
import { SHOPPING_PLATFORMS } from '../data/clubData';

export const ShoppingPage: React.FC = () => {
  const categories = [
    { title: 'পূজার শাড়ি ও লেহেঙ্গা', desc: 'সিল্ক, জামদানি, তসর ও কাঞ্জীভরম শাড়ি', icon: '🥻' },
    { title: 'ছেলেদের কুর্তা ও পাঞ্জাবি', desc: 'ট্রেন্ডি এথনিক ও ফেস্টিভ্যাল কালেকশন', icon: '👔' },
    { title: 'বাচ্চাদের নতুন পোশাক', desc: 'উৎসবের রঙিন জামা ও ড্রেস', icon: '🧸' },
    { title: 'পূজা সামগ্রী ও ঘরসজ্জা', desc: 'প্রদীপ, ধুনুচি, আলোকসজ্জা ও রঙ্গোলি', icon: '🪔' },
    { title: 'ইলেকট্রনিক্স ও গ্যাজেটস', desc: 'স্মার্টফোন, হেডফোন ও স্পিকার অফার', icon: '📱' },
    { title: 'মিষ্টি ও উপহার বক্স', desc: 'উৎসবের শুভেচ্ছা উপহার ও চকোলেট', icon: '🎁' },
  ];

  return (
    <div className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>শারদীয়া পুজো শপিং হাব</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient">
          Online Shopping — পুজো স্পেশাল কেনাকাটা
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          শারদীয়া দুর্গোৎসব উপলক্ষ্যে ভারতের শীর্ষস্থানীয় ৩টি অনলাইন শপিং প্ল্যাটফর্মে সেরা অফার, পোশাক ও উৎসবের প্রয়োজনীয় সামগ্রীর কেনাকাটা করুন সরাসরি।
        </p>
      </motion.div>

      {/* 3 Main Shopping Cards: Flipkart, Amazon, Meesho */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SHOPPING_PLATFORMS.map((store, idx) => {
          const bgGradients = [
            'from-[#0c224b]/90 via-[#071329]/95 to-[#040a17]/95 border-blue-500/40 shadow-[0_0_30px_rgba(40,116,240,0.2)]',
            'from-[#3d2105]/90 via-[#241303]/95 to-[#120901]/95 border-amber-500/40 shadow-[0_0_30px_rgba(255,153,0,0.2)]',
            'from-[#3d0826]/90 via-[#230415]/95 to-[#11020a]/95 border-pink-500/40 shadow-[0_0_30px_rgba(244,51,151,0.2)]',
          ];

          const buttonStyles = [
            'bg-[#2874f0] hover:bg-[#1a5bc7] text-white shadow-[0_0_20px_rgba(40,116,240,0.4)]',
            'bg-[#ff9900] hover:bg-[#e08600] text-black shadow-[0_0_20px_rgba(255,153,0,0.4)]',
            'bg-[#f43397] hover:bg-[#d61e7e] text-white shadow-[0_0_20px_rgba(244,51,151,0.4)]',
          ];

          return (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-b ${bgGradients[idx]} border flex flex-col justify-between space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              {/* Top Badge */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-stone-200 border border-white/10">
                    {store.badge}
                  </span>
                  <Tag className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-cinzel-title">
                    {store.name}
                  </h3>
                  <p className="text-sm font-bold text-amber-300 font-serif-bengali">
                    {store.bengaliName}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {store.description}
                </p>

                {/* Features List */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  {store.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-stone-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Link Button */}
              <div className="pt-2">
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${buttonStyles[idx]} group/btn`}
                >
                  <span>{store.name}-এ কেনাকাটা করুন</span>
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Puja Shopping Categories Guide */}
      <section className="rounded-3xl glass-card border border-amber-500/30 p-6 sm:p-10 space-y-8 gold-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-bengali text-gold-gradient">
              জনপ্রিয় পূজার কেনাকাটার ক্যাটাগরি
            </h2>
            <p className="text-xs sm:text-sm text-stone-300">উৎসবের প্রয়োজনীয় যাবতীয় পণ্য</p>
          </div>
          <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
            ✨ Festive Collections
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/40 transition-colors flex items-start gap-3.5 group"
            >
              <div className="text-3xl p-2 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold font-serif-bengali text-white group-hover:text-amber-200 transition-colors">
                  {cat.title}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shopping Safety & Official Links Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
        <p>
          অফিসিয়াল লিঙ্কগুলির মাধ্যমে আপনি সরাসরি Flipkart, Amazon এবং Meesho-র আসল ওয়েবসাইটে প্রবেশ করবেন। উৎসবের কেনাকাটার সময় ডিসকাউন্ট ও অফার শর্তাবলী যাচাই করে অর্ডার করুন।
        </p>
      </div>
    </div>
  );
};
