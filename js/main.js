/* ==========================================================================
   MAPLE RIDGE HOMES — main.js
   GSAP + ScrollTrigger animations, nav, lightbox, lazy loading.
   All motion is disabled when the user prefers reduced motion.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapReady = typeof window.gsap !== 'undefined';

  if (prefersReducedMotion || !gsapReady) {
    document.documentElement.classList.add('reduced-motion');
  }

  if (gsapReady && typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     Lazy loading — native attribute is set in HTML; this is a fallback
     for below-the-fold background panes flagged with data-bg.
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-bg]').forEach(function (el) {
    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.backgroundImage = 'url(' + entry.target.dataset.bg + ')';
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px' });
    io.observe(el);
  });

  /* ------------------------------------------------------------------
     Lightbox (Testimonials gallery — any .gallery-item[data-full])
     ------------------------------------------------------------------ */
  var lightbox = document.querySelector('.lightbox');

  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item[data-full]'));
    var current = 0;

    var show = function (i) {
      current = (i + items.length) % items.length;
      lightboxImg.src = items[current].dataset.full;
      lightboxImg.alt = items[current].querySelector('img') ? items[current].querySelector('img').alt : '';
    };

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        show(i);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    var close = function () {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ------------------------------------------------------------------
     Animations — everything below requires GSAP and motion allowed
     ------------------------------------------------------------------ */
  if (prefersReducedMotion || !gsapReady) return;

  /* Page load sequence (Home only — flagged on <body data-page="home">) */
  var isHome = document.body.dataset.page === 'home';

  // Nav fades in from top
  gsap.from('.site-nav', { y: -30, opacity: 0, duration: 0.3, ease: 'power1.out' });

  var heroHeadline = document.querySelector('.hero-content h1');

  if (heroHeadline) {
    // Split headline into chars for the stagger
    var text = heroHeadline.textContent;
    heroHeadline.textContent = '';
    heroHeadline.setAttribute('aria-label', text);
    text.split(' ').forEach(function (word, w, words) {
      var wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.setAttribute('aria-hidden', 'true');
      word.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        wordSpan.appendChild(span);
      });
      heroHeadline.appendChild(wordSpan);
      if (w < words.length - 1) heroHeadline.appendChild(document.createTextNode(' '));
    });

    var tl = gsap.timeline({ delay: 0.25 });

    tl.from('.hero-content h1 .char', {
      opacity: 0,
      y: 18,
      duration: 0.8,
      stagger: 0.03,
      ease: 'power2.out'
    });

    tl.from('.hero-content .hero-sub', {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: 'power2.out'
    }, '-=0.4');

    tl.from('.hero-content .btn', {
      opacity: 0,
      scale: 0.92,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.15');

    // THREE HOMES RISING (Home page): panes rise from below the fold
    if (isHome) {
      gsap.from('.hero-media .hero-pane', {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.35
      });
    }
  }

  /* Scroll reveals — every .reveal section fades up on enter */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      }
    );
  });

  /* Service cards / any .stagger-group children stagger in left to right */
  gsap.utils.toArray('.stagger-group').forEach(function (group) {
    gsap.fromTo(group.children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: group, start: 'top 80%', once: true }
      }
    );
  });

  /* Process steps — sequential reveal top to bottom */
  gsap.utils.toArray('.process-step').forEach(function (step, i) {
    gsap.fromTo(step,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.7,
        delay: (i % 5) * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: step, start: 'top 82%', once: true }
      }
    );
  });

  /* Gallery photos — stagger grid reveal */
  gsap.utils.toArray('.gallery-grid').forEach(function (grid) {
    gsap.fromTo(grid.children,
      { opacity: 0, y: 26, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true }
      }
    );
  });

  /* Stats — count up when they enter the viewport */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var obj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power1.out',
          onUpdate: function () {
            el.textContent = Math.round(obj.val) + suffix;
          }
        });
      }
    });
  });
})();
