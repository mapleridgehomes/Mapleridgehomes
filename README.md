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

- **Phone number:** the site uses **226-455-8076** — the public business number. 705-279-0545 is Mitchell's personal cell and must never appear on the website or any client-facing page.
- **SEO meta descriptions contain no warranty language** (per Maple Ridge operating rules). The Installations meta description from the spec was adjusted; warranty copy remains on-page everywhere the spec calls for it.
- **Logo on dark nav:** no reversed logo variant existed, so one was generated from the transparent master (wordmark recolored to Cream, leaf kept Wood Brown) — `images/logo-reversed.png`. Favicon generated from the leaf mark.
- **Photos:** 15 photos selected from 31 Marni Lane (exteriors/drone) and the Brand Identity portfolio folder (interiors, tile, showers), optimized to max 1200px / under 300KB each.

## Netlify setup (one-time)

The repo is live at `https://github.com/mapleridgehomes/Mapleridgehomes` (pushed July 6, 2026). In Netlify: **Add new site → Import from GitHub → Mapleridgehomes**. No build command, publish directory = repo root. Then point the `mapleridgehomes.co` domain at the Netlify site.

## Deploying updates

Push to `main` — Netlify redeploys automatically once the repo is connected:

```bash
cd "05_Marketing/Website"
git add .
git commit -m "Describe the change"
git push
```

## Animations

GSAP 3 + ScrollTrigger from CDN. Home page runs a load sequence: nav fade, headline character stagger, then the three hero homes are revealed from the ground line upward — the lawn stays fixed and each house rises out of the lot (staggered clip-path reveal). All pages use scroll-triggered section reveals, card staggers, and stat count-ups. All motion is disabled automatically for users with `prefers-reduced-motion` set.
