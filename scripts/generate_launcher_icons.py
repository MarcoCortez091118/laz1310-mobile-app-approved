#!/usr/bin/env python3
"""Derive Expo launcher PNGs from the approved LA Z icon (no artwork changes).

Usage:
    python scripts/generate_launcher_icons.py
    python scripts/generate_launcher_icons.py --check

Requires Pillow. The source WebP remains untouched.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/brand/La Z Icon.webp"
IOS_ICON = ROOT / "assets/brand/la-z-launcher-icon.png"
ANDROID_FOREGROUND = ROOT / "assets/brand/la-z-adaptive-foreground.png"
SIZE = 1024
# The full composition is inset into the Android 108dp adaptive canvas to
# protect the central LA Z artwork against circular/squircle launcher masks.
ANDROID_ART_SIZE = 608
BACKGROUND = (5, 1, 1)


def expected_assets() -> tuple[Image.Image, Image.Image]:
    with Image.open(SOURCE) as image:
        if image.format != "WEBP":
            raise ValueError("The approved launcher source must be WebP")
        if image.width != image.height or image.width < 512:
            raise ValueError("Launcher source must be square and at least 512px")
        original = image.convert("RGBA")

    # iOS/legacy Android icons must be fully opaque; composite any alpha over
    # the dark branded background rather than leaving transparent corners.
    square = original.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    ios = Image.new("RGB", (SIZE, SIZE), BACKGROUND)
    ios.paste(square, (0, 0), square.getchannel("A"))

    # Android foreground requires transparency outside the artwork. The
    # adaptive icon background stays configured as #050101 in app.config.js.
    adaptive = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    artwork = original.resize(
        (ANDROID_ART_SIZE, ANDROID_ART_SIZE), Image.Resampling.LANCZOS
    )
    pad = (SIZE - ANDROID_ART_SIZE) // 2
    adaptive.paste(artwork, (pad, pad), artwork)
    return ios, adaptive


def check_asset(path: Path, expected: Image.Image, *, transparent: bool) -> None:
    if not path.is_file():
        raise SystemExit(f"Missing generated icon: {path.relative_to(ROOT)}")
    with Image.open(path) as opened:
        if opened.format != "PNG" or opened.size != (SIZE, SIZE):
            raise SystemExit(f"Invalid PNG size/format: {path.relative_to(ROOT)}")
        actual = opened.convert(expected.mode)
        if ImageChops.difference(actual, expected).getbbox() is not None:
            raise SystemExit(f"Stale launcher asset: {path.relative_to(ROOT)}")
        if transparent:
            if actual.getpixel((0, 0))[3] != 0:
                raise SystemExit("Adaptive foreground must have transparent padding")
            if actual.getpixel((SIZE // 2, SIZE // 2))[3] == 0:
                raise SystemExit("Adaptive foreground center must contain artwork")
        elif actual.mode != "RGB":
            raise SystemExit("Main launcher icon should not contain alpha")
        print(f"Verified: {path.relative_to(ROOT)} ({SIZE}x{SIZE})")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="verify committed PNGs")
    args = parser.parse_args()
    ios, android = expected_assets()

    if args.check:
        check_asset(IOS_ICON, ios, transparent=False)
        check_asset(ANDROID_FOREGROUND, android, transparent=True)
        return

    ios.save(IOS_ICON, format="PNG", optimize=True)
    android.save(ANDROID_FOREGROUND, format="PNG", optimize=True)
    print(f"Generated: {IOS_ICON.relative_to(ROOT)}")
    print(f"Generated: {ANDROID_FOREGROUND.relative_to(ROOT)}")
    check_asset(IOS_ICON, ios, transparent=False)
    check_asset(ANDROID_FOREGROUND, android, transparent=True)


if __name__ == "__main__":
    main()
