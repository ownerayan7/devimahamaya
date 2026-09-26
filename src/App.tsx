import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageId } from './types';
import { ParticleBackground } from './components/ParticleBackground';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminInboxModal } from './components/AdminInboxModal';
import { AdminClubStorageModal } from './components/AdminClubStorageModal';
import { InstallAppModal } from './components/InstallAppModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GlobalMediaPlayer } from './components/GlobalMediaPlayer';

// Pages
import { HomePage } from './pages/HomePage';
import { DurgaPujaPage } from './pages/DurgaPujaPage';
import { DeviAiPage } from './pages/DeviAiPage';
import { SocialServicesPage } from './pages/SocialServicesPage';
import { MedicalAssistancePage } from './pages/MedicalAssistancePage';
import { HelpForNeedyPage } from './pages/HelpForNeedyPage';
import { ScholarshipPage } from './pages/ScholarshipPage';
import { TreePlantationPage } from './pages/TreePlantationPage';
import { DonatePage } from './pages/DonatePage';
import { VideosPage } from './pages/VideosPage';
import { MahalayaPage } from './pages/MahalayaPage';
import { RadioPage } from './pages/RadioPage';
import { BhagavadGitaPage } from './pages/BhagavadGitaPage';
import { SundayPrayerPage } from './pages/SundayPrayerPage';
import { RabindraSangeetPage } from './pages/RabindraSangeetPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdminDatabasePage } from './pages/AdminDatabasePage';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { ArrowUp, MapPin, MessageSquare, ShieldCheck, Mail, WifiOff } from 'lucide-react';
import { CLUB_INFO } from './data/clubData';
import { db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { dispatchNativePushNotification, getStoredNotificationSettings, checkSundayPrayerLeadReminder } from './utils/notificationHelper';

export function App() {
  const [welcomeComplete, setWelcomeComplete] = useState<boolean>(false);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('11starclub_reduced_motion') === 'true';
  });

  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAdminInboxOpen, setIsAdminInboxOpen] = useState(false);
  const [isAdminStorageOpen, setIsAdminStorageOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background Lock Screen Notification listener for new alerts via Firestore
  useEffect(() => {
    // Check prayer advance reminder immediately and every 30 seconds
    checkSundayPrayerLeadReminder();
    const timer = setInterval(() => {
      checkSundayPrayerLeadReminder();
    }, 30000);

    let initialLoad = true;
    try {
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (initialLoad) {
          initialLoad = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const settings = getStoredNotificationSettings();
            if (settings.enabled) {
              dispatchNativePushNotification(
                data.title || 'বিজ্ঞপ্তি',
                data.message || '11 স্টার ক্লাব থেকে নতুন বার্তা এসেছে।',
                settings.soundEnabled,
                data.linkPage || 'prayer'
              );
            }
          }
        });
      }, (err) => {
        console.warn('Firestore notification listener warning:', err);
      });
      return () => {
        clearInterval(timer);
        unsubscribe();
      };
    } catch (e) {
      console.warn('Notification sync fallback:', e);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWelcomeComplete = () => {
    setWelcomeComplete(true);
  };

  const handleReplayWelcome = () => {
    setWelcomeComplete(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleReducedMotion = () => {
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem('11starclub_reduced_motion', String(next));
      return next;
    });
  };

  const handleNavigate = (page: PageId) => {
    if (page === 'settings') {
      setIsNotificationModalOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onReplayWelcome={handleReplayWelcome}
            onOpenAdminStorage={() => setIsAdminStorageOpen(true)}
          />
        );
      case 'durga-puja':
        return <DurgaPujaPage onOpenAdminStorage={() => setIsAdminStorageOpen(true)} />;
      case 'devi-ai':
        return <DeviAiPage onNavigate={handleNavigate} />;
      case 'prayer':
        return <SundayPrayerPage />;
      case 'rabindra-sangeet':
        return <RabindraSangeetPage />;
      case 'social-services':
        return <SocialServicesPage onNavigate={handleNavigate} />;
      case 'medical':
        return <MedicalAssistancePage />;
      case 'needy':
        return <HelpForNeedyPage />;
      case 'scholarship':
        return <ScholarshipPage />;
      case 'tree-plantation':
        return <TreePlantationPage />;
      case 'donate':
        return <DonatePage />;
      case 'videos':
        return <VideosPage onOpenAdminStorage={() => setIsAdminStorageOpen(true)} />;
      case 'mahalaya':
        return <MahalayaPage />;
      case 'radio':
        return <RadioPage />;
      case 'gita':
        return <BhagavadGitaPage />;
      case 'shopping':
        return <ShoppingPage />;
      case 'contact':
        return <ContactPage onOpenAdminInbox={() => setIsAdminInboxOpen(true)} />;
      case 'about':
        return <AboutPage />;
      case 'gallery':
        return <GalleryPage onOpenAdminStorage={() => setIsAdminStorageOpen(true)} />;
      case 'admin-db':
        return <AdminDatabasePage />;
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onReplayWelcome={handleReplayWelcome}
            onOpenAdminStorage={() => setIsAdminStorageOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070507] text-[#fbf7ed] flex flex-col relative selection:bg-amber-500 selection:text-black font-bengali">
      {/* Particle Atmosphere Background */}
      <ParticleBackground reducedMotion={reducedMotion} />

      {/* Full-screen Opening / Welcome Animation on First Load */}
      <AnimatePresence>
        {!welcomeComplete && (
          <WelcomeScreen
            onComplete={handleWelcomeComplete}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={handleToggleReducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Offline Mode Alert Bar */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500 text-stone-950 font-bold px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 z-50 sticky top-0 shadow-md border-b border-amber-400 font-bengali"
          >
            <WifiOff className="w-4 h-4 text-stone-950 animate-pulse" />
            <span>অফলাইন মোড সক্রিয় — পূর্বে সংরক্ষিত ক্যাশ ও অফলাইন ডেটা দেখা যাচ্ছে।</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Layout once Welcome is cleared */}
      <div className="flex-1 flex flex-col relative z-10">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={handleToggleReducedMotion}
          onOpenAdminInbox={() => setIsAdminInboxOpen(true)}
          onOpenAdminStorage={() => setIsAdminStorageOpen(true)}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
          onReplayWelcome={handleReplayWelcome}
        />

        <main className="flex-1 pt-28 sm:pt-32 md:pt-36">
          {/* Bhagavad Gita Persistent Container (Stays in DOM so audio is never interrupted) */}
          <div className={currentPage === 'gita' ? 'block' : 'opacity-0 pointer-events-none fixed -top-[99999px] left-0 w-0 h-0 overflow-hidden'}>
            <BhagavadGitaPage />
          </div>

          {/* Other Pages */}
          {currentPage !== 'gita' && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {renderCurrentPage()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* Footer on all pages */}
        <Footer onNavigate={handleNavigate} onReplayWelcome={handleReplayWelcome} />
      </div>

      {/* Persistent Admin Inbox Modal */}
      <AdminInboxModal
        isOpen={isAdminInboxOpen}
        onClose={() => setIsAdminInboxOpen(false)}
      />

      {/* Admin Locked Club Data Storage Modal */}
      <AdminClubStorageModal
        isOpen={isAdminStorageOpen}
        onClose={() => setIsAdminStorageOpen(false)}
      />

      {/* Install App Guidance Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Club Notification & Prayer Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onNavigate={handleNavigate}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
      />

      {/* Global Admin Login Modal */}
      <AdminLoginModal />

      {/* Global Persistent Gita & Background Audio-Video Player */}
      <GlobalMediaPlayer
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Floating Quick Action Buttons on Bottom Right */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2.5 items-end">
        {/* Floating WhatsApp Community Shortcut */}
        <a
          href={CLUB_INFO.whatsappChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full bg-[#25D366] text-white shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 transition-transform active:scale-95 flex items-center justify-center"
          title="WhatsApp চ্যানেলে যুক্ত হন"
        >
          <MessageSquare className="w-5 h-5 fill-white" />
        </a>

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="p-3 rounded-full bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-500/40 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="উপরে স্ক্রল করুন"
            id="scroll-top-btn"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default App;
