"""Rebuild adopted WebP files from verified source images (requires Pillow)."""
from pathlib import Path
import argparse, hashlib, json
from PIL import Image, ImageOps
parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "docs/image-audit.json").read_text(encoding="utf-8"))
for row in manifest["images"]:
    if row["usage"] not in ("primary", "gallery"):
        continue
    source = args.source / row["source"]
    if hashlib.sha256(source.read_bytes()).hexdigest() != row["sha256"]:
        raise ValueError("Source hash mismatch: " + row["source"])
    target = root / row["optimized"]
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert("RGB")
        photo.thumbnail((1100, 1100))
        photo.save(target, "WEBP", quality=84, method=6)
print("Rebuilt adopted WebP images.")
