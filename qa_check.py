#!/usr/bin/env python3
"""Maple Ridge website QA — run before every deploy: python3 qa_check.py"""
import re, os, glob

PAGES = ["index.html", "about.html", "process.html", "build-a-home.html",
         "renovations.html", "installations.html", "testimonials.html", "careers.html"]
PALETTE = {"2A2E30", "7A5C42", "66492F", "C2B49A", "8A8C7A", "F8F4EE", "F0EAE0"}
EXTERIOR = {"film-hero.jpg", "film-01.jpg", "film-02.jpg", "film-03.jpg", "film-05.jpg",
            "film-06.jpg", "hero-1.jpg", "hero-2.jpg", "hero-3.jpg",
            "gallery-1.jpg", "gallery-2.jpg", "gallery-3.jpg"}
HERO_PAGES = ["index.html", "about.html", "build-a-home.html",
              "renovations.html", "installations.html", "careers.html"]

fail = []
for p in PAGES:
    h = open(p).read()
    if not re.search(r'<meta name="description" content=".+?"', h):
        fail.append(f"{p}: missing meta description")
    m = re.search(r'<meta name="description" content="(.*?)"', h)
    if m and re.search(r'warrant', m.group(1), re.I):
        fail.append(f"{p}: warranty language in meta description")
    for needle, label in [('class="site-nav', 'nav'), ('class="cta-band"', 'CTA band'),
                          ('class="site-footer"', 'footer'), ('formspree.io', 'contact form'),
                          ('226-455-8076', 'public phone'), ('class="active"', 'active nav'),
                          ('rel="canonical"', 'canonical'), ('og:image', 'OG image')]:
        if needle not in h:
            fail.append(f"{p}: missing {label}")
    if '705' in h.replace('705 555 0100', ''):
        fail.append(f"{p}: personal cell number present")
    if 'ChatGPT' in h:
        fail.append(f"{p}: AI-generated image referenced")
    for attr in re.findall(r'(?:href|src)="([^"]+)"', h):
        if attr.startswith(("http", "mailto:", "tel:", "#", "data:")):
            continue
        if not os.path.exists(attr):
            fail.append(f"{p}: broken link {attr}")
    if p in HERO_PAGES:
        m = re.search(r'(?:hero-img|ch-img)" style="background-image: url\(\'images/([^\']+)\'\)', h)
        if m and m.group(1) not in EXTERIOR:
            fail.append(f"{p}: non-exterior hero photo {m.group(1)}")

for f in ["css/styles.css"] + PAGES:
    for hexc in re.findall(r'#([0-9a-fA-F]{6})\b', open(f).read()):
        if hexc.upper() not in PALETTE:
            fail.append(f"{f}: off-palette colour #{hexc}")

for img in glob.glob("images/*"):
    if os.path.getsize(img) > 400_000:
        fail.append(f"{img}: over 400KB")

if fail:
    print("FAILURES:")
    for x in fail:
        print(" -", x)
    raise SystemExit(1)
print(f"ALL CHECKS PASS — {len(PAGES)} pages")
