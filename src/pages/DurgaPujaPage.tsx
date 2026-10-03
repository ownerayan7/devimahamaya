import React, { useState, useEffect } from 'react';
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
  Plus,
  Radio,
  Video,
  Facebook,
  Instagram,
  Folder,
  Trash2,
  Globe,
  RadioTower,
  PlayCircle
} from 'lucide-react';
import { PUJA_SCHEDULE_2026, CLUB_INFO, ANNOUNCEMENTS } from '../data/clubData';
import { ImageLightbox } from '../components/ImageLightbox';
import { AdminStorageAccessCard } from '../components/AdminStorageAccessCard';
import { AddPorboLinkModal } from '../components/AddPorboLinkModal';
import { DeletePorboLinkModal } from '../components/DeletePorboLinkModal';
import { PorboLinkItem } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { markItemGloballyDeleted, isDeleted } from '../utils/persistentStorage';

interface DurgaPujaPageProps {
  onOpenAdminStorage?: () => void;
}

export const DurgaPujaPage: React.FC<DurgaPujaPageProps> = ({ onOpenAdminStorage }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [porboLinks, setPorboLinks] = useState<PorboLinkItem[]>([]);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [selectedPorboForModal, setSelectedPorboForModal] = useState<number>(0);

  // State for delete modal
  const [deletingLink, setDeletingLink] = useState<PorboLinkItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Subscribe to real-time Porbo Links from Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'durgapujo_porbo_links'));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const linksData: PorboLinkItem[] = [];
          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const itemId = docSnapshot.id;
            if (!isDeleted(itemId)) {
              linksData.push({
                ...data,
                id: itemId,
              } as PorboLinkItem);
            }
          });
          setPorboLinks(linksData);
        },
        (error) => {
          console.warn('Porbo links Firestore subscription warning:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore fallback setup warning:', err);
    }

    const handleGlobalDeleteEvent = () => {
      setPorboLinks((prev) => prev.filter((item) => !isDeleted(item.id)));
    };
    window.addEventListener('global_item_deleted', handleGlobalDeleteEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('global_item_deleted', handleGlobalDeleteEvent);
    };
  }, []);

  const handleOpenAddLink = (porboIdx: number) => {
    setSelectedPorboForModal(porboIdx);
    setIsAddLinkModalOpen(true);
  };

  const handleSavePorboLink = async (linkData: Omit<PorboLinkItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'durgapujo_porbo_links'), linkData);
    } catch (err: any) {
      console.error('Error saving Porbo link to Firestore:', err);
      throw new Error(err?.message || 'Firestore connection failed');
    }
  };

  const handleConfirmDeleteLink = async (linkId: string) => {
    if (!linkId) {
      alert('ত্রুটি: লিঙ্কের সঠিক আইডি পাওয়া যায়নি!');
      return;
    }

    try {
      // Optimistic instant UI update
      setPorboLinks((prev) => prev.filter((item) => item.id !== linkId));
      await markItemGloballyDeleted(linkId, 'durgapujo_porbo_links');
    } catch (err: any) {
      console.error('Error deleting link from Firestore:', err);
      throw err;
    }
  };

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case 'live':
        return <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />;
      case 'youtube':
        return <Video className="w-3.5 h-3.5 text-red-400" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5 text-blue-400" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
      case 'gdrive':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <ExternalLink className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const renderCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'live':
        return 'bg-red-600/30 border-red-500/50 text-red-200 hover:bg-red-600/50';
      case 'youtube':
        return 'bg-red-700/20 border-red-500/40 text-red-300 hover:bg-red-700/40';
      case 'facebook':
        return 'bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/40';
      case 'instagram':
        return 'bg-pink-600/20 border-pink-500/40 text-pink-300 hover:bg-pink-600/40';
      case 'gdrive':
        return 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/40';
      default:
        return 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/40';
    }
  };

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
          <span>শারদীয়া দুর্গোৎসব ২০২৬ • ১১ স্টার ক্লাব</span>
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif-bengali text-gold-gradient drop-shadow-lg">
          শারদীয়া দুর্গাপূজা ২০২৬ — সময়সূচী ও সরাসরি লাইভ পোর্টাল
        </h1>

        <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
          11 স্টার ক্লাবের পক্ষ থেকে সকল ভক্ত ও শুভানুধ্যায়ীদের জানাই শারদীয়া দুর্গোৎসবের প্রীতি ও শুভেচ্ছা। প্রতিটি পর্বের (খুঁটি পূজা, মহালয়া, ষষ্ঠী থেকে বিজয়া দশমী) সরাসরি লাইভ স্ট্রিমিং ও সোশ্যাল মিডিয়া লিঙ্ক নিচে প্রকাশ করা রয়েছে।
        </p>

        {/* Global Admin Link Add Action Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleOpenAddLink(0)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-yellow-200 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ পর্বভিত্তিক লাইভ ও সোশ্যাল লিঙ্ক যুক্ত করুন (Admin)</span>
          </button>
        </div>
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

      {/* Puja 2026 Full Day-by-Day Schedule & Porbo Link Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Calendar className="w-4 h-4" />
            <span>পর্বভিত্তিক অনুষ্ঠান ও সরাসরি সম্প্রচার</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif-bengali text-gold-gradient">
            পূজার প্রতিটি পর্বের সময়সূচী ও ডাইরেক্ট লিঙ্ক
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
            যে পর্বের লাইভ চলছে সরাসরি ক্লিক করে দেখুন। লাইভ শেষে ওই পর্বের ইউটিউব, ফেসবুক, ইনস্টাগ্রাম ও গুগল ড্রাইবের সব ভিডিও ও অ্যালবামের লিঙ্ক নিচে সরাসরি পাবেন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PUJA_SCHEDULE_2026.map((item, idx) => {
            const linksForPorbo = porboLinks.filter((l) => Number(l.porboIndex) === idx);
            const activeLiveLink = linksForPorbo.find((l) => l.category === 'live' && l.isLiveActive);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`rounded-3xl p-6 glass-card glass-card-hover border relative overflow-hidden flex flex-col justify-between space-y-5 ${
                  activeLiveLink
                    ? 'border-red-500 bg-gradient-to-b from-[#2e090c]/90 via-[#180507]/95 to-black shadow-[0_0_35px_rgba(239,68,68,0.4)]'
                    : item.highlight
                    ? 'border-amber-500/40 bg-gradient-to-b from-[#22100a]/80 to-[#120708]/90 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : 'border-white/10 bg-black/40'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      পর্ব 0{idx + 1}
                    </span>
                    {activeLiveLink ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-600 text-white border border-red-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>🔴 লাইভ চলছে</span>
                      </span>
                    ) : (
                      item.highlight && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/40 text-red-200 border border-red-500/40">
                          মহাপর্ব
                        </span>
                      )
                    )}
                  </div>

                  {/* Title & Dates */}
                  <div>
                    <h3 className="text-xl font-bold font-serif-bengali text-white">
                      {item.event}
                    </h3>

                    <div className="space-y-1 text-xs mt-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>বাংলা: {item.dateBengali}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>ইংরেজি: {item.dateEnglish}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed pt-2 border-t border-white/10">
                    {item.description}
                  </p>

                  {/* Active Live Direct Watch Banner */}
                  {activeLiveLink && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.5)] space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-red-200">
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-red-400 animate-ping" />
                          <span>🔴 সরাসরি লাইভ টেলিকাস্ট চলছে</span>
                        </div>
                      </div>
                      <p className="text-xs text-white font-medium line-clamp-1">{activeLiveLink.title}</p>
                      <a
                        href={activeLiveLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] border border-red-300"
                      >
                        <PlayCircle className="w-4 h-4 fill-current text-white animate-bounce" />
                        <span>এক ক্লিকে সরাসরি লাইভ দেখুন</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Links Section for this Porbo */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                      <span className="flex items-center gap-1">
                        <RadioTower className="w-3.5 h-3.5 text-amber-400" />
                        <span>সরাসরি লিঙ্ক ও অফিশিয়াল মিডিয়া ({linksForPorbo.length})</span>
                      </span>
                    </div>

                    {linksForPorbo.length > 0 ? (
                      <div className="space-y-2">
                        {linksForPorbo.map((link) => (
                          <div
                            key={link.id}
                            className="p-2.5 rounded-xl bg-black/60 border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between gap-2 group"
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 min-w-0 flex-1 hover:text-amber-300 text-xs font-semibold text-stone-200"
                            >
                              <span className={`p-1.5 rounded-lg border shrink-0 ${renderCategoryBadgeColor(link.category)}`}>
                                {renderCategoryIcon(link.category)}
                              </span>
                              <span className="truncate">{link.title}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400 shrink-0 opacity-75 group-hover:opacity-100" />
                            </a>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeletingLink(link);
                                setIsDeleteModalOpen(true);
                              }}
                              title="লিঙ্ক মুছুন (Admin)"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-[11px] text-stone-400 text-center italic">
                        এখনও কোনো লিঙ্ক যুক্ত করা হয়নি।
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action: Admin Add Link Button for this specific Porbo */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[11px] text-amber-400/80 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>11 স্টার ক্লাব</span>
                  </div>

                  <button
                    onClick={() => handleOpenAddLink(idx)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-200 font-bold text-[11px] flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>লিঙ্ক যুক্ত করুন</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
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
              onClick={(e) => {
                e.preventDefault();
                window.open(CLUB_INFO.whatsappChannelUrl, '_blank', 'noopener,noreferrer');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>WhatsApp চ্যানেলে নোটিফিকেশন পান</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={CLUB_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                window.open(CLUB_INFO.googleMapsUrl, '_blank', 'noopener,noreferrer');
              }}
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

      {/* Modal for Admin Adding Links */}
      <AddPorboLinkModal
        isOpen={isAddLinkModalOpen}
        onClose={() => setIsAddLinkModalOpen(false)}
        initialPorboIndex={selectedPorboForModal}
        onSaveLink={handleSavePorboLink}
      />

      {/* Modal for Admin Deleting Links */}
      <DeletePorboLinkModal
        isOpen={isDeleteModalOpen}
        linkToDelete={deletingLink}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLink(null);
        }}
        onConfirmDelete={handleConfirmDeleteLink}
      />

      {/* Admin Locked Club Storage Access */}
      <div className="pt-8">
        <AdminStorageAccessCard onOpenAdminStorage={onOpenAdminStorage} />
      </div>
    </div>
  );
};
