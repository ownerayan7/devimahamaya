import os
import urllib.request
import re
from gdown.download_folder import download_folder

folders = [
    ('tree_plantation', '16bXexO2h9OKFGIyTGD7HZ_eFO2nwbTmk', 'public/drive_photos/tree_plantation'),
    ('gallery', '1M33TD7lAXKSQQV0qiLShPKWf2ulpOhic', 'public/drive_photos/gallery'),
    ('notice_board', '1Ydrzhj7YG18vojzvmJrD1rmAU25md8c1', 'public/drive_photos/notice_board')
]

results = {}

for cat, fid, out_dir in folders:
    os.makedirs(out_dir, exist_ok=True)
    print(f"\n================ Fetching {cat} ({fid}) ================")
    files = download_folder(id=fid, skip_download=True)
    results[cat] = []
    print(f"Total files found in {cat}: {len(files)}")
    for i, f in enumerate(files):
        clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', f.path)
        dest_path = os.path.join(out_dir, clean_name)
        url = f"https://lh3.googleusercontent.com/d/{f.id}"
        
        # Download if not already exists or size is 0
        if not os.path.exists(dest_path) or os.path.getsize(dest_path) == 0:
            print(f"[{i+1}/{len(files)}] Downloading {f.path} -> {clean_name} (ID: {f.id})...")
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=30) as resp, open(dest_path, 'wb') as out:
                    out.write(resp.read())
            except Exception as e:
                print(f"Error downloading {f.path}: {e}")
        else:
            print(f"[{i+1}/{len(files)}] Already exists: {clean_name}")
            
        results[cat].append({
            "id": f.id,
            "original_name": f.path,
            "local_path": f"/drive_photos/{cat}/{clean_name}",
            "drive_url": url,
            "file_size": os.path.getsize(dest_path) if os.path.exists(dest_path) else 0
        })

import json
with open("drive_manifest.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nFinished downloading all Drive photos!")
