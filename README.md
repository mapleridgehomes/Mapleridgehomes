# Maple Ridge Homes — Website

Production-ready 7-page static website. Pure HTML5 + CSS3 + vanilla JavaScript with GSAP (CDN) animations. No build tools — deploys directly to Netlify from GitHub.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About |
| `process.html` | Our Process |
| `build-a-home.html` | Build a Home |
| `renovations.html` | Renovations |
| `installations.html` | Installations |
| `testimonials.html` | Testimonials |

Shared assets: `css/styles.css` (single stylesheet), `js/main.js` (all animations + interactions), `images/` (15 optimized project photos + logo variants + favicon).

## Before going live — three setup steps

1. **Contact form (Formspree).** Create a free account at [formspree.io](https://formspree.io), create a form, and replace `YOUR_FORM_ID` in the form `action` on all 7 pages (search for `formspree.io/f/YOUR_FORM_ID`).
2. **Google Reviews (Testimonials page).** Go to [elfsight.com](https://elfsight.com), create a free Google Reviews widget, connect the Google Business Profile, and paste the embed script where the placeholder div sits in `testimonials.html`.
3. **Social links.** Footer Facebook / Instagram / LinkedIn icons currently link to `#`. Replace with real profile URLs on all 7 pages.

## Decisions made during the build (flag if wrong)

- **Phone number:** the site uses **226-455-8076** as specified in the build prompt. Note the standard Maple Ridge email signature uses 705-279-0545 — if the site should show the 705 number (or both), it's a find-and-replace across all 7 pages (`226-455-8076` and `tel:2264558076`).
- **SEO meta descriptions contain no warranty language** (per Maple Ridge operating rules). The Installations meta description from the spec was adjusted; warranty copy remains on-page everywhere the spec calls for it.
- **Logo on dark nav:** no reversed logo variant existed, so one was generated from the transparent master (wordmark recolored to Cream, leaf kept Wood Brown) — `images/logo-reversed.png`. Favicon generated from the leaf mark.
- **Photos:** 15 photos selected from 31 Marni Lane (exteriors/drone) and the Brand Identity portfolio folder (interiors, tile, showers), optimized to max 1200px / under 300KB each.

## Deploying updates

Push to `main` — Netlify redeploys automatically once the repo is connected:

```bash
cd "05_Marketing/Website"
git add .
git commit -m "Describe the change"
git push
```

## Animations

GSAP 3 + ScrollTrigger from CDN. Home page runs a load sequence (nav fade, headline character stagger, three hero homes rising). All pages use scroll-triggered section reveals, card staggers, and stat count-ups. All motion is disabled automatically for users with `prefers-reduced-motion` set.
