#!/usr/bin/env python3
"""Regenerates Data/Zalo10-stickers.json from the pack folders in Data/Zalo10/.

Run from the repo root after adding or removing stickers:
    python3 tools/gen_sticker_manifest.py

Each sub-folder of Data/Zalo10/ is one pack. The app downloads this manifest to
fill the sticker Shop, so a pack only shows up there once it is listed here.
"""
import json
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PACKS_DIR = os.path.join(ROOT, "Data", "Zalo10")
OUT_FILE = os.path.join(ROOT, "Data", "Zalo10-stickers.json")
EXTS = (".png", ".gif", ".jpg", ".jpeg", ".webp")


def main():
    packs = []
    for name in sorted(os.listdir(PACKS_DIR), key=lambda s: s.lower()):
        folder = os.path.join(PACKS_DIR, name)
        if not os.path.isdir(folder):
            continue
        files = sorted(f for f in os.listdir(folder) if f.lower().endswith(EXTS))
        if not files:
            continue
        size = sum(os.path.getsize(os.path.join(folder, f)) for f in files)
        packs.append({
            "id": name,
            "name": name,
            "count": len(files),
            "size": size,
            "animated": any(f.lower().endswith(".gif") for f in files),
            "files": files,
        })

    with open(OUT_FILE, "w", encoding="utf-8", newline="\n") as fh:
        json.dump({"version": 1, "packs": packs}, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    print("Wrote %s: %d packs, %d stickers" % (
        os.path.relpath(OUT_FILE, ROOT), len(packs), sum(p["count"] for p in packs)))


if __name__ == "__main__":
    main()
