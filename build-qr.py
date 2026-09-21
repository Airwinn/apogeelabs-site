#!/usr/bin/env python3
"""Regenerate the QR codes in qr/ once the real domain is live.

Usage:
    pip install segno   # one-time, if not already installed
    python3 build-qr.py

Edit BASE_URL below, then re-run. Writes qr/<app>.svg (used on the site)
and qr/print/<app>.png at 1024px (print-ready).
"""
import segno

# ponytail: single knob — the whole point of this script is this one line.
BASE_URL = "https://apogeelabs.org"

APPS = {
    "marge": f"{BASE_URL}/marge/",
    "notch": f"{BASE_URL}/notch/",
    "kept": f"{BASE_URL}/kept/",
}

for name, url in APPS.items():
    qr = segno.make(url, error="q")
    qr.save(f"qr/{name}.svg", scale=10, dark="#1d1d1f", light=None)
    modules = qr.symbol_size(scale=1, border=4)[0]
    print_scale = round(1024 / modules)
    qr.save(f"qr/print/{name}.png", scale=print_scale, dark="#1d1d1f", light="#ffffff")
    print(f"{name}: {url}")

print(f"\nDone. QR codes encode {BASE_URL}.")
