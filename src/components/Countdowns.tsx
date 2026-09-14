import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Moon, Flame, Sparkles, Clock, Calendar } from 'lucide-react';
import { MAHALAYA_DATE_2026, DURGA_PUJA_DATE_2026 } from '../data/clubData';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
}

// Convert English digits to Bengali digits
const toBengaliNumber = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .padStart(2, '0')
    .split('')
    .map((d) => bnDigits[parseInt(d, 10)] || d)
    .join('');
};

const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isCompleted: false,
  };
};

export const Countdowns: React.FC<{ onNavigateToMahalaya?: () => void; onNavigateToPuja?: () => void }> = ({
  onNavigateToMahalaya,
  onNavigateToPuja,
}) => {
  const [mahalayaTime, setMahalayaTime] = useState<TimeLeft>(() => calculateTimeLeft(MAHALAYA_DATE_2026));
  const [pujaTime, setPujaTime] = useState<TimeLeft>(() => calculateTimeLeft(DURGA_PUJA_DATE_2026));

  useEffect(() => {
    const timer = setInterval(() => {
      setMahalayaTime(calculateTimeLeft(MAHALAYA_DATE_2026));
      setPujaTime(calculateTimeLeft(DURGA_PUJA_DATE_2026));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderTimerCard = (
    titleBn: string,
    subtitleBn: string,
    timeLeft: TimeLeft,
    targetDateStr: string,
    icon: React.ReactNode,
    theme: 'mahalaya' | 'puja',
    celebrationText: string,
    onClick?: () => void
  ) => {
    const isMahalaya = theme === 'mahalaya';
    const borderGlow = isMahalaya
      ? 'border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.15)]'
      : 'border-amber-500/30 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)]';

    const bgGradient = isMahalaya
      ? 'bg-gradient-to-b from-[#0b1329]/80 via-[#070b18]/90 to-[#04060c]/90'
      : 'bg-gradient-to-b from-[#241108]/80 via-[#160a08]/90 to-[#0c0505]/90';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl ${bgGradient} p-5 sm:p-6 border ${borderGlow} backdrop-blur-xl transition-all ${
          onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
        }`}
      >
        {/* Decorative Top Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isMahalaya ? 'from-cyan-400 via-sky-300 to-indigo-500' : 'from-amber-400 via-yellow-300 to-red-500'
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                isMahalaya
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif-bengali text-white flex items-center gap-1.5">
                {titleBn}
              </h3>
              <p className="text-xs text-stone-300/80 font-medium">{subtitleBn}</p>
            </div>
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              isMahalaya
                ? 'bg-cyan-950/60 text-cyan-200 border-cyan-500/30'
                : 'bg-amber-950/60 text-amber-200 border-amber-500/30'
            }`}
          >
            {targetDateStr}
          </span>
        </div>

        {/* Countdown Units or Celebration State */}
        {timeLeft.isCompleted ? (
          <div className="py-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-2xl sm:text-3xl font-bold font-serif-bengali text-gold-gradient"
            >
              {celebrationText}
            </motion.div>
            <p className="text-xs text-amber-200/80 mt-1">পূজার আনন্দে সকলকে জানাই আন্তরিক শুভকামনা</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 my-3">
            {[
              { label: 'দিন', subLabel: 'DAYS', value: timeLeft.days },
              { label: 'ঘণ্টা', subLabel: 'HOURS', value: timeLeft.hours },
              { label: 'মিনিট', subLabel: 'MINS', value: timeLeft.minutes },
              { label: 'সেকেন্ড', subLabel: 'SECS', value: timeLeft.seconds, isSeconds: true },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-black/45 border border-white/10 relative overflow-hidden group shadow-inner"
              >
                {/* Subtle pulse animation for seconds */}
                {unit.isSeconds && (
                  <div
                    className={`absolute inset-0 opacity-10 animate-pulse pointer-events-none ${
                      isMahalaya ? 'bg-cyan-400' : 'bg-amber-400'
                    }`}
                  />
                )}

                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-serif-bengali text-white flex items-baseline gap-0.5">
                  <span>{toBengaliNumber(unit.value)}</span>
                  <span className="text-[10px] text-stone-400 font-sans hidden sm:inline">
                    ({unit.value.toString().padStart(2, '0')})
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-amber-300/90 mt-0.5 font-serif-bengali">
                  {unit.label}
                </span>
                <span className="text-[8px] font-medium tracking-wider text-stone-400 uppercase font-sans">
                  {unit.subLabel}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>প্রতি সেকেন্ডে লাইভ গণনা</span>
          </span>
          <span className="text-amber-300/80 hover:text-amber-200 font-medium">বিস্তারিত দেখুন →</span>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="w-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Mahalaya Countdown */}
        {renderTimerCard(
          '🌙 মহালয়ার আর কতদিন?',
          'দেবীপক্ষ সূচনা ও পুণ্য তর্পণ লগ্ন',
          mahalayaTime,
          '১০ অক্টোবর, ২০২৬',
          <Moon className="w-5 h-5" />,
          'mahalaya',
          '🌺 শুভ মহালয়া',
          onNavigateToMahalaya
        )}

        {/* Durga Puja Countdown */}
        {renderTimerCard(
          '🪔 দুর্গাপূজার আর কতদিন?',
          'শারদীয়া দুর্গোৎসব ২০২৬ মহাপর্ব',
          pujaTime,
          '১৬ অক্টোবর, ২০২৬',
          <Flame className="w-5 h-5" />,
          'puja',
          '🌺 শুভ দুর্গাপূজা',
          onNavigateToPuja
        )}
      </div>
    </section>
  );
};
