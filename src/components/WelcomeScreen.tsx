import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ZapOff, Flame } from 'lucide-react';
import { CLUB_INFO } from '../data/clubData';

interface WelcomeScreenProps {
  onComplete: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  type: 'flower' | 'sparkle' | 'petal' | 'ember';
  speed: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onComplete,
  reducedMotion,
  onToggleReducedMotion,
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [interactiveFlowers, setInteractiveFlowers] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize authentic festive temple bell & sacred Dhaak sound using Web Audio API
  const playSacredSound = useCallback((type: 'bell' | 'dhaak' | 'shanku' | 'chord') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === 'bell') {
        // High resonance bronze temple bell (কাঁসর ঘণ্টা)
        const freqs = [1046.5, 1318.5, 2093, 2637];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          
          gain.gain.setValueAtTime(0.08 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.5);
        });
      } else if (type === 'dhaak') {
        // Authentic festive Dhaak beat pattern (ধা কুড় কুড় ধা)
        const hitTimes = [0, 0.12, 0.22, 0.35, 0.5];
        const pitchMods = [140, 220, 200, 150, 130];
        
        hitTimes.forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(pitchMods[i], now + t);
          osc.frequency.exponentialRampToValueAtTime(45, now + t + 0.15);

          gain.gain.setValueAtTime(0.12, now + t);
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + t);
          osc.stop(now + t + 0.2);
        });
      } else if (type === 'shanku') {
        // Resonant mystical Conch / Om drone tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(246.94, now + 1.2);
        osc.frequency.linearRampToValueAtTime(220, now + 2.5);

        // Lowpass filter for warm acoustic sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.2);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Generate floating Shiuli blossoms and golden dust particles
  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 32 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: i % 4 === 0 ? 18 : i % 2 === 0 ? 8 : 4,
      rotation: Math.random() * 360,
      type: i % 5 === 0 ? 'flower' : i % 3 === 0 ? 'petal' : i % 2 === 0 ? 'sparkle' : 'ember',
      speed: 1.5 + Math.random() * 2.5,
    }));
    setParticles(newParticles);
  }, []);

  // Cinematic timeline stages
  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const timers = [
      setTimeout(() => {
        setPhase(1); // Sacred Dawn & Autumn Sky
      }, 400),
      setTimeout(() => {
        setPhase(2); // Conch tone & Expanding Sacred Mandala
      }, 1300),
      setTimeout(() => {
        setPhase(3); // Third Eye Awakening & Divine Maa Durga Icon reveal
      }, 2300),
      setTimeout(() => {
        setPhase(4); // Golden Typography, Sloka & Club Title reveal
      }, 3400),
      setTimeout(() => {
        setPhase(5); // Interactive Call to Action and golden celebration
      }, 4400),
      setTimeout(() => {
        onComplete(); // Smooth transition to main website
      }, 7200),
    ];

    return () => {
      timers.forEach(clearTimeout);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [reducedMotion, onComplete]);

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFlower = { id: Date.now(), x, y };
    setInteractiveFlowers((prev) => [...prev.slice(-8), newFlower]);
    playSacredSound('bell');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playSacredSound('shanku');
      setTimeout(() => playSacredSound('dhaak'), 600);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onClick={handleScreenClick}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060206] text-[#fbf7ed] overflow-hidden select-none cursor-pointer"
      title="স্ক্রিনে ক্লিক করে ফুল ও ঘণ্টার ধ্বনি অর্পণ করুন"
    >
      {/* Dynamic Autumn Twilight to Golden Dawn Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2b1008_0%,_#160810_45%,_#050106_100%)] pointer-events-none" />

      {/* Swaying Autumn Kash Phul (শরতের কাশফুল) Silhouettes on Horizon */}
      <div className="absolute bottom-0 left-0 right-0 h-36 sm:h-52 pointer-events-none opacity-20 overflow-hidden flex justify-between items-end">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: [i % 2 === 0 ? -6 : 6, i % 2 === 0 ? 6 : -6],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
            className="w-10 sm:w-16 h-36 sm:h-56 origin-bottom transform"
            style={{ marginLeft: `${(i - 1) * 2}%` }}
          >
            <svg viewBox="0 0 40 160" className="w-full h-full text-amber-200 fill-current opacity-60">
              <path d="M20,160 Q18,90 20,40 Q22,10 20,0 Q17,20 18,50 Q16,90 20,160 Z" />
              <path d="M20,60 Q28,45 32,30 Q24,48 20,70" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M20,80 Q10,65 6,50 Q14,68 20,90" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M20,100 Q30,85 36,70 Q26,88 20,110" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M20,120 Q8,105 4,90 Q12,108 20,130" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Grand Rotating Sacred Sun Mandala with Concentric Rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
        animate={{
          opacity: phase >= 1 ? 0.38 : 0,
          scale: phase >= 3 ? 1.05 : 0.85,
          rotate: 360,
        }}
        transition={{
          opacity: { duration: 1.5 },
          scale: { duration: 2.5, ease: 'easeOut' },
          rotate: { duration: 80, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute w-[680px] h-[680px] sm:w-[980px] sm:h-[980px] pointer-events-none"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full text-amber-400/25">
          <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 3" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 2" />
          <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {[...Array(24)].map((_, i) => (
            <g key={i} transform={`rotate(${i * 15} 100 100)`}>
              <path
                d="M100,20 C108,45 108,65 100,75 C92,65 92,45 100,20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
              />
              <circle cx="100" cy="18" r="1.5" fill="currentColor" />
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Pulsating Fiery Divine Aura */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase >= 2 ? [0.45, 0.75, 0.5] : 0,
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.3)_0%,_rgba(239,68,68,0.18)_40%,_transparent_70%)] pointer-events-none blur-3xl"
      />

      {/* Floating Shiuli Flowers, Golden Sparks & Embers - Smooth Continuous Motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}vw`,
              y: `${p.y}vh`,
              opacity: 0,
              rotate: p.rotation,
            }}
            animate={{
              opacity: [0.2, 0.85, 0.2],
              y: [`${p.y}vh`, `${(p.y + 35) % 105}vh`],
              x: [`${p.x}vw`, `${p.x + (p.id % 2 === 0 ? 3 : -3)}vw`],
              rotate: p.rotation + 360,
            }}
            transition={{
              duration: 7 + p.speed,
              repeat: Infinity,
              ease: 'linear',
              delay: (p.id * 0.12) % 2,
            }}
            className="absolute"
          >
            {p.type === 'flower' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                <circle cx="12" cy="12" r="3" fill="#ea580c" />
                <path d="M12,2 Q14,8 12,9 Q10,8 12,2 Z" fill="#ffffff" />
                <path d="M12,22 Q14,16 12,15 Q10,16 12,22 Z" fill="#ffffff" />
                <path d="M2,12 Q8,14 9,12 Q8,10 2,12 Z" fill="#ffffff" />
                <path d="M22,12 Q16,14 15,12 Q16,10 22,12 Z" fill="#ffffff" />
                <path d="M5,5 Q10,9 10,10 Q9,10 5,5 Z" fill="#ffffff" />
                <path d="M19,19 Q14,15 14,14 Q15,14 19,19 Z" fill="#ffffff" />
                <path d="M5,19 Q9,14 10,14 Q10,15 5,19 Z" fill="#ffffff" />
                <path d="M19,5 Q15,10 14,10 Q14,9 19,5 Z" fill="#ffffff" />
              </svg>
            ) : p.type === 'petal' ? (
              <div className="w-2.5 h-3.5 bg-gradient-to-tr from-amber-400 to-red-400 rounded-full opacity-80 shadow-[0_0_8px_#f59e0b]" />
            ) : (
              <div
                className="rounded-full bg-gradient-to-r from-amber-200 to-yellow-300 shadow-[0_0_10px_#fbbf24]"
                style={{ width: `${p.size}px`, height: `${p.size}px` }}
              />
            )}
          </motion.div>
        ))}

        {/* Interactive Click Ripple Lotus Bursts */}
        <AnimatePresence>
          {interactiveFlowers.map((f) => (
            <motion.div
              key={f.id}
              initial={{ x: f.x, y: f.y, scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full border border-amber-400 flex items-center justify-center shadow-[0_0_30px_#fbbf24]">
                <Sparkles className="w-8 h-8 text-amber-300 animate-spin" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Center Cinematic Content - Stable Layout without shifts */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto">
        {/* Festive Welcome Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -10 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 border border-amber-500/50 backdrop-blur-md mb-3 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-bold text-amber-200 tracking-wider font-serif-bengali">
            শারদীয়া দুর্গোৎসব ২০২৬ • শুভ আগমনী
          </span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        </motion.div>

        {/* The Masterpiece Maa Durga Icon */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{
            scale: phase >= 2 ? 1 : 0.94,
            opacity: phase >= 2 ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative my-2 sm:my-3"
        >
          {/* Continuous, Glitch-Free Expanding Divine Borders */}
          <div
            className={`absolute -inset-2.5 rounded-[34px] border-2 border-amber-400/65 pointer-events-none transition-opacity duration-700 ${
              phase >= 2 ? 'opacity-100 animate-icon-ring-1' : 'opacity-0'
            }`}
          />
          <div
            className={`absolute -inset-2.5 rounded-[34px] border border-amber-300/45 pointer-events-none transition-opacity duration-700 ${
              phase >= 2 ? 'opacity-100 animate-icon-ring-2' : 'opacity-0'
            }`}
          />

          {/* Glowing Master Icon Container */}
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-[28px] p-1.5 bg-gradient-to-br from-amber-300 via-amber-600 to-red-900 border-2 border-amber-300/90 shadow-[0_0_50px_rgba(245,158,11,0.55),_0_0_90px_rgba(220,38,38,0.35)] overflow-hidden flex items-center justify-center">
            <img
              src="/icon.png"
              alt="Maa Durga Icon"
              className="w-full h-full object-cover rounded-[22px]"
            />
          </div>

          {/* Divine Callout: "মা আসছেন" */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-black font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.7)] border border-yellow-200 flex items-center gap-1.5 whitespace-nowrap">
            <Flame className="w-3 h-3 text-yellow-100 fill-current" />
            <span className="tracking-wider font-serif-bengali">মা আসছেন</span>
            <Flame className="w-3 h-3 text-yellow-100 fill-current" />
          </div>
        </motion.div>

        {/* Club Heading & Divine Typography */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 12 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-1 mt-3"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-serif-bengali bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)]">
            {CLUB_INFO.nameBn}
          </h1>
        </motion.div>

        {/* Sacred Festive Mantra & Blessing Sloka */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 10 }}
          transition={{ duration: 0.7 }}
          className="mt-3 space-y-1.5 max-w-xl"
        >
          <div className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-red-600/20 to-amber-500/20 border border-amber-400/30 text-amber-100 text-xs sm:text-sm font-medium shadow-[0_0_20px_rgba(245,158,11,0.2)] backdrop-blur-md">
            {CLUB_INFO.tagline}
          </div>

          <p className="text-xs sm:text-sm text-amber-200/90 font-serif-bengali tracking-wide italic drop-shadow-sm">
            "সর্বমঙ্গল মঙ্গল্যে শিবে সর্বার্থ সাধিকে, শরণ্যে ত্র্যম্বকে গৌরি নারায়ণি নমোহস্তুতে"
          </p>
        </motion.div>

        {/* Festive Golden Timeline Loading Bar */}
        <div className="w-56 sm:w-72 h-1.5 bg-white/10 rounded-full mt-5 overflow-hidden relative border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6.8, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-red-500 rounded-full shadow-[0_0_20px_#f59e0b]"
          />
        </div>
      </div>

      {/* Floating Bottom Entry Button & Motion Settings */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleReducedMotion();
          }}
          title="অ্যানিমেশন নিয়ন্ত্রণ"
          className="px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/90 border border-white/15 text-xs text-stone-300 transition-all flex items-center gap-2 backdrop-blur-md"
        >
          <ZapOff className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">
            {reducedMotion ? 'সাধারণ মোড' : 'কম অ্যানিমেশন'}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            playSacredSound('bell');
            onComplete();
          }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-xs sm:text-sm font-black text-black transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 border border-yellow-100"
        >
          <span>মণ্ডপে প্রবেশ করুন</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </motion.div>
  );
};
