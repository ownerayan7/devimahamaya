import json

with open('drive_manifest.json') as f:
    manifest = json.load(f)

# 1. Tree plantation
tree_items = [
    {
        "id": "tree-drive-1",
        "title": "খুকুড়দহ গ্রামে বৃক্ষরোপণ অভিযানের শুভ সূচনা",
        "category": "plantation",
        "subtitle": "গ্রামের পথঘাট ও পতিত জমিতে ক্লাবের পক্ষ থেকে সবুজায়ন অভিযান",
        "url": "/drive_photos/tree_plantation/IMG-20250924-WA0014.jpg",
        "tag": "বৃক্ষরোপণ অভিযান",
        "year": "২০২৫"
    },
    {
        "id": "tree-drive-2",
        "title": "মেঠোপথের ধারে সারিবদ্ধ বনজ ও ফলদ চারা রোপণ",
        "category": "plantation",
        "subtitle": "রাস্তার দুই পাশে ছায়াসুনিবিড় পরিবেশ গড়ে তোলার ক্লাব উদ্যোগ",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0020.jpg",
        "tag": "পথবৃক্ষ রোপণ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-3",
        "title": "সবুজ খুকুড়দহ অভিযান — ক্লাবের সদস্য ও সমাজসেবীদের কর্মযজ্ঞ",
        "category": "plantation",
        "subtitle": "মাটি প্রস্তুত ও নতুন চারার বনায়নে সম্মিলিত শ্রমদান",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0024.jpg",
        "tag": "বনায়ন উদ্যোগ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-4",
        "title": "নবীন চারার রোপণ ও প্রাথমিক সার প্রয়োগ",
        "category": "care",
        "subtitle": "গাছ লাগানোর পাশাপাশি অনুকূল জৈব সার ও যত্ন নিশ্চিতকরণ",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0027.jpg",
        "tag": "চারা পরিচর্যা",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-5",
        "title": "রোপিত চারার নিবিড় তদারকি ও নিয়মিত জলসিঞ্চন",
        "category": "care",
        "subtitle": "প্রতিটি চারা যাতে সুন্দরভাবে বেড়ে উঠতে পারে তার দৈনিক পরিচর্যা",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0028.jpg",
        "tag": "চারা পরিচর্যা",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-6",
        "title": "ফলদ ও ঔষধি চারা রোপণ কর্মসূচি",
        "category": "distribution",
        "subtitle": "আম, জাম, নিম ও বহেরা চারার সুপরিকল্পিত রোপণ",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0029.jpg",
        "tag": "ফলদ চারা",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-7",
        "title": "গ্রামীণ মেঠোপথের সবুজ বেষ্টনী গঠন",
        "category": "plantation",
        "subtitle": "প্রকৃতির বুক চিরে গড়ে ওঠা ছায়াময় পথ",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0030.jpg",
        "tag": "পথবৃক্ষ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-8",
        "title": "ক্লাব প্রাঙ্গণ ও সংলগ্ন মাঠে বৃক্ষরোপণ সমাবেশ",
        "category": "plantation",
        "subtitle": "ক্লাবের সদস্যদের স্বতঃস্ফূর্ত অংশগ্রহণে চারাগাছ লাগানো",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0031.jpg",
        "tag": "সবুজ প্রাঙ্গণ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-9",
        "title": "যুবসমাজের হাত ধরে সবুজ বিপ্লব — ১১ স্টার ক্লাবের শপথ",
        "category": "awareness",
        "subtitle": "একটি গাছ একটি প্রাণ — ভবিষ্যৎ প্রজন্মের সুরক্ষায় গাছ লাগান",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0032.jpg",
        "tag": "পরিবেশ সচেতনতা",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-10",
        "title": "গ্রামবাসীর মাঝে বিনামূল্যে চারাগাছ বিতরণ ও উপহার",
        "category": "distribution",
        "subtitle": "বাড়ির আঙিনায় রোপণের জন্য সাধারণ মানুষের হাতে চারা তুলে দেওয়া",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0033.jpg",
        "tag": "চারাগাছ বিতরণ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-11",
        "title": "ঔষধি উদ্ভিদের নার্সারি ও বিশেষ বৃক্ষরোপণ",
        "category": "distribution",
        "subtitle": "তুলসী, নিম ও বাসক চারার পরিবেশ সংরক্ষণ প্রদর্শনী",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0034.jpg",
        "tag": "ঔষধি চারা",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-12",
        "title": "পরিবেশ দিবস ও সবুজ সচেতনতা শিবির",
        "category": "awareness",
        "subtitle": "প্লাস্টিক বর্জন ও বৃক্ষ সংরক্ষণের বার্তা পৌঁছে দেওয়া",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0035.jpg",
        "tag": "সচেতনতা শিবির",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-13",
        "title": "চারাগাছের চারপাশে সুরক্ষাবেষ্টনী ও বাঁশের খাঁচা স্থাপন",
        "category": "care",
        "subtitle": "গবাদি পশু ও বাইরের ক্ষতি থেকে চারা রক্ষা করতে নিরাপত্তা বেষ্টনী",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0036.jpg",
        "tag": "সুরক্ষা বেড়া",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-14",
        "title": "সবুজায়ন প্রকল্পের অগ্রগতি ও চারা বৃদ্ধি পরিদর্শন",
        "category": "care",
        "subtitle": "ক্লাব নেতৃত্বের পক্ষ থেকে রোপিত গাছের নিয়মিত তদারকি",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0037.jpg",
        "tag": "পরিদর্শন",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-15",
        "title": "প্রকৃতি ও পরিবেশ সংরক্ষণে ক্লাবের সার্বিক অঙ্গীকার",
        "category": "awareness",
        "subtitle": "সবুজ গ্রাম, সুস্থ সমাজ গড়ে তোলার দৃপ্ত প্রত্যয়",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0038.jpg",
        "tag": "পরিবেশ সুরক্ষা",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-16",
        "title": "নির্মল বাতাস ও জীববৈচিত্র্য রক্ষায় বনায়ন কর্মসূচি",
        "category": "plantation",
        "subtitle": "অক্সিজেনের অবাধ প্রবাহ নিশ্চিত করতে বৃক্ষরোপণ",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0039.jpg",
        "tag": "বনায়ন",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-17",
        "title": "ঐক্যবদ্ধ প্রচেষ্টায় সবুজ খুকুড়দহ গড়ার কর্মপ্রয়াস",
        "category": "plantation",
        "subtitle": "গ্রামের যুব ও প্রবীণদের সম্মিলিত বৃক্ষরোপণ মুহূর্ত",
        "url": "/drive_photos/tree_plantation/IMG-20260104-WA0040.jpg",
        "tag": "ঐক্যবদ্ধ প্রয়াস",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-18",
        "title": "২০২৬ বর্ষার প্রাক্কালে বিশেষ চারা রোপণ অভিযান",
        "category": "plantation",
        "subtitle": "বর্ষার আগমনে মাটিকে সতেজ করতে চারা রোপণ কর্মসূচি",
        "url": "/drive_photos/tree_plantation/IMG-20260612-WA0001.jpg",
        "tag": "বর্ষাকালীন রোপণ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-19",
        "title": "শ্রাবণ মাসের বর্ষাকালীন বৃক্ষরোপণ উৎসব (পর্ব ১)",
        "category": "plantation",
        "subtitle": "শ্রাবণের বারিধারায় নতুন চারার প্রাণসঞ্চার",
        "url": "/drive_photos/tree_plantation/IMG-20260726-WA0004.jpg",
        "tag": "শ্রাবণ বৃক্ষরোপণ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-20",
        "title": "শ্রাবণ মাসের বর্ষাকালীন বৃক্ষরোপণ উৎসব (পর্ব ২)",
        "category": "plantation",
        "subtitle": "গ্রামের মেঠোপথকে চিরসবুজ করার ব্রত",
        "url": "/drive_photos/tree_plantation/IMG-20260726-WA0006.jpg",
        "tag": "শ্রাবণ বৃক্ষরোপণ",
        "year": "২০২৬"
    },
    {
        "id": "tree-drive-21",
        "title": "শ্রাবণ মাসের বর্ষাকালীন বৃক্ষরোপণ উৎসব (পর্ব ৩)",
        "category": "care",
        "subtitle": "রোপণের পর সঠিক মাটি ও বেড়া দিয়ে চারা সংরক্ষণ",
        "url": "/drive_photos/tree_plantation/IMG-20260726-WA0007.jpg",
        "tag": "শ্রাবণ বৃক্ষরোপণ",
        "year": "২০২৬"
    }
]

print(f"Generated {len(tree_items)} tree plantation items!")
with open("tree_items.json", "w", encoding="utf-8") as f:
    json.dump(tree_items, f, ensure_ascii=False, indent=2)
