import json

with open("tree_items.json") as f:
    tree_items = json.load(f)

with open("gallery_drive_items.json") as f:
    gallery_drive_items = json.load(f)

with open("src/data/clubData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update ANNOUNCEMENTS
old_announcement = """  {
    id: 'official-notice',
    title: 'শারদীয়া উৎসব ও ক্লাবের অফিশিয়াল বিজ্ঞপ্তি',
    date: 'সর্বশেষ অফিশিয়াল নোটিশ',
    content: 'শারদীয়া দুর্গোৎসব ২০২৬, পূজা প্রস্তুতি, সাংস্কৃতিক অনুষ্ঠান ও ক্লাবের অফিশিয়াল বিজ্ঞপ্তি ও নির্দেশিকা প্রকাশ করা হয়েছে। সরাসরি গুগল ড্রাইভে গিয়ে সম্পূর্ণ নোটিশ ও প্রয়োজনীয় ফাইলগুলি দেখে নিন।',
    tag: 'অফিসিয়াল বিজ্ঞপ্তি',
    isImportant: true,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Ydrzhj7YG18vojzvmJrD1rmAU25md8c1',
    driveFolderTitle: 'গুগল ড্রাইভে অফিশিয়াল বিজ্ঞপ্তি ও ফাইল দেখুন',
  },"""

new_announcement = """  {
    id: 'official-notice',
    title: 'শারদীয়া উৎসব ও ক্লাবের অফিশিয়াল বিজ্ঞপ্তি',
    date: 'সর্বশেষ অফিশিয়াল নোটিশ',
    content: 'শারদীয়া দুর্গোৎসব ২০২৬, পূজা প্রস্তুতি, সাংস্কৃতিক অনুষ্ঠান ও ক্লাবের অফিশিয়াল বিজ্ঞপ্তি ও নির্দেশিকা প্রকাশ করা হয়েছে। সরাসরি গুগল ড্রাইভে গিয়ে সম্পূর্ণ নোটিশ ও প্রয়োজনীয় ফাইলগুলি দেখে নিন।',
    tag: 'অফিসিয়াল বিজ্ঞপ্তি',
    isImportant: true,
    image: '/drive_photos/notice_board/IMG-20260723-WA0000.jpg',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1Ydrzhj7YG18vojzvmJrD1rmAU25md8c1',
    driveFolderTitle: 'গুগল ড্রাইভে অফিশিয়াল বিজ্ঞপ্তি ও ফাইল দেখুন',
  },"""

if old_announcement in content:
    content = content.replace(old_announcement, new_announcement)
    print("Updated ANNOUNCEMENTS with official notice photo!")
else:
    print("Could not find old_announcement exact match, check lines.")

# 2. Extract existing GALLERY_PHOTOS
# We want to prepend the 43 gallery_drive_items to GALLERY_PHOTOS
gallery_start_str = "export const GALLERY_PHOTOS: GalleryPhotoItem[] = ["
tree_start_str = "export const TREE_PLANTATION_PHOTOS: TreePlantationPhotoItem[] = ["

idx_gallery = content.find(gallery_start_str)
idx_tree = content.find(tree_start_str)

if idx_gallery != -1 and idx_tree != -1:
    before_gallery = content[:idx_gallery + len(gallery_start_str)]
    gallery_and_rest = content[idx_gallery + len(gallery_start_str):]
    
    # In gallery_and_rest, find where `];` ends the GALLERY_PHOTOS before `export const TREE_PLANTATION_PHOTOS`
    end_gallery_idx = gallery_and_rest.find("\n];\n\nexport const TREE_PLANTATION_PHOTOS")
    if end_gallery_idx == -1:
        end_gallery_idx = gallery_and_rest.find("];\n\nexport const TREE_PLANTATION_PHOTOS")
    
    existing_gallery_code = gallery_and_rest[:end_gallery_idx].strip()
    after_gallery = gallery_and_rest[end_gallery_idx:]
    
    # Format gallery_drive_items as TypeScript
    gallery_ts_chunks = []
    for item in gallery_drive_items:
        ts = f"""  {{
    id: {item['id']},
    title: {json.dumps(item['title'], ensure_ascii=False)},
    category: {json.dumps(item['category'])},
    subtitle: {json.dumps(item['subtitle'], ensure_ascii=False)},
    url: {json.dumps(item['url'])},
    tag: {json.dumps(item['tag'], ensure_ascii=False)}
  }},"""
        gallery_ts_chunks.append(ts)
    
    new_gallery_code = "\n" + "\n".join(gallery_ts_chunks) + "\n" + existing_gallery_code
    
    # Now replace TREE_PLANTATION_PHOTOS with our 21 authentic items
    tree_ts_chunks = []
    for item in tree_items:
        ts = f"""  {{
    id: {json.dumps(item['id'])},
    title: {json.dumps(item['title'], ensure_ascii=False)},
    category: {json.dumps(item['category'])},
    subtitle: {json.dumps(item['subtitle'], ensure_ascii=False)},
    url: {json.dumps(item['url'])},
    tag: {json.dumps(item['tag'], ensure_ascii=False)},
    year: {json.dumps(item['year'], ensure_ascii=False)}
  }},"""
        tree_ts_chunks.append(ts)
    
    new_tree_code = "export const TREE_PLANTATION_PHOTOS: TreePlantationPhotoItem[] = [\n" + "\n".join(tree_ts_chunks) + "\n];\n"
    
    full_new_content = before_gallery + new_gallery_code + "\n];\n\n" + new_tree_code
    
    with open("src/data/clubData.ts", "w", encoding="utf-8") as f:
        f.write(full_new_content)
    print("Successfully updated src/data/clubData.ts with all gallery and tree plantation photos!")
else:
    print(f"Error: idx_gallery={idx_gallery}, idx_tree={idx_tree}")
