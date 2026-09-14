import json

gallery_drive_items = [
    # Maa Durga and Khuti Puja
    {
        "id": 101,
        "title": "মা মহামায়ার অপরূপ প্রতিমা রূপ — শারদীয়া দুর্গোৎসব",
        "category": "puja",
        "subtitle": "দেবী দুর্গার চিরায়ত শান্ত ও স্নেহময়ী মাতৃরূপ — ১১ স্টার ক্লাব পূজামণ্ডপ",
        "url": "/drive_photos/gallery/Maaa_WEBP_.webp",
        "tag": "দেবী প্রতিমা"
    },
    {
        "id": 102,
        "title": "ঐতিহ্যবাহী খুঁটি পূজা ২০২৩ — পূজা আয়োজনের শুভ সূচনা",
        "category": "puja",
        "subtitle": "পুরোহিতের বেদমন্ত্র উচ্চারণ ও গঙ্গাজল ছিটিয়ে মণ্ডপ নির্মাণের পবিত্র সূচনা",
        "url": "/drive_photos/gallery/Khuti_pujo_2023_WEBP_.webp",
        "tag": "খুঁটি পূজা ২০২৩"
    },
    # Ekanto Apon Pandal 2024
    {
        "id": 103,
        "title": "একান্ত আপন থিম প্যান্ডেল ২০২৪ — সম্মুখভাগের অনন্য রূপ (১)",
        "category": "theme",
        "subtitle": "সৃজনশীল ভাবনায় সেজে ওঠা ২০২৪ সালের অনবদ্য থিম মণ্ডপ",
        "url": "/drive_photos/gallery/Ekanto_apon_pandal_2024_WEBP_.webp",
        "tag": "একান্ত আপন ২০২৪"
    },
    {
        "id": 104,
        "title": "একান্ত আপন থিম প্যান্ডেল ২০২৪ — শৈল্পিক কারুকার্য ও বিস্তার (২)",
        "category": "theme",
        "subtitle": "নিখুঁত কারিগরিতে তৈরি মণ্ডপ তোরণ ও মনোরম আবহ",
        "url": "/drive_photos/gallery/Ekanto_apon_pandal_2024_WEBP__1.webp",
        "tag": "একান্ত আপন ২০২৪"
    },
    {
        "id": 105,
        "title": "একান্ত আপন থিম প্যান্ডেল ২০২৪ — রাতের আলোয় উদ্ভাসিত রূপ (৩)",
        "category": "theme",
        "subtitle": "আলোকসজ্জার মায়াবী রূপ ও দর্শনার্থীদের অপার মুগ্ধতা",
        "url": "/drive_photos/gallery/Ekanto_apon_pandal_2024_WEBP__2.webp",
        "tag": "একান্ত আপন ২০২৪"
    },
    # Pujo Pandal
    {
        "id": 106,
        "title": "শারদীয় দুর্গোৎসবের রাজকীয় পূজামণ্ডপ প্রাঙ্গণ",
        "category": "theme",
        "subtitle": "দূর-দূরান্ত থেকে আসা ভক্ত ও দর্শনার্থীদের মিলনমেলা",
        "url": "/drive_photos/gallery/Pujo_pandal_WEBP_.webp",
        "tag": "পূজামণ্ডপ"
    },
    # Dhunuchi Dance
    {
        "id": 107,
        "title": "ঢাকের তালে ধুনুচি নাচের আনন্দধারা (পর্ব ১)",
        "category": "puja",
        "subtitle": "ধুনুচির ধোঁয়া আর ঢাকের কাঠি সহযোগে মাতৃবন্দনার আবেগঘন মুহূর্ত",
        "url": "/drive_photos/gallery/Dhunuchi_nach_er_pala_WEBP_.webp",
        "tag": "ধুনুচি নাচ"
    },
    {
        "id": 108,
        "title": "ধুনুচি নৃত্যের উন্মাদনা ও উৎসবের তাল (পর্ব ২)",
        "category": "puja",
        "subtitle": "সন্ধ্যা আরতির পর ক্লাবের সদস্য ও ভক্তদের আনন্দোচ্ছ্বাস",
        "url": "/drive_photos/gallery/Dhunuchi_nach_er_pala_WEBP__1.webp",
        "tag": "ধুনুচি নাচ"
    },
    # Saraswati Puja & Radhe Radhe
    {
        "id": 109,
        "title": "বাগদেবী শ্রী শ্রী সরস্বতী পূজা ২০২৪ — বিদ্যার দেবীর আরাধনা",
        "category": "puja",
        "subtitle": "বসন্ত পঞ্চমীতে শিক্ষার্থী ও ক্লাবের যৌথ আয়োজনে সরস্বতী বন্দনা",
        "url": "/drive_photos/gallery/Saraswati_puja_2024_WEBP_.webp",
        "tag": "সরস্বতী পূজা ২০২৪"
    },
    {
        "id": 110,
        "title": "রাঁধে রাঁধে — নামসংকীর্তন ও ভক্তিগীতি পরিবেশনা",
        "category": "cultural",
        "subtitle": "পবিত্র আবহে প্রভুর নামস্মরণ ও আধ্যাত্মিক মিলনমেলা",
        "url": "/drive_photos/gallery/Radhe_radhe____WEBP_.webp",
        "tag": "ভক্তি উৎসব"
    },
    # Memorable Night (1 to 8)
    {
        "id": 111,
        "title": "স্মরণীয় রাত — ক্লাবের ভ্রাতৃত্ব ও আনন্দ আড্ডা (১)",
        "category": "memories",
        "subtitle": "মণ্ডপ চত্বরে ক্লাবের ভাই-বন্ধুদের অবিস্মরণীয় মুহূর্ত",
        "url": "/drive_photos/gallery/Memorable_night_WEBP_.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 112,
        "title": "স্মরণীয় রাত — আলোকঝলমল সন্ধ্যা ও উৎসব মুখরতা (২)",
        "category": "memories",
        "subtitle": "উৎসবের দিনগুলোতে হাসিমুখ আর প্রাণের বাঁধন",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__1.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 113,
        "title": "স্মরণীয় রাত — গান, আড্ডা ও স্মৃতিচারণ (৩)",
        "category": "memories",
        "subtitle": "পূজার দিনগুলির এই অমূল্য অনুভূতি চিরকাল হৃদয়ে গাঁথা থাকবে",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__2.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 114,
        "title": "স্মরণীয় রাত — ক্লাবের সদস্যদের প্রীতি সমাবেশ (৪)",
        "category": "memories",
        "subtitle": "এক পরিবার, এক মন — ইলেভেন স্টার ক্লাবের শক্তি",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__3.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 115,
        "title": "স্মরণীয় রাত — রাতের মণ্ডপে আলোকোজ্জ্বল গল্পগাথা (৫)",
        "category": "memories",
        "subtitle": "মণ্ডপ রক্ষার রাতজাগা তদারকি ও বন্ধুদের মেলবন্ধন",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__4.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 116,
        "title": "স্মরণীয় রাত — উৎসব শেষের মায়াবী অনুভূতি (৬)",
        "category": "memories",
        "subtitle": "বিদায়বেলার ক্ষণে প্রিয়জনদের এক ফ্রেমে বাঁধার মুহূর্ত",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__5.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 117,
        "title": "স্মরণীয় রাত — ক্লাবের প্রাণবন্ত মিলনমেলা (৭)",
        "category": "memories",
        "subtitle": "উৎসব হোক বা সমাজসেবা, আমরা সদা জাগ্রত",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__6.webp",
        "tag": "স্মরণীয় রাত"
    },
    {
        "id": 118,
        "title": "স্মরণীয় রাত — হৃদয়ের মণিকোঠায় শারদ স্মৃতি (৮)",
        "category": "memories",
        "subtitle": "আবার আসিব ফিরে এই উৎসব প্রাঙ্গণে",
        "url": "/drive_photos/gallery/Memorable_night_WEBP__7.webp",
        "tag": "স্মরণীয় রাত"
    },
    # Proud Moments (1 to 4)
    {
        "id": 119,
        "title": "ক্লাবের গর্বের মুহূর্ত — বিশেষ সম্মাননা ও স্বীকৃতি অর্জন (১)",
        "category": "social",
        "subtitle": "পূজা সজ্জা ও সামাজিক সেবামূলক কাজের জন্য প্রাপ্ত শিরোপা",
        "url": "/drive_photos/gallery/Proud_movement_WEBP_.webp",
        "tag": "গর্বের মুহূর্ত"
    },
    {
        "id": 120,
        "title": "সম্মাননা স্মারক গ্রহণ ও আনন্দ উদযাপন (২)",
        "category": "social",
        "subtitle": "ক্লাব নেতৃত্বের হাতে পদক ও স্মারক তুলে দেওয়ার ঐতিহাসিক মুহূর্ত",
        "url": "/drive_photos/gallery/Proud_movement_WEBP__1.webp",
        "tag": "গর্বের মুহূর্ত"
    },
    {
        "id": 121,
        "title": "পুরস্কার মঞ্চে ইলেভেন স্টার ক্লাবের বিজয়ীর হাসি (৩)",
        "category": "social",
        "subtitle": "সকল সদস্য ও পাড়াবাসীর অক্লান্ত পরিশ্রমের ফল",
        "url": "/drive_photos/gallery/Proud_movement_WEBP__2.webp",
        "tag": "গর্বের মুহূর্ত"
    },
    {
        "id": 122,
        "title": "ঐতিহাসিক সাফল্য ও নতুন উদ্দীপনায় পথচলা (৪)",
        "category": "social",
        "subtitle": "সমাজসেবা ও সংস্কৃতির অগ্রযাত্রায় এক উজ্জ্বল মাইলফলক",
        "url": "/drive_photos/gallery/Proud_movement_WEBP__3.webp",
        "tag": "গর্বের মুহূর্ত"
    },
    # Painting compilation (1 & 2)
    {
        "id": 123,
        "title": "বসে আঁকো প্রতিযোগিতা — শিশুদের রঙ-তুলির মেলা (১)",
        "category": "cultural",
        "subtitle": "ছোট ছোট শিল্পীদের ক্যানভাসে ফুটে ওঠা সৃজনশীল স্বপ্ন",
        "url": "/drive_photos/gallery/Painting_compilation_WEBP_.webp",
        "tag": "অঙ্কন প্রতিযোগিতা"
    },
    {
        "id": 124,
        "title": "চিত্রাঙ্কন প্রতিযোগিতা ও পুরস্কার বিতরণ সংকলন (২)",
        "category": "cultural",
        "subtitle": "আগামী প্রজন্মের প্রতিভা বিকাশে ক্লাবের নিয়মিত উদ্যোগ",
        "url": "/drive_photos/gallery/Painting_compilation_WEBP__1.webp",
        "tag": "অঙ্কন প্রতিযোগিতা"
    },
    # WhatsApp photos
    {
        "id": 125,
        "title": "শারদীয়া উৎসবের প্রস্তুতি বৈঠক ও ক্ষেত্র পরিদর্শন",
        "category": "puja",
        "subtitle": "মণ্ডপ নির্মাণের তদারকি ও সদস্যদের সক্রিয় অংশগ্রহণ",
        "url": "/drive_photos/gallery/IMG-20250930-WA0005.jpg",
        "tag": "পূজা প্রস্তুতি"
    },
    {
        "id": 126,
        "title": "মহালয়ার পুণ্যলগ্নে পূজামণ্ডপ চত্বরে ভক্তি আবহ",
        "category": "puja",
        "subtitle": "দেবীপক্ষের শুভলগ্নে মায়ের আহ্বান ও প্রস্তুতি পর্ব",
        "url": "/drive_photos/gallery/IMG-20251003-WA0005.jpg",
        "tag": "মহালয়া ও বোধন"
    },
    {
        "id": 127,
        "title": "মণ্ডপে ভক্ত ও পুণ্যার্থীদের আনন্দঘন আগমন",
        "category": "puja",
        "subtitle": "শারদপ্রভাতে মায়ের চরণে অঞ্জলি প্রদানের দৃশ্য",
        "url": "/drive_photos/gallery/IMG-20251003-WA0006.jpg",
        "tag": "উৎসব আবহ"
    },
    {
        "id": 128,
        "title": "রাতের আলোয় উদ্ভাসিত দেবীপ্রতিমা ও মণ্ডপ",
        "category": "puja",
        "subtitle": "আলোকসজ্জার দীপ্তিতে মায়াবী হয়ে ওঠা পূজা অঙ্গন",
        "url": "/drive_photos/gallery/IMG-20251003-WA0007.jpg",
        "tag": "আলোকসজ্জা"
    },
    # Instagram Highlights 1 to 15
    {
        "id": 129,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — শারদ স্মৃতির ঝলক (১)",
        "category": "memories",
        "subtitle": "ক্লাবের অফিশিয়াল পেজে প্রকাশিত আনন্দোচ্ছ্বাসের মুহূর্ত",
        "url": "/drive_photos/gallery/Instagram_-_1788187084031_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 130,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — মণ্ডপ পরিক্রমা ও স্মৃতি (২)",
        "category": "memories",
        "subtitle": "দর্শনার্থীদের বাঁধভাঙা উচ্ছ্বাস ও উৎসবের দিনগুলি",
        "url": "/drive_photos/gallery/Instagram_-_1788187084035_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 131,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — ভক্তি ও সংস্কৃতির মেলবন্ধন (৩)",
        "category": "cultural",
        "subtitle": "পূজার আবহে সম্প্রীতি ও একতার জয়গান",
        "url": "/drive_photos/gallery/Instagram_-_1788187084038_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 132,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — উৎসব অঙ্গনে তারুণ্যের দীপ্তি (৪)",
        "category": "memories",
        "subtitle": "ক্লাবের যুবশক্তির আন্তরিক সহায়তায় পরিচালিত পূজার দিন",
        "url": "/drive_photos/gallery/Instagram_-_1788187238616_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 133,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — আনন্দমুখর পুণ্যসন্ধ্যা (৫)",
        "category": "puja",
        "subtitle": "মহাষ্টমীর সন্ধিপূজার মাহাত্ম্য ও আনন্দ মুহূর্ত",
        "url": "/drive_photos/gallery/Instagram_-_1788187238624_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 134,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — হৃদয়ের টানে মণ্ডপ চত্বরে (৬)",
        "category": "memories",
        "subtitle": "গ্রাম ও দূর-দূরান্তের শুভানুধ্যায়ীদের উপস্থিতি",
        "url": "/drive_photos/gallery/Instagram_-_1788187238626_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 135,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — সাংস্কৃতিক অনুষ্ঠানের মুহূর্ত (৭)",
        "category": "cultural",
        "subtitle": "বিশিষ্ট সংগীতশিল্পী ও কলাকুশলীদের সাথে মঞ্চের ছবি",
        "url": "/drive_photos/gallery/Instagram_-_1788187238627_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 136,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — আলোকোজ্জ্বল পূজা তোরণ (৮)",
        "category": "theme",
        "subtitle": "চন্দননগরের শৈল্পিক আলোয় উদ্ভাসিত প্রবেশদ্বার",
        "url": "/drive_photos/gallery/Instagram_-_1788187261312_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 137,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — ভ্রাতৃত্ব ও আনন্দের দিনগুলি (৯)",
        "category": "social",
        "subtitle": "ইলেভেন স্টার ক্লাবের পরিবারের সকলের সম্মিলিত হাসি",
        "url": "/drive_photos/gallery/Instagram_-_1788187261315_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 138,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — রাতের জাদুকরী আলোকসজ্জা (১০)",
        "category": "theme",
        "subtitle": "আলোকমালায় সেজে ওঠা মণ্ডপ ও নাটমন্দির",
        "url": "/drive_photos/gallery/Instagram_-_1788187283828_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 139,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — বন্ধুদের অক্লান্ত পরিশ্রম ও আনন্দ (১১)",
        "category": "memories",
        "subtitle": "পূজাকে সফল করতে দিনরাত এক করা স্মৃতি",
        "url": "/drive_photos/gallery/Instagram_-_1788187283833_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 140,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — ভক্তিভরে পুষ্পাঞ্জলি নিবেদন (১২)",
        "category": "puja",
        "subtitle": "সকলের মঙ্গল কামনায় দেবী মহামায়ার চরণে প্রণাম",
        "url": "/drive_photos/gallery/Instagram_-_1788187283835_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 141,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — ক্লাবের গৌরবময় অভিযাত্রা (১৩)",
        "category": "social",
        "subtitle": "ঐতিহ্যের ধারক ও বাহক — খুকুড়দহ আড়খানা ইলেভেন স্টার ক্লাব",
        "url": "/drive_photos/gallery/Instagram_-_1788187283838_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 142,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — শারদীয়ার বিদায়ী আরতি ও আশীর্বাদ (১৪)",
        "category": "puja",
        "subtitle": "মায়ের বিদায়বেলায় শান্তিজল ও বিজয়ার বার্তা",
        "url": "/drive_photos/gallery/Instagram_-_1788187294391_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    },
    {
        "id": 143,
        "title": "সোশ্যাল মিডিয়া হাইলাইট — শুভ বিজয়ার আন্তরিক প্রীতি ও ভালোবাসা (১৫)",
        "category": "social",
        "subtitle": "ছোটদের স্নেহাশিস ও বড়দের প্রণাম সহ মিষ্টিমুখের উৎসব",
        "url": "/drive_photos/gallery/Instagram_-_1788187365917_WEBP_.webp",
        "tag": "সোশ্যাল মিডিয়া"
    }
]

print(f"Generated {len(gallery_drive_items)} gallery items!")
with open("gallery_drive_items.json", "w", encoding="utf-8") as f:
    json.dump(gallery_drive_items, f, ensure_ascii=False, indent=2)
