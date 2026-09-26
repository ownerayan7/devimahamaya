import { GyanSaradaChannel } from '../types';

export interface GyanCategory {
  id: string;
  nameBengali: string;
  nameEnglish: string;
  icon: string;
  color: string;
  description: string;
}

export const GYAN_SARADA_CATEGORIES: GyanCategory[] = [
  {
    id: 'all',
    nameBengali: 'সব বিষয়',
    nameEnglish: 'All Subjects',
    icon: '🎓',
    color: 'from-amber-500 to-orange-600',
    description: 'সমস্ত শিক্ষামূলক চ্যানেল ও পেজের সমন্বিত ডিরেক্টরি'
  },
  {
    id: 'physics',
    nameBengali: 'পদার্থবিজ্ঞান',
    nameEnglish: 'Physics',
    icon: '⚛️',
    color: 'from-cyan-500 to-blue-600',
    description: 'পদার্থবিজ্ঞানের বিভিন্ন সূত্র, প্র্যাকটিক্যাল ও সহজ টিউটোরিয়াল চ্যানেল'
  },
  {
    id: 'chemistry',
    nameBengali: 'রসায়ন',
    nameEnglish: 'Chemistry',
    icon: '🧪',
    color: 'from-emerald-500 to-teal-600',
    description: 'রসায়নের বিক্রিয়া, ল্যাব এক্সপেরিমেন্ট ও বিষয়ভিত্তিক চ্যানেল'
  },
  {
    id: 'maths',
    nameBengali: 'গণিত',
    nameEnglish: 'Mathematics',
    icon: '📐',
    color: 'from-purple-500 to-indigo-600',
    description: 'সহজ নিয়মে অংক শেখা, জ্যামিতি ও গণিতের চ্যানেল'
  },
  {
    id: 'songit',
    nameBengali: 'সঙ্গীত শিক্ষা',
    nameEnglish: 'Music',
    icon: '🎵',
    color: 'from-rose-500 to-pink-600',
    description: 'হারমোনিয়াম, তানপুরা, রবীন্দ্র সঙ্গীত ও সঙ্গীত শেখার চ্যানেল ও পেজ'
  },
  {
    id: 'ankon',
    nameBengali: 'অঙ্কন ও আর্ট',
    nameEnglish: 'Drawing & Art',
    icon: '🎨',
    color: 'from-amber-400 to-yellow-600',
    description: 'সহজে ড্রয়িং, ওয়াটার কালার ও চারুকলা শিক্ষার চ্যানেল'
  },
  {
    id: 'magic',
    nameBengali: 'ম্যাজিক ট্রিকস',
    nameEnglish: 'Magic Tricks',
    icon: '🪄',
    color: 'from-violet-500 to-fuchsia-600',
    description: 'সহজ কৌশলে জাদুকরী ম্যাজিক ও সায়েন্স ট্রিকস শেখার চ্যানেল'
  },
  {
    id: 'tech',
    nameBengali: 'প্রযুক্তি ও কম্পিউটার',
    nameEnglish: 'Tech & Coding',
    icon: '💻',
    color: 'from-blue-500 to-cyan-600',
    description: 'কম্পিউটার শিক্ষা, প্রোগ্রামিং ও ডিজিটাল প্রযুক্তি চ্যানেল'
  },
  {
    id: 'biology',
    nameBengali: 'জীববিজ্ঞান',
    nameEnglish: 'Biology',
    icon: '🧬',
    color: 'from-green-500 to-emerald-600',
    description: 'উদ্ভিদ ও প্রাণিবিদ্যা, হিউম্যান অ্যানাটমি চ্যানেল'
  },
  {
    id: 'gk',
    nameBengali: 'সাধারণ জ্ঞান',
    nameEnglish: 'General Knowledge',
    icon: '🌐',
    color: 'from-amber-500 to-yellow-500',
    description: 'দেশ-বিদেশের ইতিহাস, ভূগোল, বিজ্ঞান চ্যানেল'
  }
];

export const INITIAL_GYAN_SARADA_CHANNELS: GyanSaradaChannel[] = [
  // ⚛️ Physics Channels
  {
    id: 'chan-phys-1',
    title: 'Physics Wallah Bangla',
    category: 'physics',
    categoryBengali: 'পদার্থবিজ্ঞান',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/@PhysicsWallahBangla',
    description: 'বাংলা ভাষায় পদার্থবিজ্ঞানের সব জটিল টপিক, বলবিদ্যা, আলো ও ইলেকট্রিসিটির অনলাইন ক্লাস।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '350K+ Subscribers',
    featured: true
  },
  {
    id: 'chan-phys-2',
    title: 'MinutePhysics & Science',
    category: 'physics',
    categoryBengali: 'পদার্থবিজ্ঞান',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/@minutephysics',
    description: 'পদার্থবিজ্ঞানের বিভিন্ন অদ্ভুত রহস্য ও অ্যানিমেশনের মাধ্যমে বৈজ্ঞানিক বিষয়াদি।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '5M+ Subscribers',
    featured: false
  },

  // 🧪 Chemistry Channels
  {
    id: 'chan-chem-1',
    title: '10 Minute School Main Channel',
    category: 'chemistry',
    categoryBengali: 'রসায়ন',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/@10msMain',
    description: 'রসায়নের পিরিওডিক টেবিল, জৈব রসায়ন ও বিজ্ঞান বিষয়ের টিউটোরিয়াল।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '3M+ Subscribers',
    featured: true
  },
  {
    id: 'chan-chem-2',
    title: 'Periodic Videos Science',
    category: 'chemistry',
    categoryBengali: 'রসায়ন',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/@periodicvideos',
    description: 'পর্যায় সারণীর মৌলসমূহের প্র্যাকটিক্যাল রসায়ন পরীক্ষা-নিরীক্ষা।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '1.5M+ Subscribers',
    featured: false
  },

  // 📐 Maths Channels
  {
    id: 'chan-math-1',
    title: '3Blue1Brown Mathematics',
    category: 'maths',
    categoryBengali: 'গণিত',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/@3blue1brown',
    description: 'ক্যালকুলাস, লিনিয়ার অ্যালজেব্রা ও গণিতের সৌন্দর্যের ভিজ্যুয়াল প্রেজেন্টেশন।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '6M+ Subscribers',
    featured: true
  },

  // 🎵 Sangeet Channels
  {
    id: 'chan-songit-1',
    title: 'Sangeet Pathshala Channel',
    category: 'songit',
    categoryBengali: 'সঙ্গীত শিক্ষা',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/hashtag/sangeetlearning',
    description: 'অনলাইনে হারমোনিয়াম বাজানো, সারগাম অনুশীলন ও কন্ঠ সাধনা শিক্ষা।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '180K+ Subscribers',
    featured: true
  },
  {
    id: 'chan-songit-2',
    title: '11 Star Club Sangeet Workshop (Facebook Page)',
    category: 'songit',
    categoryBengali: 'সঙ্গীত শিক্ষা',
    platform: 'facebook',
    channelUrl: 'https://www.facebook.com/groups/11starclub',
    description: '১১ স্টার ক্লাবের রবীন্দ্র সঙ্গীত চর্চা ও বিশেষ সুর প্রশিক্ষণ ফেসবুক পেজ।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '10K+ Members',
    featured: true
  },

  // 💻 Tech & Programming Channels
  {
    id: 'chan-tech-1',
    title: 'Programming Hero',
    category: 'tech',
    categoryBengali: 'প্রযুক্তি ও কম্পিউটার',
    platform: 'youtube',
    channelUrl: 'https://www.youtube.com/@ProgrammingHero',
    description: 'সহজ বাংলা ভাষায় প্রোগ্রামিং, ওয়েবসাইট তৈরি ও কম্পিউটার প্রযুক্তি শিক্ষা।',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
    subscribersOrFollowers: '800K+ Subscribers',
    featured: true
  }
];
