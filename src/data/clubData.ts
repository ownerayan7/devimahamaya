import { Announcement, PujaScheduleItem, ServiceItem, MahalayaTrack, VideoItem, ActivityTimelineItem, GalleryPhotoItem, TreePlantationPhotoItem } from '../types';

export const CLUB_INFO = {
  nameBn: '11 STAR CLUB',
  nameEn: '11 STAR CLUB',
  tagline: 'সেবা, সংস্কৃতি ও একতার প্রতীক',
  description: '11 স্টার ক্লাবের অফিসিয়াল ওয়েবসাইটে আপনাকে আন্তরিক প্রীতি ও শুভেচ্ছা। আমরা বিশ্বাস করি সামাজিক উন্নয়ন, পারস্পরিক সাহায্য ও সংস্কৃতিচর্চার মাধ্যমে একটি সুন্দর সমাজ গঠন করা সম্ভব। দুর্গাপূজা উদযাপন থেকে শুরু করে দুস্থ মানুষদের পাশে দাঁড়ানো, অসুস্থ রোগীদের চিকিৎসা সহায়তা, মেধাবী শিক্ষার্থীদের স্কলারশিপ দেওয়া এবং পরিবেশ রক্ষায় বৃক্ষরোপণ — আমাদের প্রতিটি পদক্ষেপে আপনার সাহায্য ও ভালোবাসা আমাদের পাথেয়।',
  aboutLong: '11 স্টার ক্লাব মানুষের পাশে দাঁড়ানো এবং বাঙালি সংস্কৃতির আনন্দ ভাগ করে নেওয়ার অঙ্গীকার থেকে গড়ে ওঠা একটি স্বেচ্ছাসেবী পরিবার। আমাদের স্বপ্ন—সহমর্মিতা ও নাগরিক দায়িত্বে ভর করে আরও শক্তিশালী, সহনশীল ও সুন্দর একটি সমাজ নির্মাণ।',
  email: 'devimahamaya11@gmail.com',
  address: 'Arkhana Uttar Malik Para, PIN Code – 721641',
  locationName: 'Arkhana Uttar Malik Para, West Bengal, PIN - 721641',
  
  // Exact authentic links extracted from old website
  googleMapsUrl: 'https://maps.app.goo.gl/yXgn8Vt5UDr8dZyp8',
  facebookUrl: 'https://www.facebook.com/share/19MZueyG78/',
  whatsappChannelUrl: 'https://whatsapp.com/channel/0029Va8LsgcB4hdNxmQWye03',
  youtubeChannelUrl: 'https://youtube.com/@devimahamaya11starclub?si=kE0XM3M71Al7paOm',
  instagramUrl: 'https://www.instagram.com/eleven.starclub?stkn=aTB3NjRiMG83ZnVj',
  stemCellRegistrationUrl: 'https://www.dkms-india.org/register-now',
  
  // Exact authentic Google Form URLs from old website
  forms: {
    medical: 'https://docs.google.com/forms/d/e/1FAIpQLSdHYVvLomlp2ChhoWZTtT3B6wHdK6epbMJE_vG_1IsgTKKvrA/viewform?usp=dialog',
    needy: 'https://docs.google.com/forms/d/e/1FAIpQLSe_WI6KmAGpaInqdPXWImlpi1KM8X5a0Au5HU_0AnMqyWxh9w/viewform?usp=dialog',
    scholarship: 'https://docs.google.com/forms/d/e/1FAIpQLSdasQ3Yy3akOTfQ8k-PnkNXZDaQDIR6hTO0mT5eDbNVEz9AOg/viewform?usp=dialog',
  },
  
  // Official Google Drive cloud folders
  driveFolders: {
    gallery: 'https://drive.google.com/drive/folders/1M33TD7lAXKSQQV0qiLShPKWf2ulpOhic',
    treePlantation: 'https://drive.google.com/drive/folders/16bXexO2h9OKFGIyTGD7HZ_eFO2nwbTmk',
    noticeBoard: 'https://drive.google.com/drive/folders/1Ydrzhj7YG18vojzvmJrD1rmAU25md8c1',
  },
  
  // Authentic images
  images: {
    logo: 'https://lh3.googleusercontent.com/d/1f_adZ2NYTE4keGmhBkfoWCRqSqkVPdDY',
    logoThumbnail: 'https://drive.google.com/thumbnail?id=1f_adZ2NYTE4keGmhBkfoWCRqSqkVPdDY&sz=w1000',
    logoFallback: '/logo_maa_aschen.jpg',
    logoDriveUrl: 'https://drive.google.com/file/d/1f_adZ2NYTE4keGmhBkfoWCRqSqkVPdDY/view?usp=drivesdk',
    khutiPujaNotice: 'https://framerusercontent.com/images/kJP0UyJ7drVWFN3Emy5TosH9U.jpg?width=1800&height=1489',
    heroDurga: 'https://framerusercontent.com/images/yHxdiWReVZDcqvytpuT8C65KlaU.jpg?width=1314&height=666',
  }
};

// Target dates for Durga Puja 2026 & Mahalaya 2026
// Mahalaya: 10 October 2026, 04:00 AM IST
export const MAHALAYA_DATE_2026 = new Date('2026-10-10T04:00:00+05:30');
// Durga Puja Maha Sasthi: 16 October 2026, 08:00 AM IST
export const DURGA_PUJA_DATE_2026 = new Date('2026-10-16T08:00:00+05:30');

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'khuti-puja-2026',
    title: 'শারদীয়া দুর্গাপূজা ২০২৬ — খুঁটি পূজার বিজ্ঞপ্তি',
    date: '৪ সেপ্টেম্বর, ২০২৬ (শুক্রবার)',
    content: 'শারদীয়া দুর্গাপূজা ২০২৬-এর খুঁটি পূজা অনুষ্ঠিত হবে ৪ সেপ্টেম্বর, শুক্রবার। সকল সদস্য ও শুভানুধ্যায়ীদের উপস্থিতি আন্তরিকভাবে কাম্য।',
    tag: 'খুঁটি পূজা',
    isImportant: true,
    image: CLUB_INFO.images.khutiPujaNotice,
  },
  {
    id: 'official-notice',
    title: 'শারদীয়া উৎসব ও ক্লাবের অফিশিয়াল বিজ্ঞপ্তি',
    date: 'সর্বশেষ অফিশিয়াল নোটিশ',
    content: 'শারদীয়া দুর্গোৎসব ২০২৬, পূজা প্রস্তুতি, সাংস্কৃতিক অনুষ্ঠান ও ক্লাবের অফিশিয়াল বিজ্ঞপ্তি ও নির্দেশিকা প্রকাশ করা হয়েছে। সরাসরি গুগল ড্রাইভে গিয়ে সম্পূর্ণ নোটিশ ও প্রয়োজনীয় ফাইলগুলি দেখে নিন।',
    tag: 'অফিসিয়াল বিজ্ঞপ্তি',
    isImportant: true,
    image: '/drive_photos/notice_board/IMG-20260723-WA0000.jpg',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Ydrzhj7YG18vojzvmJrD1rmAU25md8c1',
    driveFolderTitle: 'গুগল ড্রাইভে অফিশিয়াল বিজ্ঞপ্তি ও ফাইল দেখুন',
  },
];

export const PUJA_SCHEDULE_2026: PujaScheduleItem[] = [
  {
    event: 'খুঁটি পূজা (মণ্ডপ নির্মাণ সূচনা)',
    dateBengali: '১৮ ভাদ্র, শুক্রবার',
    dateEnglish: '৪ সেপ্টেম্বর, ২০২৬ (Friday)',
    description: 'পূজার শুভ সূচনা ও পবিত্র খুঁটি স্থাপন। ক্লাবের সকল সদস্য ও ভক্তবৃন্দের উপস্থিতি কাম্য।',
    icon: 'Hammer',
    highlight: true,
  },
  {
    event: 'মহালয়া (দেবীপক্ষ সূচনা)',
    dateBengali: '২৩ আশ্বিন, শনিবার',
    dateEnglish: '১০ অক্টোবর, ২০২৬ (Saturday)',
    description: 'ভোরবেলায় চণ্ডীপাঠ ও মহিষাসুরমর্দিনী শ্রবণ। পিতৃপুরুষের তর্পণ এবং শুভ দেবীপক্ষের আবাহন।',
    icon: 'Moon',
    highlight: true,
  },
  {
    event: 'মহা ষষ্ঠী (বোধন, আমন্ত্রণ ও অধিবাস)',
    dateBengali: '২৯ আশ্বিন, শুক্রবার',
    dateEnglish: '১৬ অক্টোবর, ২০২৬ (Friday)',
    description: 'মা দুর্গার বোধন, আমন্ত্রণ ও অধিবাস। দেবীর বেলতলায় আহ্বান ও পূজার সূচনা।',
    icon: 'Sparkles',
    highlight: true,
  },
  {
    event: 'মহা সপ্তমী (নবপত্রিকা প্রবেশ ও সপ্তমী পূজা)',
    dateBengali: '৩০ আশ্বিন - ১ কার্তিক (শনিবার ও রবিবার)',
    dateEnglish: '১৭ অক্টোবর ও ১৮ অক্টোবর, ২০২৬',
    description: 'কলাবউ স্নান, নবপত্রিকা প্রবেশ ও মহাসপ্তমীর বিহিত পূজা। অঞ্জলি ও প্রসাদ বিতরণ।',
    icon: 'Sun',
  },
  {
    event: 'মহা অষ্টমী (কুমারী পূজা ও সন্ধিপূজা)',
    dateBengali: '২ কার্তিক, সোমবার',
    dateEnglish: '১৯ অক্টোবর, ২০২৬ (Monday)',
    description: 'অষ্টমীর পবিত্র পুষ্পাঞ্জলি ও সন্ধিপূজার ১০৮ প্রদীপ প্রজ্বলন।',
    icon: 'Flame',
    highlight: true,
  },
  {
    event: 'মহা নবমী (নবমী হোম ও আরতি)',
    dateBengali: '৩ কার্তিক, মঙ্গলবার',
    dateEnglish: '২০ অক্টোবর, ২০২৬ (Tuesday)',
    description: 'মহা নবমীর মহাযজ্ঞ, চণ্ডীপাঠের পূর্ণাহুতি, ধুনুচি নৃত্য ও মহাধামাকা সন্ধ্যা আরতি।',
    icon: 'Flame',
  },
  {
    event: 'বিজয়া দশমী (দেবী বরণ ও বিসর্জন)',
    dateBengali: '৪ কার্তিক, বুধবার',
    dateEnglish: '২১ অক্টোবর, ২০২৬ (Wednesday)',
    description: 'সিঁদুর খেলা, দেবী বরণ, বিসর্জনের শান্তিজল এবং মিষ্টিমুখের সাথে শুভ বিজয়ার শুভেচ্ছা বিনিময়।',
    icon: 'HeartHandshake',
    highlight: true,
  },
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'medical',
    title: 'চিকিৎসা সাহায্য',
    englishTitle: 'Medical Assistance',
    description: 'জরুরি চিকিৎসা-ব্যয়, হাসপাতাল সহায়তা ও স্বাস্থ্যসেবার জন্য আর্থিক সহযোগিতার ব্যবস্থা করা হয়।',
    icon: 'HeartPulse',
    formUrl: CLUB_INFO.forms.medical,
    documents: ['Doctor’s Prescription', 'Medical Reports', 'Hospital Bills', 'Aadhaar Card / Voter ID'],
    features: ['জরুরি ওষুধ ও চিকিৎসা অনুদান', 'হাসপাতাল বিল পরিশোধে সহায়তা', 'শারীরিক সরেজমিনে নিরপেক্ষ যাচাই'],
    color: 'from-rose-500/20 to-red-950/40'
  },
  {
    id: 'needy',
    title: 'দরিদ্র সেবা',
    englishTitle: 'Help for the Needy',
    description: 'অসহায় পরিবারগুলির জন্য খাদ্যপ্যাকেট, পোশাক এবং প্রাথমিক জীবনযাপনের সহায়তা প্রদান করা হয়।',
    icon: 'HandHeart',
    formUrl: CLUB_INFO.forms.needy,
    documents: ['Aadhaar Card / Voter ID', 'Income Proof / আয়ের শংসাপত্র', 'রেশন কার্ড / স্থায়ী ঠিকানা প্রুফ'],
    features: ['নিত্যপ্রয়োজনীয় খাদ্যসামগ্রী বিতরণ', 'শীতবস্ত্র ও উৎসবের নতুন পোশাক', 'দুর্যোগকালীন জরুরি খাদ্য বিতরণ'],
    color: 'from-amber-500/20 to-amber-950/40'
  },
  {
    id: 'scholarship',
    title: 'স্কলারশিপ আবেদন',
    englishTitle: 'Scholarship Application',
    description: 'মেধাবী ও আর্থিকভাবে অসচ্ছল শিক্ষার্থীদের জন্য শিক্ষাবৃত্তি, বই কেনার অনুদান এবং শিক্ষাসামগ্রী সহায়তা দেওয়া হয়।',
    icon: 'GraduationCap',
    formUrl: CLUB_INFO.forms.scholarship,
    documents: ['Last Examination Mark Sheet', 'Student ID Card / School Certificate', 'Family Income Certificate', 'Aadhaar Card'],
    features: ['বার্ষিক মেধা ও আর্থিক বৃত্তি', 'পাঠ্যবই ও খাতা-কলম বিতরণ', 'উচ্চশিক্ষায় বিশেষ পরামর্শ'],
    color: 'from-blue-500/20 to-indigo-950/40'
  },
  {
    id: 'tree-plantation',
    title: 'বৃক্ষরোপণ কর্মসূচি',
    englishTitle: 'Tree Plantation & Green Drive',
    description: 'বার্ষিক সবুজায়ন অভিযান, চারাগাছ বিতরণ ও পরিবেশ সচেতনতা কর্মসূচির মাধ্যমে আমরা প্রজন্মের জন্য একটি বাসযোগ্য ভবিষ্যৎ গড়তে চাই।',
    icon: 'Trees',
    documents: [],
    features: ['এলাকাভিত্তিক চারাগাছ রোপণ', 'বিনামূল্যে ফলদ ও ঔষধি গাছ বিতরণ', 'পরিবেশ দিবস ও সবুজ সচেতনতা শিবির'],
    color: 'from-emerald-500/20 to-teal-950/40'
  },
  {
    id: 'donate',
    title: 'সহযোগিতা করুন',
    englishTitle: 'Support & Donate',
    description: 'আপনার মূল্যবান অবদান সামাজিক সেবা, চিকিৎসা সহায়তা, শিক্ষাবৃত্তি, বৃক্ষরোপণ এবং আমাদের সাংস্কৃতিক আয়োজনকে এগিয়ে নেবে।',
    icon: 'Gift',
    documents: [],
    features: ['STEM Cell Donor Registration (DKMS)', 'ক্লাব সেবা তহবিল অনুদান', 'পূজা ও সাংস্কৃতিক পৃষ্ঠপোষকতা'],
    color: 'from-yellow-500/20 to-amber-950/40'
  }
];

export const MAHALAYA_TRACKS: MahalayaTrack[] = [
  {
    id: 1,
    title: 'মহিষাসুরমর্দিনী — বীরেন্দ্রকৃষ্ণ ভদ্র',
    subtitle: 'আশ্বিনের শারদপ্রাতে বেজে উঠেছে আলোক মঞ্জীর',
    artist: 'বীরেন্দ্রকৃষ্ণ ভদ্র ও পঙ্কজ মল্লিক',
    youtubeId: 'YQyo8QeoYhc',
    youtubeUrl: 'https://youtu.be/YQyo8QeoYhc?si=8sTwoda6FiHmd14P',
    audioUrl: 'https://ia800301.us.archive.org/15/items/Mahisasuramardini_Birendrakrishna_Bhadra/Mahishasuramardini.mp3',
    duration: '১ ঘণ্টা ২৮ মিনিট',
    thumbnail: CLUB_INFO.images.heroDurga
  },
  {
    id: 2,
    title: 'দেবী স্তুতি ও আগমনী সুর',
    subtitle: 'যা দেবী সর্বভূতেষু মাতৃরূপেণ সংস্থিতা',
    artist: 'মহালয়া বিশেষ ভক্তিগীতি সংকলন',
    youtubeId: 'IPimdCeJCWs',
    youtubeUrl: 'https://youtu.be/IPimdCeJCWs?si=gWzshUIIsY0VOTQ0',
    audioUrl: 'https://ia800301.us.archive.org/15/items/Mahisasuramardini_Birendrakrishna_Bhadra/Mahishasuramardini.mp3',
    duration: '৪৫ মিনিট',
    thumbnail: CLUB_INFO.images.heroDurga
  }
];

export const MAHALAYA_PLAYLIST = {
  title: 'মহালয়া — সম্পূর্ণ ভিডিও প্লেলিস্ট',
  playlistId: 'PLtsUWvUwaRiC4YpsREWowKOtwRUvxz9Qh',
  youtubeUrl: 'https://youtube.com/playlist?list=PLtsUWvUwaRiC4YpsREWowKOtwRUvxz9Qh&si=kL-QO72UQXGgbvK1',
  description: 'মহালয়া, চণ্ডীপাঠ, আগমনী গান ও দেবী আবাহনের সমস্ত পবিত্র ভিডিওর বিশেষ প্লেলিস্ট।'
};

export const FEATURED_VIDEOS: VideoItem[] = [
  // 1. OFFICIAL COMPLETED BROADCASTS & STREAMS
  {
    id: 'live-stream-1',
    title: 'সার্বজনীন শ্রী শ্রী শারদীয় দুর্গোৎসব — সম্প্রচার (পর্ব ১)',
    description: '11 স্টার ক্লাবের বর্ণাঢ্য শারদীয়া দুর্গোৎসব ও পূজামণ্ডপের সরাসরি সম্প্রচার — খুকুড়দহ আড়খানা, পশ্চিম মেদিনীপুর।',
    youtubeId: '_65N3D5zTYg',
    youtubeUrl: 'https://www.youtube.com/live/_65N3D5zTYg?si=sbxm4niLWINBnrE-',
    category: 'durga-puja',
    duration: 'সম্পন্ন সম্প্রচার',
    tag: 'শারদীয়া পূজা'
  },
  {
    id: 'live-stream-2',
    title: 'সার্বজনীন শ্রী শ্রী শারদীয় দুর্গোৎসব — সম্প্রচার (পর্ব ২)',
    description: 'মণ্ডপ পরিক্রমা, আলোকসজ্জা ও ভক্তি আবহের বিশেষ মুহূর্ত — ইলেভেন স্টার ক্লাব।',
    youtubeId: 'yw_qiRklErM',
    youtubeUrl: 'https://www.youtube.com/live/yw_qiRklErM?si=oAANZx-KZ5r_3YbS',
    category: 'durga-puja',
    duration: 'সম্পন্ন সম্প্রচার',
    tag: 'শারদীয়া পূজা'
  },
  {
    id: 'live-stream-3',
    title: 'সাংস্কৃতিক অনুষ্ঠান ও সঙ্গীত সন্ধ্যা — জয় হাজরা এবং স্বর্ণালী বোস',
    description: '11 স্টার ক্লাবের শারদীয়া সাংস্কৃতিক মহোৎসবে বিশিষ্ট শিল্পীদের মনোজ্ঞ সংগীতানুষ্ঠান ও সাংস্কৃতিক পরিবেশনা।',
    youtubeId: 'RyCesRNvlUs',
    youtubeUrl: 'https://www.youtube.com/live/RyCesRNvlUs?si=zc3ek7kk5Jy2fnzV',
    category: 'cultural',
    duration: 'সাংস্কৃতিক অনুষ্ঠান',
    tag: 'সাংস্কৃতিক অনুষ্ঠান'
  },
  {
    id: 'live-stream-4',
    title: 'সার্বজনীন শ্রী শ্রী শারদীয় দুর্গোৎসব — পূজা মহোৎসব ও মণ্ডপ দর্শন',
    description: 'মহাসমারোহে অনুষ্ঠিত শারদীয় দুর্গোৎসবের স্মরণীয় ভিডিও — ইলেভেন স্টার ক্লাব, খুকুড়দহ।',
    youtubeId: 'MxALuDX6Tc8',
    youtubeUrl: 'https://www.youtube.com/live/MxALuDX6Tc8?si=5lzlzcVuoxv3ei5O',
    category: 'durga-puja',
    duration: 'সম্পন্ন সম্প্রচার',
    tag: 'শারদীয়া পূজা'
  },

  // 2. OFFICIAL CHANNEL UPLOADS & CULTURAL VIDEOS (@devimahamaya11starclub)
  {
    id: 'club-drama-video',
    title: 'Yeh Duniya Yeh Mehfil — 11 স্টার ক্লাবের চমৎকার নাটক ও সাংস্কৃতিক প্রযোজনা',
    description: 'ক্লাবের তরুণ ও প্রবীণ নাট্যপ্রেমী সদস্যদের আবেগঘন ও হাস্যরসাত্মক ড্রামা উপস্থাপনা।',
    youtubeId: 'TQb1pzKLSAs',
    youtubeUrl: 'https://www.youtube.com/watch?v=TQb1pzKLSAs',
    category: 'cultural',
    duration: 'নাট্যানুষ্ঠান',
    tag: 'ক্লাব ড্রামা'
  },

  // 3. CHANNEL SHORTS & HIGHLIGHTS
  {
    id: 'shorts-pandal-highlight',
    title: 'সেরা দুর্গাপূজা থিম ও প্রতিমা দর্শন — 11 স্টার ক্লাব',
    description: 'পশ্চিমবঙ্গের সেরা মণ্ডপ ও অপূর্ব মৃন্ময়ী মাতৃমূর্তির মনোমুগ্ধকর দৃশ্য।',
    youtubeId: 'H3tOWyt5jj4',
    youtubeUrl: 'https://www.youtube.com/watch?v=H3tOWyt5jj4',
    category: 'shorts',
    duration: 'শর্টস ভিডিও',
    tag: 'প্রতিমা দর্শন'
  },
  {
    id: 'shorts-panskura-best',
    title: 'পাঁশকুড়া থেকে সেরা পূজা প্যান্ডেল — 11 স্টার ক্লাব উপস্থাপনা',
    description: 'এলাকার সেরা ও আকর্ষণীয় পূজামণ্ডপের ঝলক।',
    youtubeId: 'vGvwf3b-Hzg',
    youtubeUrl: 'https://www.youtube.com/watch?v=vGvwf3b-Hzg',
    category: 'shorts',
    duration: 'শর্টস ভিডিও',
    tag: 'পূজা প্যান্ডেল'
  },
  {
    id: 'shorts-devi-art',
    title: 'দেবী দুর্গার অপরূপ চিত্রাঙ্কন ও তুলির টান — আর্ট প্রসেস',
    description: 'ছোটদের ও শিল্পীদের আঁকা দেবী দুর্গার চমৎকার চিত্রশিল্প।',
    youtubeId: 'sImJu_6bICA',
    youtubeUrl: 'https://www.youtube.com/watch?v=sImJu_6bICA',
    category: 'shorts',
    duration: 'শর্টস ভিডিও',
    tag: 'চিত্রাঙ্কন'
  },
  {
    id: 'shorts-bijoya',
    title: 'শুভ বিজয়া দশমীর মিষ্টি মুহূর্ত ও গান',
    description: 'শারদোৎসবের বিদায়লগ্নে বিজয়ার প্রীতি ও শুভেচ্ছা বার্তা।',
    youtubeId: 'eGteiLnU3sI',
    youtubeUrl: 'https://www.youtube.com/watch?v=eGteiLnU3sI',
    category: 'shorts',
    duration: 'শর্টস ভিডিও',
    tag: 'বিজয়া দশমী'
  },
  {
    id: 'shorts-kali-puja',
    title: 'মা কালী ও শুভ দীপাবলি আলোকময় রাত',
    description: 'প্রদীপের আলোয় শ্যামাপূজা ও দীপাবলির পবিত্র সন্ধ্যা।',
    youtubeId: 'jYBOXAPa3Ng',
    youtubeUrl: 'https://www.youtube.com/watch?v=jYBOXAPa3Ng',
    category: 'shorts',
    duration: 'শর্টস ভিডিও',
    tag: 'কালীপূজা'
  }
];

export const ACTIVITIES_TIMELINE: ActivityTimelineItem[] = [
  {
    year: '২০২৬',
    title: 'Durga Puja 2026 Preparation',
    bengaliTitle: 'দুর্গাপূজা ২০২৬ প্রস্তুতি ও খুঁটি পূজা',
    description: 'শারদীয়া দুর্গোৎসবের শুভ খুঁটি পূজা ও মণ্ডপ নির্মাণের আনুষ্ঠানিক সূচনা।',
    tag: 'উৎসব',
    icon: 'Sparkles'
  },
  {
    year: '২০২৬',
    title: 'Humanitarian & Medical Relief',
    bengaliTitle: 'মানবিক সহায়তা ও জরুরি চিকিৎসা সেবা',
    description: 'আর্থিক অসচ্ছল রোগীদের ওষুধ ও চিকিৎসা ব্যয়ে সরাসরি সহযোগিতা প্রদান।',
    tag: 'সেবা',
    icon: 'HeartPulse'
  },
  {
    year: '২০২৬',
    title: 'Educational Scholarship & Books',
    bengaliTitle: 'শিক্ষা-উপকরণ ও মেধা স্কলারশিপ বিতরণ',
    description: 'এলাকার কৃতী শিক্ষার্থীদের বই, খাতা ও বিশেষ শিক্ষাবৃত্তি প্রদান।',
    tag: 'শিক্ষা',
    icon: 'GraduationCap'
  },
  {
    year: '২০২৬',
    title: 'Green Campaign & Plantation',
    bengaliTitle: 'সবুজায়ন কর্মসূচি ও বৃক্ষরোপণ অভিযান',
    description: 'শত শত চারাগাছ রোপণ ও এলাকাবাসীর মধ্যে বিনামূল্যে পরিবেশবান্ধব গাছ বিতরণ।',
    tag: 'পরিবেশ',
    icon: 'Trees'
  }
];

export const SHOPPING_PLATFORMS = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    bengaliName: 'ফ্লিপকার্ট',
    description: 'উৎসবের সেরা কেনাকাটা, পোশাক, পুজো স্পেশাল অফার ও ইলেকট্রনিক্সে সর্বোচ্চ ছাড়।',
    url: 'https://www.flipkart.com',
    iconColor: '#2874f0',
    badge: 'উৎসবের সেরা অফার',
    features: ['পূজার নতুন কালেকশন', 'ফাস্ট হোম ডেলিভারি', 'সহজ রিটার্ন']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    bengaliName: 'অ্যামাজন',
    description: 'গ্রেট ইন্ডিয়ান ফেস্টিভ্যাল — ফ্যাশন, ঘরসজ্জা ও যাবতীয় প্রয়োজনীয় সামগ্রীর বিপুল সম্ভার।',
    url: 'https://www.amazon.in',
    iconColor: '#ff9900',
    badge: 'গ্রেট ফেস্টিভ্যাল ডিল',
    features: ['প্রাইম ফাস্ট ডেলিভারি', '১০০% অরিজিনাল পণ্য', 'উৎসব ছাড়']
  },
  {
    id: 'meesho',
    name: 'Meesho',
    bengaliName: 'মিশো',
    description: 'সবচেয়ে কম মূল্যে শাড়ি, পাঞ্জাবি, এথনিক পোশাক ও ট্রেন্ডি পুজোর সাজের সমাহার।',
    url: 'https://www.meesho.com',
    iconColor: '#f43397',
    badge: 'বাজেট ফ্রেন্ডলি ফ্যাশন',
    features: ['হোলসেল রেট', 'ফ্রি ক্যাশ অন ডেলিভারি', 'লেটেস্ট এথনিক ডিজাইন']
  }
];

export const GALLERY_PHOTOS: GalleryPhotoItem[] = [
  {
    id: 101,
    title: "মা মহামায়ার অপরূপ প্রতিমা রূপ — শারদীয়া দুর্গোৎসব",
    category: "puja",
    subtitle: "দেবী দুর্গার চিরায়ত শান্ত ও স্নেহময়ী মাতৃরূপ — 11 স্টার ক্লাব পূজামণ্ডপ",
    url: "/drive_photos/gallery/Maaa_WEBP_.webp",
    tag: "দেবী প্রতিমা"
  },
  {
    id: 102,
    title: "ঐতিহ্যবাহী খুঁটি পূজা ২০২৩ — পূজা আয়োজনের শুভ সূচনা",
    category: "puja",
    subtitle: "পুরোহিতের বেদমন্ত্র উচ্চারণ ও গঙ্গাজল ছিটিয়ে মণ্ডপ নির্মাণের পবিত্র সূচনা",
    url: "/drive_photos/gallery/Khuti_pujo_2023_WEBP_.webp",
    tag: "খুঁটি পূজা ২০২৩"
  },
  {
    id: 103,
    title: "একান্ত আপন থিম প্যান্ডেল ২০২৪ — সম্মুখভাগের অনন্য রূপ (১)",
    category: "theme",
    subtitle: "সৃজনশীল ভাবনায় সেজে ওঠা ২০২৪ সালের অনবদ্য থিম মণ্ডপ",
    url: "/drive_photos/gallery/Ekanto_apon_pandal_2024_WEBP_.webp",
    tag: "একান্ত আপন ২০২৪"
  },
  {
    id: 104,
    title: "একান্ত আপন থিম প্যান্ডেল ২০২৪ — শৈল্পিক কারুকার্য ও বিস্তার (২)",
    category: "theme",
    subtitle: "নিখুঁত কারিগরিতে তৈরি মণ্ডপ তোরণ ও মনোরম আবহ",
    url: "/drive_photos/gallery/Ekanto_apon_pandal_2024_WEBP__1.webp",
    tag: "একান্ত আপন ২০২৪"
  },
  {
    id: 105,
    title: "একান্ত আপন থিম প্যান্ডেল ২০২৪ — রাতের আলোয় উদ্ভাসিত রূপ (৩)",
    category: "theme",
    subtitle: "আলোকসজ্জার মায়াবী রূপ ও দর্শনার্থীদের অপার মুগ্ধতা",
    url: "/drive_photos/gallery/Ekanto_apon_pandal_2024_WEBP__2.webp",
    tag: "একান্ত আপন ২০২৪"
  },
  {
    id: 106,
    title: "শারদীয় দুর্গোৎসবের রাজকীয় পূজামণ্ডপ প্রাঙ্গণ",
    category: "theme",
    subtitle: "দূর-দূরান্ত থেকে আসা ভক্ত ও দর্শনার্থীদের মিলনমেলা",
    url: "/drive_photos/gallery/Pujo_pandal_WEBP_.webp",
    tag: "পূজামণ্ডপ"
  },
  {
    id: 107,
    title: "ঢাকের তালে ধুনুচি নাচের আনন্দধারা (পর্ব ১)",
    category: "puja",
    subtitle: "ধুনুচির ধোঁয়া আর ঢাকের কাঠি সহযোগে মাতৃবন্দনার আবেগঘন মুহূর্ত",
    url: "/drive_photos/gallery/Dhunuchi_nach_er_pala_WEBP_.webp",
    tag: "ধুনুচি নাচ"
  },
  {
    id: 108,
    title: "ধুনুচি নৃত্যের উন্মাদনা ও উৎসবের তাল (পর্ব ২)",
    category: "puja",
    subtitle: "সন্ধ্যা আরতির পর ক্লাবের সদস্য ও ভক্তদের আনন্দোচ্ছ্বাস",
    url: "/drive_photos/gallery/Dhunuchi_nach_er_pala_WEBP__1.webp",
    tag: "ধুনুচি নাচ"
  },
  {
    id: 109,
    title: "বাগদেবী শ্রী শ্রী সরস্বতী পূজা ২০২৪ — বিদ্যার দেবীর আরাধনা",
    category: "puja",
    subtitle: "বসন্ত পঞ্চমীতে শিক্ষার্থী ও ক্লাবের যৌথ আয়োজনে সরস্বতী বন্দনা",
    url: "/drive_photos/gallery/Saraswati_puja_2024_WEBP_.webp",
    tag: "সরস্বতী পূজা ২০২৪"
  },
  {
    id: 110,
    title: "রাঁধে রাঁধে — নামসংকীর্তন ও ভক্তিগীতি পরিবেশনা",
    category: "cultural",
    subtitle: "পবিত্র আবহে প্রভুর নামস্মরণ ও আধ্যাত্মিক মিলনমেলা",
    url: "/drive_photos/gallery/Radhe_radhe____WEBP_.webp",
    tag: "ভক্তি উৎসব"
  },
  {
    id: 111,
    title: "স্মরণীয় রাত — ক্লাবের ভ্রাতৃত্ব ও আনন্দ আড্ডা (১)",
    category: "memories",
    subtitle: "মণ্ডপ চত্বরে ক্লাবের ভাই-বন্ধুদের অবিস্মরণীয় মুহূর্ত",
    url: "/drive_photos/gallery/Memorable_night_WEBP_.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 112,
    title: "স্মরণীয় রাত — আলোকঝলমল সন্ধ্যা ও উৎসব মুখরতা (২)",
    category: "memories",
    subtitle: "উৎসবের দিনগুলোতে হাসিমুখ আর প্রাণের বাঁধন",
    url: "/drive_photos/gallery/Memorable_night_WEBP__1.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 113,
    title: "স্মরণীয় রাত — গান, আড্ডা ও স্মৃতিচারণ (৩)",
    category: "memories",
    subtitle: "পূজার দিনগুলির এই অমূল্য অনুভূতি চিরকাল হৃদয়ে গাঁথা থাকবে",
    url: "/drive_photos/gallery/Memorable_night_WEBP__2.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 114,
    title: "স্মরণীয় রাত — ক্লাবের সদস্যদের প্রীতি সমাবেশ (৪)",
    category: "memories",
    subtitle: "এক পরিবার, এক মন — ইলেভেন স্টার ক্লাবের শক্তি",
    url: "/drive_photos/gallery/Memorable_night_WEBP__3.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 115,
    title: "স্মরণীয় রাত — রাতের মণ্ডপে আলোকোজ্জ্বল গল্পগাথা (৫)",
    category: "memories",
    subtitle: "মণ্ডপ রক্ষার রাতজাগা তদারকি ও বন্ধুদের মেলবন্ধন",
    url: "/drive_photos/gallery/Memorable_night_WEBP__4.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 116,
    title: "স্মরণীয় রাত — উৎসব শেষের মায়াবী অনুভূতি (৬)",
    category: "memories",
    subtitle: "বিদায়বেলার ক্ষণে প্রিয়জনদের এক ফ্রেমে বাঁধার মুহূর্ত",
    url: "/drive_photos/gallery/Memorable_night_WEBP__5.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 117,
    title: "স্মরণীয় রাত — ক্লাবের প্রাণবন্ত মিলনমেলা (৭)",
    category: "memories",
    subtitle: "উৎসব হোক বা সমাজসেবা, আমরা সদা জাগ্রত",
    url: "/drive_photos/gallery/Memorable_night_WEBP__6.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 118,
    title: "স্মরণীয় রাত — হৃদয়ের মণিকোঠায় শারদ স্মৃতি (৮)",
    category: "memories",
    subtitle: "আবার আসিব ফিরে এই উৎসব প্রাঙ্গণে",
    url: "/drive_photos/gallery/Memorable_night_WEBP__7.webp",
    tag: "স্মরণীয় রাত"
  },
  {
    id: 119,
    title: "ক্লাবের গর্বের মুহূর্ত — বিশেষ সম্মাননা ও স্বীকৃতি অর্জন (১)",
    category: "social",
    subtitle: "পূজা সজ্জা ও সামাজিক সেবামূলক কাজের জন্য প্রাপ্ত শিরোপা",
    url: "/drive_photos/gallery/Proud_movement_WEBP_.webp",
    tag: "গর্বের মুহূর্ত"
  },
  {
    id: 120,
    title: "সম্মাননা স্মারক গ্রহণ ও আনন্দ উদযাপন (২)",
    category: "social",
    subtitle: "ক্লাব নেতৃত্বের হাতে পদক ও স্মারক তুলে দেওয়ার ঐতিহাসিক মুহূর্ত",
    url: "/drive_photos/gallery/Proud_movement_WEBP__1.webp",
    tag: "গর্বের মুহূর্ত"
  },
  {
    id: 121,
    title: "পুরস্কার মঞ্চে ইলেভেন স্টার ক্লাবের বিজয়ীর হাসি (৩)",
    category: "social",
    subtitle: "সকল সদস্য ও পাড়াবাসীর অক্লান্ত পরিশ্রমের ফল",
    url: "/drive_photos/gallery/Proud_movement_WEBP__2.webp",
    tag: "গর্বের মুহূর্ত"
  },
  {
    id: 122,
    title: "ঐতিহাসিক সাফল্য ও নতুন উদ্দীপনায় পথচলা (৪)",
    category: "social",
    subtitle: "সমাজসেবা ও সংস্কৃতির অগ্রযাত্রায় এক উজ্জ্বল মাইলফলক",
    url: "/drive_photos/gallery/Proud_movement_WEBP__3.webp",
    tag: "গর্বের মুহূর্ত"
  },
  {
    id: 123,
    title: "বসে আঁকো প্রতিযোগিতা — শিশুদের রঙ-তুলির মেলা (১)",
    category: "cultural",
    subtitle: "ছোট ছোট শিল্পীদের ক্যানভাসে ফুটে ওঠা সৃজনশীল স্বপ্ন",
    url: "/drive_photos/gallery/Painting_compilation_WEBP_.webp",
    tag: "অঙ্কন প্রতিযোগিতা"
  },
  {
    id: 124,
    title: "চিত্রাঙ্কন প্রতিযোগিতা ও পুরস্কার বিতরণ সংকলন (২)",
    category: "cultural",
    subtitle: "আগামী প্রজন্মের প্রতিভা বিকাশে ক্লাবের নিয়মিত উদ্যোগ",
    url: "/drive_photos/gallery/Painting_compilation_WEBP__1.webp",
    tag: "অঙ্কন প্রতিযোগিতা"
  },
  {
    id: 125,
    title: "শারদীয়া উৎসবের প্রস্তুতি বৈঠক ও ক্ষেত্র পরিদর্শন",
    category: "puja",
    subtitle: "মণ্ডপ নির্মাণের তদারকি ও সদস্যদের সক্রিয় অংশগ্রহণ",
    url: "/drive_photos/gallery/IMG-20250930-WA0005.jpg",
    tag: "পূজা প্রস্তুতি"
  },
  {
    id: 126,
    title: "মহালয়ার পুণ্যলগ্নে পূজামণ্ডপ চত্বরে ভক্তি আবহ",
    category: "puja",
    subtitle: "দেবীপক্ষের শুভলগ্নে মায়ের আহ্বান ও প্রস্তুতি পর্ব",
    url: "/drive_photos/gallery/IMG-20251003-WA0005.jpg",
    tag: "মহালয়া ও বোধন"
  },
  {
    id: 127,
    title: "মণ্ডপে ভক্ত ও পুণ্যার্থীদের আনন্দঘন আগমন",
    category: "puja",
    subtitle: "শারদপ্রভাতে মায়ের চরণে অঞ্জলি প্রদানের দৃশ্য",
    url: "/drive_photos/gallery/IMG-20251003-WA0006.jpg",
    tag: "উৎসব আবহ"
  },
  {
    id: 128,
    title: "রাতের আলোয় উদ্ভাসিত দেবীপ্রতিমা ও মণ্ডপ",
    category: "puja",
    subtitle: "আলোকসজ্জার দীপ্তিতে মায়াবী হয়ে ওঠা পূজা অঙ্গন",
    url: "/drive_photos/gallery/IMG-20251003-WA0007.jpg",
    tag: "আলোকসজ্জা"
  },
  {
    id: 129,
    title: "সোশ্যাল মিডিয়া হাইলাইট — শারদ স্মৃতির ঝলক (১)",
    category: "memories",
    subtitle: "ক্লাবের অফিশিয়াল পেজে প্রকাশিত আনন্দোচ্ছ্বাসের মুহূর্ত",
    url: "/drive_photos/gallery/Instagram_-_1788187084031_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 130,
    title: "সোশ্যাল মিডিয়া হাইলাইট — মণ্ডপ পরিক্রমা ও স্মৃতি (২)",
    category: "memories",
    subtitle: "দর্শনার্থীদের বাঁধভাঙা উচ্ছ্বাস ও উৎসবের দিনগুলি",
    url: "/drive_photos/gallery/Instagram_-_1788187084035_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 131,
    title: "সোশ্যাল মিডিয়া হাইলাইট — ভক্তি ও সংস্কৃতির মেলবন্ধন (৩)",
    category: "cultural",
    subtitle: "পূজার আবহে সম্প্রীতি ও একতার জয়গান",
    url: "/drive_photos/gallery/Instagram_-_1788187084038_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 132,
    title: "সোশ্যাল মিডিয়া হাইলাইট — উৎসব অঙ্গনে তারুণ্যের দীপ্তি (৪)",
    category: "memories",
    subtitle: "ক্লাবের যুবশক্তির আন্তরিক সহায়তায় পরিচালিত পূজার দিন",
    url: "/drive_photos/gallery/Instagram_-_1788187238616_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 133,
    title: "সোশ্যাল মিডিয়া হাইলাইট — আনন্দমুখর পুণ্যসন্ধ্যা (৫)",
    category: "puja",
    subtitle: "মহাষ্টমীর সন্ধিপূজার মাহাত্ম্য ও আনন্দ মুহূর্ত",
    url: "/drive_photos/gallery/Instagram_-_1788187238624_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 134,
    title: "সোশ্যাল মিডিয়া হাইলাইট — হৃদয়ের টানে মণ্ডপ চত্বরে (৬)",
    category: "memories",
    subtitle: "গ্রাম ও দূর-দূরান্তের শুভানুধ্যায়ীদের উপস্থিতি",
    url: "/drive_photos/gallery/Instagram_-_1788187238626_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 135,
    title: "সোশ্যাল মিডিয়া হাইলাইট — সাংস্কৃতিক অনুষ্ঠানের মুহূর্ত (৭)",
    category: "cultural",
    subtitle: "বিশিষ্ট সংগীতশিল্পী ও কলাকুশলীদের সাথে মঞ্চের ছবি",
    url: "/drive_photos/gallery/Instagram_-_1788187238627_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 136,
    title: "সোশ্যাল মিডিয়া হাইলাইট — আলোকোজ্জ্বল পূজা তোরণ (৮)",
    category: "theme",
    subtitle: "চন্দননগরের শৈল্পিক আলোয় উদ্ভাসিত প্রবেশদ্বার",
    url: "/drive_photos/gallery/Instagram_-_1788187261312_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 137,
    title: "সোশ্যাল মিডিয়া হাইলাইট — ভ্রাতৃত্ব ও আনন্দের দিনগুলি (৯)",
    category: "social",
    subtitle: "ইলেভেন স্টার ক্লাবের পরিবারের সকলের সম্মিলিত হাসি",
    url: "/drive_photos/gallery/Instagram_-_1788187261315_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 138,
    title: "সোশ্যাল মিডিয়া হাইলাইট — রাতের জাদুকরী আলোকসজ্জা (১০)",
    category: "theme",
    subtitle: "আলোকমালায় সেজে ওঠা মণ্ডপ ও নাটমন্দির",
    url: "/drive_photos/gallery/Instagram_-_1788187283828_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 139,
    title: "সোশ্যাল মিডিয়া হাইলাইট — বন্ধুদের অক্লান্ত পরিশ্রম ও আনন্দ (11)",
    category: "memories",
    subtitle: "পূজাকে সফল করতে দিনরাত এক করা স্মৃতি",
    url: "/drive_photos/gallery/Instagram_-_1788187283833_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 140,
    title: "সোশ্যাল মিডিয়া হাইলাইট — ভক্তিভরে পুষ্পাঞ্জলি নিবেদন (১২)",
    category: "puja",
    subtitle: "সকলের মঙ্গল কামনায় দেবী মহামায়ার চরণে প্রণাম",
    url: "/drive_photos/gallery/Instagram_-_1788187283835_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 141,
    title: "সোশ্যাল মিডিয়া হাইলাইট — ক্লাবের গৌরবময় অভিযাত্রা (১৩)",
    category: "social",
    subtitle: "ঐতিহ্যের ধারক ও বাহক — খুকুড়দহ আড়খানা ইলেভেন স্টার ক্লাব",
    url: "/drive_photos/gallery/Instagram_-_1788187283838_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 142,
    title: "সোশ্যাল মিডিয়া হাইলাইট — শারদীয়ার বিদায়ী আরতি ও আশীর্বাদ (১৪)",
    category: "puja",
    subtitle: "মায়ের বিদায়বেলায় শান্তিজল ও বিজয়ার বার্তা",
    url: "/drive_photos/gallery/Instagram_-_1788187294391_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
  {
    id: 143,
    title: "সোশ্যাল মিডিয়া হাইলাইট — শুভ বিজয়ার আন্তরিক প্রীতি ও ভালোবাসা (১৫)",
    category: "social",
    subtitle: "ছোটদের স্নেহাশিস ও বড়দের প্রণাম সহ মিষ্টিমুখের উৎসব",
    url: "/drive_photos/gallery/Instagram_-_1788187365917_WEBP_.webp",
    tag: "সোশ্যাল মিডিয়া"
  },
{
    "id": 1,
    "title": "ঐতিহ্যবাহী ঢাকের থিম মণ্ডপ — প্রধান দৃশ্য ও রূপসজ্জা (১)",
    "category": "theme",
    "subtitle": "বাঙালির শ্রেষ্ঠ উৎসবের আবহে বিশালাকার ঢাক ও বাদ্যের সমন্বয়ে অনন্য থিম মণ্ডপ",
    "url": "/gallery/fb_img_19.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 2,
    "title": "ঢাকের থিম মণ্ডপের প্রবেশ তোরণ ও শিল্পকলা (২)",
    "category": "theme",
    "subtitle": "হাতে তৈরি ঢাকের কারুকার্য ও নিখুঁত কারিগরিতে সাজানো মণ্ডপের সম্মুখভাগ",
    "url": "/gallery/fb_img_20.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 3,
    "title": "ঢাকের থিম মণ্ডপের অভ্যন্তরীণ কারুকার্য ও দেবীপ্রতিমা (৩)",
    "category": "theme",
    "subtitle": "ঢাকের শৈল্পিক নকশা ও আলোর সমন্বয়ে অপরূপ মায়াবী পরিবেশ",
    "url": "/gallery/fb_img_21.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 4,
    "title": "ঢাকের থিম মণ্ডপ ও দর্শনার্থীদের ভিড় (৪)",
    "category": "theme",
    "subtitle": "দূর-দূরান্ত থেকে আসা দর্শকদের মুগ্ধ করা ঢাকের কারুশিল্প",
    "url": "/gallery/fb_img_22.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 5,
    "title": "রাতের আলোয় ঢাকের থিম মণ্ডপের বর্ণিল ঝলক (৫)",
    "category": "theme",
    "subtitle": "বর্ণাঢ্য আলোকসজ্জায় উদ্ভাসিত ঢাক থিমের অপরূপ রূপ",
    "url": "/gallery/fb_img_23.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 6,
    "title": "ঢাকের থিম মণ্ডপের শিল্পকলার ক্লোজ-আপ দৃশ্য (৬)",
    "category": "theme",
    "subtitle": "বাঙালি সংস্কৃতি ও পূজার অবিচ্ছেদ্য অঙ্গ ঢাকের অপূর্ব উপস্থাপনা",
    "url": "/gallery/fb_img_24.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 7,
    "title": "থিম মণ্ডপের সার্বিক দৃশ্য ও সাংস্কৃতিক আবহ (৭)",
    "category": "theme",
    "subtitle": "11 স্টার ক্লাবের সৃজনশীল ভাবনায় শারদীয় দুর্গোৎসবের সেরা চমক",
    "url": "/gallery/fb_img_25.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 8,
    "title": "ঢাকের থিম মণ্ডপের আলোকঝলমল সন্ধ্যা (৮)",
    "category": "theme",
    "subtitle": "ভক্তি ও শিল্পের মেলবন্ধনে দেবী মহামায়ার পূজা প্রাঙ্গণ",
    "url": "/gallery/fb_img_26.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 9,
    "title": "ঢাকের কাঠামোর শৈল্পিক বিস্তার ও মণ্ডপ সজ্জা (৯)",
    "category": "theme",
    "subtitle": "ঐতিহ্যবাহী বাংলার বাদ্যযন্ত্র ঢাকের থিমে সেজে ওঠা রাজকীয় মণ্ডপ",
    "url": "/gallery/fb_img_27.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 10,
    "title": "ঢাকের থিম মণ্ডপে দর্শনার্থী সমাগম ও ভক্তি আবহ (১০)",
    "category": "theme",
    "subtitle": "শারদোৎসবে সকল স্তরের ভক্ত ও শুভানুধ্যায়ীদের মিলনমেলা",
    "url": "/gallery/fb_img_28.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 11,
    "title": "ঢাকের থিম মণ্ডপের মনোরম রাতের ভিউ (11)",
    "category": "theme",
    "subtitle": "উৎসবের চার দিন আলো ও শব্দের অপূর্ব ঐকতান",
    "url": "/gallery/fb_img_29.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 12,
    "title": "ঢাকের থিম মণ্ডপ সমাপ্তি ও বিসর্জনের স্মৃতি (১২)",
    "category": "theme",
    "subtitle": "স্মৃতির পাতায় স্বর্ণাক্ষরে লেখা শারদীয়া দুর্গোৎসব",
    "url": "/gallery/fb_img_30.jpg",
    "tag": "ঢাকের থিম মণ্ডপ"
  },
  {
    "id": 13,
    "title": "ঢাকের থিম মণ্ডপ নির্মাণ ও কাঠামোগত কাজের সূচনা (১)",
    "category": "theme",
    "subtitle": "কারিগরদের নিখুঁত হাতে গড়ে ওঠা ঢাকের নকশা ও মণ্ডপ ফ্রেম",
    "url": "/gallery/fb_img_14.jpg",
    "tag": "মণ্ডপ নির্মাণ"
  },
  {
    "id": 14,
    "title": "মণ্ডপ কাঠামো প্রস্তুতি ও প্রতিমা স্থাপনের প্রস্তুতি (২)",
    "category": "theme",
    "subtitle": "ক্লাবের উদ্যোক্তাদের সক্রিয় উপস্থিতিতে মণ্ডপ নির্মাণের অগ্রগতি",
    "url": "/gallery/fb_img_15.jpg",
    "tag": "মণ্ডপ নির্মাণ"
  },
  {
    "id": 15,
    "title": "পূজা প্রাঙ্গণ পরিচ্ছন্নতা ও থিম সাজসজ্জা অভিযান (৩)",
    "category": "theme",
    "subtitle": "ক্লাব সদস্যদের অক্লান্ত পরিশ্রমে পূজা চত্বরের চূড়ান্ত রূপদান",
    "url": "/gallery/fb_img_16.jpg",
    "tag": "মণ্ডপ প্রস্তুতি"
  },
  {
    "id": 16,
    "title": "আলোকসজ্জার পথ ধরে মণ্ডপে প্রবেশ — স্বাগত তোরণ",
    "category": "puja",
    "subtitle": "শারদীয়া দুর্গোৎসবে আলোকমালায় সজ্জিত ক্লাবের পথ ও প্রধান গেট",
    "url": "/gallery/fb_img_47.jpg",
    "tag": "আলোকসজ্জা"
  },
  {
    "id": 17,
    "title": "বর্ণাঢ্য আলোকসজ্জায় উদ্ভাসিত পূজামণ্ডপ চত্বর (১)",
    "category": "puja",
    "subtitle": "রাতের আলোয় মহামায়া মণ্ডপের মায়াবী রূপ",
    "url": "/gallery/fb_img_43.jpg",
    "tag": "আলোকসজ্জা"
  },
  {
    "id": 18,
    "title": "বর্ণাঢ্য আলোকসজ্জায় উদ্ভাসিত পূজামণ্ডপ চত্বর (২)",
    "category": "puja",
    "subtitle": "চন্দননগরের শৈল্পিক আলোর ঝলকানি ও রঙিন আলোকমাঝারি",
    "url": "/gallery/fb_img_44.jpg",
    "tag": "আলোকসজ্জা"
  },
  {
    "id": 19,
    "title": "মণ্ডপ আলোকসজ্জা ও ভক্তদের ভিড় (৩)",
    "category": "puja",
    "subtitle": "আলোকসজ্জার পথ ধরে মণ্ডপে আসুন — আপনাকে স্বাগত জানানোর অপেক্ষায়",
    "url": "/gallery/fb_img_45.jpg",
    "tag": "আলোকসজ্জা"
  },
  {
    "id": 20,
    "title": "মণ্ডপ আলোকসজ্জার আলোকঝলমল রাত (৪)",
    "category": "puja",
    "subtitle": "শারদ সন্ধ্যায় আলোকিত 11 স্টার ক্লাব প্রাঙ্গণ",
    "url": "/gallery/fb_img_46.jpg",
    "tag": "আলোকসজ্জা"
  },
  {
    "id": 21,
    "title": "মহাসপ্তমীতে পবিত্র নবপত্রিকা স্নান যাত্রা (১)",
    "category": "puja",
    "subtitle": "দেবী দুর্গার আবাহনে নদীতে পবিত্র কলাবউ স্নান পর্ব",
    "url": "/gallery/fb_img_41.jpg",
    "tag": "নবপত্রিকা স্নান"
  },
  {
    "id": 22,
    "title": "পবিত্র নবপত্রিকা স্নান ও ঘট স্থাপন (২)",
    "category": "puja",
    "subtitle": "ঢাকের বাদ্যি ও উলুধ্বনিতে মুখরিত নদীঘাট",
    "url": "/gallery/fb_img_38.jpg",
    "tag": "নবপত্রিকা স্নান"
  },
  {
    "id": 23,
    "title": "নবপত্রিকা স্নান শোভাযাত্রা (৩)",
    "category": "puja",
    "subtitle": "ক্লাবের সদস্য ও পুরোহিত মশাইয়ের উপস্থিতিতে মাঙ্গলিক অনুষ্ঠান",
    "url": "/gallery/fb_img_39.jpg",
    "tag": "নবপত্রিকা স্নান"
  },
  {
    "id": 24,
    "title": "নবপত্রিকা বরণ ও মণ্ডপ প্রবেশ (৪)",
    "category": "puja",
    "subtitle": "মহাসপ্তমীর সকালে মায়ের ঘট মণ্ডপে প্রবেশ",
    "url": "/gallery/fb_img_40.jpg",
    "tag": "নবপত্রিকা স্নান"
  },
  {
    "id": 25,
    "title": "দেবী মহামায়া ঘাটে ঐতিহ্যবাহী আল্পনার অর্ঘ্য (১)",
    "category": "cultural",
    "subtitle": "আল্পনার রেখায় ফুটে উঠেছে ভক্তি ও বাঙালি সংস্কৃতির অনুপম সৌন্দর্য",
    "url": "/gallery/fb_img_48.jpg",
    "tag": "ঘাটে আল্পনা"
  },
  {
    "id": 26,
    "title": "দেবী মহামায়া ঘাটে আল্পনার অর্ঘ্য (২)",
    "category": "cultural",
    "subtitle": "ক্লাবের সদস্যদের আন্তরিক পরিশ্রমে ঘাটের বর্ণময় আল্পনা সজ্জা",
    "url": "/gallery/fb_img_49.jpg",
    "tag": "ঘাটে আল্পনা"
  },
  {
    "id": 27,
    "title": "দেবী মহামায়া ঘাটে আল্পনার অর্ঘ্য (৩)",
    "category": "cultural",
    "subtitle": "পূজাপর্বে ভক্ত ও দর্শনার্থীদের জন্য মনোরম পরিবেশ",
    "url": "/gallery/fb_img_50.jpg",
    "tag": "ঘাটে আল্পনা"
  },
  {
    "id": 28,
    "title": "মহামায়া পূজো প্রাঙ্গণে ছোটদের বার্ষিক অঙ্কন প্রতিযোগিতা (১)",
    "category": "education",
    "subtitle": "এলাকার শতাধিক শিশু ও কিশোর-কিশোরীদের স্বতঃস্ফূর্ত অংশগ্রহণ",
    "url": "/gallery/fb_img_37.jpg",
    "tag": "অঙ্কন প্রতিযোগিতা"
  },
  {
    "id": 29,
    "title": "রঙে-তুলিতে মনের ভাব প্রকাশ — অঙ্কন প্রতিযোগিতা (২)",
    "category": "education",
    "subtitle": "ছোটদের সৃজনশীল প্রতিভা বিকাশে ক্লাবের বিশেষ উদ্যোগ",
    "url": "/gallery/fb_img_34.jpg",
    "tag": "অঙ্কন প্রতিযোগিতা"
  },
  {
    "id": 30,
    "title": "অঙ্কন প্রতিযোগিতার একাগ্র মুহূর্ত (৩)",
    "category": "education",
    "subtitle": "কচি-কাঁচাদের আঁকা ছবিতে সেজে উঠল পূজা প্রাঙ্গণ",
    "url": "/gallery/fb_img_35.jpg",
    "tag": "অঙ্কন প্রতিযোগিতা"
  },
  {
    "id": 31,
    "title": "অঙ্কন প্রতিযোগিতায় কৃতীদের সম্মাননা (৪)",
    "category": "education",
    "subtitle": "প্রতিযোগীদের উৎসাহ দিতে মেডেল ও সার্টিফিকেট প্রদান",
    "url": "/gallery/fb_img_36.jpg",
    "tag": "অঙ্কন প্রতিযোগিতা"
  },
  {
    "id": 32,
    "title": "অষ্টমী সন্ধ্যায় জয় হাজরা আনন্দ মুহূর্ত (১)",
    "category": "puja",
    "subtitle": "শারদীয়া দুর্গোৎসবে ক্লাবের সদস্য ও দর্শনার্থীদের মিলনমেলা",
    "url": "/gallery/fb_img_31.jpg",
    "tag": "মহাষ্টমী"
  },
  {
    "id": 33,
    "title": "অষ্টমী সন্ধ্যার সাংস্কৃতিক ও ভক্তি আবহ (২)",
    "category": "puja",
    "subtitle": "ধুনুচি নাচ ও ঢাকের তালে মাতোয়ারা মণ্ডপ প্রাঙ্গণ",
    "url": "/gallery/fb_img_32.jpg",
    "tag": "মহাষ্টমী"
  },
  {
    "id": 34,
    "title": "মহাষ্টমীর পুণ্য সন্ধ্যায় আলোকোজ্জ্বল স্মৃতি (৩)",
    "category": "puja",
    "subtitle": "সকলের উপস্থিতিতে আনন্দময় শারদোৎসব",
    "url": "/gallery/fb_img_33.jpg",
    "tag": "মহাষ্টমী"
  },
  {
    "id": 35,
    "title": "আবার এসো মা লক্ষ্মী — কোজাগরী লক্ষ্মীপূজা",
    "category": "puja",
    "subtitle": "ধন-ধান্য ও শান্তির কামনায় ক্লাবের কোজাগরী আরাধনা",
    "url": "/gallery/fb_img_42.jpg",
    "tag": "লক্ষ্মীপূজা"
  },
  {
    "id": 36,
    "title": "মা মহামায়ার আশীর্বাদে প্রতিটি ঘর হোক সুখ ও শান্তির আলোকময়",
    "category": "puja",
    "subtitle": "11 স্টার ক্লাবের পক্ষ থেকে আন্তরিক শুভকামনা",
    "url": "/gallery/fb_img_4.jpg",
    "tag": "শুভকামনা"
  },
  {
    "id": 37,
    "title": "শুভ বিজয়া দশমী — মা দুর্গার কৃপায় জীবন ভরে উঠুক শান্তিতে",
    "category": "puja",
    "subtitle": "সিঁদুর খেলা ও বিজয়ার প্রীতি-শুভেচ্ছা বিনিময়",
    "url": "/gallery/fb_img_5.jpg",
    "tag": "বিজয়া দশমী"
  },
  {
    "id": 38,
    "title": "কবির আলোয় আলোকিত হোক আমাদের মন — রবীন্দ্র জন্মজয়ন্তী",
    "category": "cultural",
    "subtitle": "বিশ্বকবি রবীন্দ্রনাথ ঠাকুরের প্রতি অন্তরের গভীর শ্রদ্ধাঞ্জলি",
    "url": "/gallery/fb_img_6.jpg",
    "tag": "রবীন্দ্র জয়ন্তী"
  },
  {
    "id": 39,
    "title": "মা কালীর আশীর্বাদে ভরে উঠুক জীবন — দীপাবলি ও শ্যামাপূজা",
    "category": "puja",
    "subtitle": "অশুভ শক্তির বিনাশ ও শুভ শক্তির জয় হোক",
    "url": "/gallery/fb_img_7.jpg",
    "tag": "শ্যামাপূজা"
  },
  {
    "id": 40,
    "title": "ইলেভেন স্টার ক্লাবের পক্ষ থেকে সকলকে জানাই শুভ কালীপূজা (১)",
    "category": "puja",
    "subtitle": "কালীপূজা ও দীপাবলির প্রীতি ও শুভেচ্ছা",
    "url": "/gallery/fb_img_1.jpg",
    "tag": "কালীপূজা"
  },
  {
    "id": 41,
    "title": "ইলেভেন স্টার ক্লাবের পক্ষ থেকে সকলকে জানাই শুভ কালীপূজা (২)",
    "category": "puja",
    "subtitle": "আলোর উৎসবে মঙ্গল ও শান্তির বার্তা",
    "url": "/gallery/fb_img_2.jpg",
    "tag": "কালীপূজা"
  },
  {
    "id": 42,
    "title": "ইলেভেন স্টার ক্লাবের পক্ষ থেকে সকলকে জানাই শুভ কালীপূজা (৩)",
    "category": "puja",
    "subtitle": "ভক্তি ও শ্রদ্ধায় শ্যামাপূজা উদযাপন",
    "url": "/gallery/fb_img_3.jpg",
    "tag": "কালীপূজা"
  },
  {
    "id": 43,
    "title": "জয় জগন্নাথ — পবিত্র রথযাত্রা ও স্নানযাত্রা মহোৎসব",
    "category": "puja",
    "subtitle": "জগন্নাথদেবের করুণায় সকলের মঙ্গল হোক",
    "url": "/gallery/fb_img_8.jpg",
    "tag": "জয় জগন্নাথ"
  },
  {
    "id": 44,
    "title": "শারদীয়া উৎসব স্মৃতি ও সোশ্যাল মিডিয়া পোস্ট",
    "category": "puja",
    "subtitle": "11 স্টার ক্লাবের অফিসিয়াল ফেসবুক পেজ সংকলন",
    "url": "/gallery/fb_img_9.jpg",
    "tag": "উৎসব স্মৃতি"
  },
  {
    "id": 45,
    "title": "স্বাধীনতা দিবস উদযাপন ও জাতীয় পতাকা উত্তোলন (১)",
    "category": "social",
    "subtitle": "১৫ই আগস্ট ক্লাবের পক্ষ থেকে দেশপ্রেম ও শ্রদ্ধার্ঘ্য নিবেদন",
    "url": "/gallery/fb_img_10.jpg",
    "tag": "স্বাধীনতা দিবস"
  },
  {
    "id": 46,
    "title": "স্বাধীনতা দিবসে জাতীয় পতাকা উত্তোলন ও শোভাযাত্রা (২)",
    "category": "social",
    "subtitle": "গ্রামের বিশিষ্ট ব্যক্তিবর্গ ও ক্লাবের সকল সদস্যের উপস্থিতি",
    "url": "/gallery/fb_img_11.jpg",
    "tag": "স্বাধীনতা দিবস"
  },
  {
    "id": 47,
    "title": "স্বাধীনতা দিবসে মিষ্টিমুখ ও দেশাত্মবোধক অনুষ্ঠান (৩)",
    "category": "social",
    "subtitle": "একতা ও ভ্রাতৃত্বের মেলবন্ধন",
    "url": "/gallery/fb_img_12.jpg",
    "tag": "স্বাধীনতা দিবস"
  },
  {
    "id": 48,
    "title": "শারদীয়া পূজার প্রস্তুতি সভা ও পরিকল্পনা বৈঠক",
    "category": "social",
    "subtitle": "মণ্ডপ নির্মাণ ও কর্মসূচি বিষয়ে কর্মকর্তা ও সদস্যদের বৈঠক",
    "url": "/gallery/fb_img_13.jpg",
    "tag": "প্রস্তুতি সভা"
  },
  {
    "id": 49,
    "title": "পূজার প্রসাদ প্রস্তুত ও ভোগ বিতরণের মুহূর্ত (১)",
    "category": "social",
    "subtitle": "হাজারো দর্শনার্থীর মাঝে পরম শ্রদ্ধায় মহাপ্রসাদ বিতরণ",
    "url": "/gallery/fb_img_17.jpg",
    "tag": "মহাপ্রসাদ"
  },
  {
    "id": 50,
    "title": "পূজার প্রসাদ প্রস্তুত ও ভোগ বিতরণের মুহূর্ত (২)",
    "category": "social",
    "subtitle": "সুশৃঙ্খলভাবে সর্বস্তরের মানুষের মাঝে অন্ন প্রসাদ পরিবেশন",
    "url": "/gallery/fb_img_18.jpg",
    "tag": "মহাপ্রসাদ"
  }
];

export const TREE_PLANTATION_PHOTOS: TreePlantationPhotoItem[] = [
  {
    id: "tree-drive-1",
    title: "খুকুড়দহ গ্রামে বৃক্ষরোপণ অভিযানের শুভ সূচনা",
    category: "plantation",
    subtitle: "গ্রামের পথঘাট ও পতিত জমিতে ক্লাবের পক্ষ থেকে সবুজায়ন অভিযান",
    url: "/drive_photos/tree_plantation/IMG-20250924-WA0014.jpg",
    tag: "বৃক্ষরোপণ অভিযান",
    year: "২০২৫"
  },
  {
    id: "tree-drive-2",
    title: "মেঠোপথের ধারে সারিবদ্ধ বনজ ও ফলদ চারা রোপণ",
    category: "plantation",
    subtitle: "রাস্তার দুই পাশে ছায়াসুনিবিড় পরিবেশ গড়ে তোলার ক্লাব উদ্যোগ",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0020.jpg",
    tag: "পথবৃক্ষ রোপণ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-3",
    title: "সবুজ খুকুড়দহ অভিযান — ক্লাবের সদস্য ও সমাজসেবীদের কর্মযজ্ঞ",
    category: "plantation",
    subtitle: "মাটি প্রস্তুত ও নতুন চারার বনায়নে সম্মিলিত শ্রমদান",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0024.jpg",
    tag: "বনায়ন উদ্যোগ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-4",
    title: "নবীন চারার রোপণ ও প্রাথমিক সার প্রয়োগ",
    category: "care",
    subtitle: "গাছ লাগানোর পাশাপাশি অনুকূল জৈব সার ও যত্ন নিশ্চিতকরণ",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0027.jpg",
    tag: "চারা পরিচর্যা",
    year: "২০২৬"
  },
  {
    id: "tree-drive-5",
    title: "রোপিত চারার নিবিড় তদারকি ও নিয়মিত জলসিঞ্চন",
    category: "care",
    subtitle: "প্রতিটি চারা যাতে সুন্দরভাবে বেড়ে উঠতে পারে তার দৈনিক পরিচর্যা",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0028.jpg",
    tag: "চারা পরিচর্যা",
    year: "২০২৬"
  },
  {
    id: "tree-drive-6",
    title: "ফলদ ও ঔষধি চারা রোপণ কর্মসূচি",
    category: "distribution",
    subtitle: "আম, জাম, নিম ও বহেরা চারার সুপরিকল্পিত রোপণ",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0029.jpg",
    tag: "ফলদ চারা",
    year: "২০২৬"
  },
  {
    id: "tree-drive-7",
    title: "গ্রামীণ মেঠোপথের সবুজ বেষ্টনী গঠন",
    category: "plantation",
    subtitle: "প্রকৃতির বুক চিরে গড়ে ওঠা ছায়াময় পথ",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0030.jpg",
    tag: "পথবৃক্ষ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-8",
    title: "ক্লাব প্রাঙ্গণ ও সংলগ্ন মাঠে বৃক্ষরোপণ সমাবেশ",
    category: "plantation",
    subtitle: "ক্লাবের সদস্যদের স্বতঃস্ফূর্ত অংশগ্রহণে চারাগাছ লাগানো",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0031.jpg",
    tag: "সবুজ প্রাঙ্গণ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-9",
    title: "যুবসমাজের হাত ধরে সবুজ বিপ্লব — 11 স্টার ক্লাবের শপথ",
    category: "awareness",
    subtitle: "একটি গাছ একটি প্রাণ — ভবিষ্যৎ প্রজন্মের সুরক্ষায় গাছ লাগান",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0032.jpg",
    tag: "পরিবেশ সচেতনতা",
    year: "২০২৬"
  },
  {
    id: "tree-drive-10",
    title: "গ্রামবাসীর মাঝে বিনামূল্যে চারাগাছ বিতরণ ও উপহার",
    category: "distribution",
    subtitle: "বাড়ির আঙিনায় রোপণের জন্য সাধারণ মানুষের হাতে চারা তুলে দেওয়া",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0033.jpg",
    tag: "চারাগাছ বিতরণ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-11",
    title: "ঔষধি উদ্ভিদের নার্সারি ও বিশেষ বৃক্ষরোপণ",
    category: "distribution",
    subtitle: "তুলসী, নিম ও বাসক চারার পরিবেশ সংরক্ষণ প্রদর্শনী",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0034.jpg",
    tag: "ঔষধি চারা",
    year: "২০২৬"
  },
  {
    id: "tree-drive-12",
    title: "পরিবেশ দিবস ও সবুজ সচেতনতা শিবির",
    category: "awareness",
    subtitle: "প্লাস্টিক বর্জন ও বৃক্ষ সংরক্ষণের বার্তা পৌঁছে দেওয়া",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0035.jpg",
    tag: "সচেতনতা শিবির",
    year: "২০২৬"
  },
  {
    id: "tree-drive-13",
    title: "চারাগাছের চারপাশে সুরক্ষাবেষ্টনী ও বাঁশের খাঁচা স্থাপন",
    category: "care",
    subtitle: "গবাদি পশু ও বাইরের ক্ষতি থেকে চারা রক্ষা করতে নিরাপত্তা বেষ্টনী",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0036.jpg",
    tag: "সুরক্ষা বেড়া",
    year: "২০২৬"
  },
  {
    id: "tree-drive-14",
    title: "সবুজায়ন প্রকল্পের অগ্রগতি ও চারা বৃদ্ধি পরিদর্শন",
    category: "care",
    subtitle: "ক্লাব নেতৃত্বের পক্ষ থেকে রোপিত গাছের নিয়মিত তদারকি",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0037.jpg",
    tag: "পরিদর্শন",
    year: "২০২৬"
  },
  {
    id: "tree-drive-15",
    title: "প্রকৃতি ও পরিবেশ সংরক্ষণে ক্লাবের সার্বিক অঙ্গীকার",
    category: "awareness",
    subtitle: "সবুজ গ্রাম, সুস্থ সমাজ গড়ে তোলার দৃপ্ত প্রত্যয়",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0038.jpg",
    tag: "পরিবেশ সুরক্ষা",
    year: "২০২৬"
  },
  {
    id: "tree-drive-16",
    title: "নির্মল বাতাস ও জীববৈচিত্র্য রক্ষায় বনায়ন কর্মসূচি",
    category: "plantation",
    subtitle: "অক্সিজেনের অবাধ প্রবাহ নিশ্চিত করতে বৃক্ষরোপণ",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0039.jpg",
    tag: "বনায়ন",
    year: "২০২৬"
  },
  {
    id: "tree-drive-17",
    title: "ঐক্যবদ্ধ প্রচেষ্টায় সবুজ খুকুড়দহ গড়ার কর্মপ্রয়াস",
    category: "plantation",
    subtitle: "গ্রামের যুব ও প্রবীণদের সম্মিলিত বৃক্ষরোপণ মুহূর্ত",
    url: "/drive_photos/tree_plantation/IMG-20260104-WA0040.jpg",
    tag: "ঐক্যবদ্ধ প্রয়াস",
    year: "২০২৬"
  },
  {
    id: "tree-drive-18",
    title: "২০২৬ বর্ষার প্রাক্কালে বিশেষ চারা রোপণ অভিযান",
    category: "plantation",
    subtitle: "বর্ষার আগমনে মাটিকে সতেজ করতে চারা রোপণ কর্মসূচি",
    url: "/drive_photos/tree_plantation/IMG-20260612-WA0001.jpg",
    tag: "বর্ষাকালীন রোপণ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-19",
    title: "শ্রাবণ মাসের বর্ষাকালীন বৃক্ষরোপণ উৎসব (পর্ব ১)",
    category: "plantation",
    subtitle: "শ্রাবণের বারিধারায় নতুন চারার প্রাণসঞ্চার",
    url: "/drive_photos/tree_plantation/IMG-20260726-WA0004.jpg",
    tag: "শ্রাবণ বৃক্ষরোপণ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-20",
    title: "শ্রাবণ মাসের বর্ষাকালীন বৃক্ষরোপণ উৎসব (পর্ব ২)",
    category: "plantation",
    subtitle: "গ্রামের মেঠোপথকে চিরসবুজ করার ব্রত",
    url: "/drive_photos/tree_plantation/IMG-20260726-WA0006.jpg",
    tag: "শ্রাবণ বৃক্ষরোপণ",
    year: "২০২৬"
  },
  {
    id: "tree-drive-21",
    title: "শ্রাবণ মাসের বর্ষাকালীন বৃক্ষরোপণ উৎসব (পর্ব ৩)",
    category: "care",
    subtitle: "রোপণের পর সঠিক মাটি ও বেড়া দিয়ে চারা সংরক্ষণ",
    url: "/drive_photos/tree_plantation/IMG-20260726-WA0007.jpg",
    tag: "শ্রাবণ বৃক্ষরোপণ",
    year: "২০২৬"
  },
];
