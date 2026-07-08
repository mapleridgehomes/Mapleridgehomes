# Maple Ridge Homes Website — Working Rules

Static site: HTML + CSS + vanilla JS + GSAP (CDN). No frameworks, no build step, no smooth-scroll libraries (Lenis froze real devices — native scroll only; all motion is scroll-scrubbed via ScrollTrigger).

## Workflow: page-by-page
- One page per request. Perfect it, Mitchell says "lock it", never touch it again without explicit ask.
- **Locked pages:** (none yet)
- Never do site-wide rebuilds. Targeted edits only.
- Every change: verify in preview at 375px and 1440px → run the QA script → commit → push → `netlify deploy --dir .` (draft) → give Mitchell the draft URL. Production deploy (`--prod`) only when Mitchell explicitly says ship it.

## Design system (v4 "reel" language — approved)
- Fonts: Cormorant Garamond 500 for display (italic accents via `<span class="it">`), Cinzel ONLY in the brand lockup, Lato 400/700 body/labels.
- Palette locked (six colours only): charcoal #2A2E30, wood-brown #7A5C42, wood-brown-dark #66492F, taupe #C2B49A, olive #8A8C7A, cream #F8F4EE, off-white #F0EAE0. No white, no black, no other hex.
- Dark cinematic homepage; cream editorial interior pages; grain overlay on dark.
- Motion: kinetic word reveals (data-kinetic), chapter scroll-zoom + 0.3x parallax, gallery grain-reveal, house-build scrub with hotspots, counter preloader. GSAP free plugins (SplitText, DrawSVG, MorphSVG, Flip) are available and preferred over hand-rolled equivalents.
- Accessibility floor: WCAG contrast, visible form labels, focus-visible, 44px touch targets, prefers-reduced-motion fallbacks, skip links. Never regress these.

## Photo rules (Mitchell's, strict)
- Hero sections (Home/About/Build/Renovations/Installations/Careers): EXTERIOR finished-home photos only.
- Interior/tile/shower/detail photos: gallery (testimonials.html) and service-page body sections only.
- Mitchell's real photos ONLY. Never AI-generated (skip "ChatGPT Image *" files), never stock presented as work.
- Sources: `Website Photos/Website Full House Photos` (exteriors/main), `Website Photos/Testimonial Videos ` (details), plus job folders under `02_Builds`/`03_Services`. Always re-export from source with `ImageOps.exif_transpose`; heroes ≤1600px, others ≤1200px, everything ≤400KB, JPEG progressive.

## Contact & business facts
- Phone: 226-455-8076 (public line). 705-279-0545 is Mitchell's personal cell — NEVER on the site.
- Email info@mapleridgehomes.co · Springwater, ON · HST #734852023 · warranty language stays OUT of meta descriptions.
- Formspree form ID is still the YOUR_FORM_ID placeholder; Google Reviews embed pending; footer social links are `#` placeholders.

## QA script
Run from this directory (checks links, palette, phone, meta, sizes):
`python3 qa_check.py` — if missing, recreate from git history (commit fc00ebe area) or write equivalent checks.

## Deploy
- git push origin main (repo: mapleridgehomes/Mapleridgehomes, gh CLI authed)
- Draft: `netlify deploy --dir . --json` → give Mitchell the deploy_url
- Prod (only on "ship it"): `netlify deploy --prod --dir .`
