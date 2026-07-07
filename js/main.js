/* ==========================================================================
   MAPLE RIDGE HOMES — main.js v2
   Lenis smooth scroll + GSAP/ScrollTrigger motion system.
   Signature pieces: leaf particle assembly (home hero) and the
   scroll-scrubbed self-building house. All motion gated behind
   prefers-reduced-motion and GSAP availability.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motionOK = gsapReady && !prefersReducedMotion;

  if (!motionOK) document.documentElement.classList.add('reduced-motion');
  if (gsapReady) gsap.registerPlugin(ScrollTrigger);

  var isHome = document.body.dataset.page === 'home';

  /* ------------------------------------------------------------------
     Smooth scroll (Lenis) — desktop-feel scrolling, synced to GSAP
     ------------------------------------------------------------------ */
  if (motionOK && typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------
     Nav: glass on scroll, hide on scroll-down / show on scroll-up
     ------------------------------------------------------------------ */
  var nav = document.querySelector('.site-nav');
  var lastY = 0;

  function onScrollNav() {
    var y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      if (y > 300 && y > lastY + 4) nav.classList.add('hidden');
      else if (y < lastY - 4 || y < 300) nav.classList.remove('hidden');
    }
    lastY = y;
  }

  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

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
     Page-load curtain
     ------------------------------------------------------------------ */
  var curtain = document.querySelector('.curtain');

  if (curtain) {
    if (!motionOK) {
      curtain.classList.add('done');
    } else {
      var mark = curtain.querySelector('img');
      var ctl = gsap.timeline({
        onComplete: function () { curtain.classList.add('done'); }
      });
      if (mark) ctl.to(mark, { opacity: 1, duration: 0.35, ease: 'power1.out' })
                   .to(mark, { opacity: 0, duration: 0.3, delay: 0.25 });
      ctl.to(curtain, { yPercent: -100, duration: 0.65, ease: 'power3.inOut' });
    }
  }

  /* ------------------------------------------------------------------
     Cursor dot (fine pointers)
     ------------------------------------------------------------------ */
  var dot = document.querySelector('.cursor-dot');

  if (dot && motionOK && window.matchMedia('(pointer: fine)').matches) {
    var dx = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power2.out' });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power2.out' });
    window.addEventListener('mousemove', function (e) { dx(e.clientX); dy(e.clientY); }, { passive: true });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { gsap.to(dot, { scale: 2.6, duration: 0.25 }); });
      el.addEventListener('mouseleave', function () { gsap.to(dot, { scale: 1, duration: 0.25 }); });
    });
  }

  /* ------------------------------------------------------------------
     Magnetic buttons (fine pointers)
     ------------------------------------------------------------------ */
  if (motionOK && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      var qx = gsap.quickTo(btn, 'x', { duration: 0.3, ease: 'power2.out' });
      var qy = gsap.quickTo(btn, 'y', { duration: 0.3, ease: 'power2.out' });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.25);
        qy((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('mouseleave', function () { qx(0); qy(0); });
    });
  }

  /* ------------------------------------------------------------------
     Kinetic headline reveal: wrap words, mask-rise them in
     ------------------------------------------------------------------ */
  function splitWords(el) {
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el.classList.add('kinetic');
    text.split(/\s+/).forEach(function (word, i, arr) {
      var w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      var wi = document.createElement('span');
      wi.className = 'wi';
      wi.textContent = word;
      w.appendChild(wi);
      el.appendChild(w);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el.querySelectorAll('.wi');
  }

  if (motionOK) {
    document.querySelectorAll('[data-kinetic]').forEach(function (el) {
      var words = splitWords(el);
      gsap.fromTo(words,
        { yPercent: 110, filter: 'blur(6px)' },
        {
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 1.1,
          stagger: 0.07,
          ease: 'power3.out',
          delay: parseFloat(el.dataset.kineticDelay || 0),
          scrollTrigger: el.dataset.kineticScroll !== undefined
            ? { trigger: el, start: 'top 85%', once: true }
            : null
        }
      );
    });
  }

  /* ------------------------------------------------------------------
     HOME — leaf particle assembly
     ------------------------------------------------------------------ */
  var canvas = document.getElementById('leaf-canvas');

  if (canvas && motionOK) {
    (function () {
      var ctx = canvas.getContext('2d');
      var DPR = Math.min(window.devicePixelRatio || 1, 2);
      var cw = canvas.clientWidth, ch = canvas.clientHeight;
      canvas.width = cw * DPR;
      canvas.height = ch * DPR;
      ctx.scale(DPR, DPR);

      var img = new Image();
      img.src = 'images/leaf.png';
      img.onload = function () {
        // Sample opaque pixels of the leaf into particle targets
        var off = document.createElement('canvas');
        var scale = Math.min(cw / img.width, ch / img.height) * 0.92;
        var lw = Math.round(img.width * scale), lh = Math.round(img.height * scale);
        off.width = lw; off.height = lh;
        var octx = off.getContext('2d');
        octx.drawImage(img, 0, 0, lw, lh);
        var data = octx.getImageData(0, 0, lw, lh).data;

        var isMobile = window.matchMedia('(max-width: 700px)').matches;
        var STEP = isMobile ? 5 : 4;
        var ox = (cw - lw) / 2, oy = (ch - lh) / 2;
        var targets = [];

        for (var y = 0; y < lh; y += STEP) {
          for (var x = 0; x < lw; x += STEP) {
            var a = data[(y * lw + x) * 4 + 3];
            if (a > 140) targets.push({ x: ox + x, y: oy + y });
          }
        }

        var COLORS = ['#7A5C42', '#C2B49A', '#8A8C7A', '#66492F'];
        var parts = targets.map(function (t) {
          return {
            tx: t.x, ty: t.y,
            x: cw / 2 + (Math.random() - 0.5) * cw * 2.2,
            y: ch / 2 + (Math.random() - 0.5) * ch * 2.6,
            r: Math.random() * 1.3 + 0.6,
            c: COLORS[(Math.random() * COLORS.length) | 0],
            seed: Math.random() * Math.PI * 2
          };
        });

        var state = { p: 0, t: 0 };

        function draw() {
          ctx.clearRect(0, 0, cw, ch);
          var breathe = 1.3;
          for (var i = 0; i < parts.length; i++) {
            var pt = parts[i];
            var px = pt.x + (pt.tx - pt.x) * state.p;
            var py = pt.y + (pt.ty - pt.y) * state.p;
            px += Math.sin(state.t + pt.seed) * breathe * state.p;
            py += Math.cos(state.t * 0.8 + pt.seed) * breathe * state.p;
            ctx.globalAlpha = 0.35 + 0.65 * state.p;
            ctx.fillStyle = pt.c;
            ctx.beginPath();
            ctx.arc(px, py, pt.r, 0, 6.2832);
            ctx.fill();
          }
        }

        gsap.to(state, {
          p: 1,
          duration: 2.4,
          ease: 'power3.inOut',
          delay: 0.9,
          onUpdate: draw
        });

        // Idle breathing after assembly
        gsap.ticker.add(function () {
          state.t += 0.016;
          if (state.p > 0.01) draw();
        });

        // Dissolve slightly on scroll away
        gsap.to(canvas, {
          opacity: 0.15,
          scrollTrigger: { trigger: canvas, start: 'top top', end: '+=500', scrub: true }
        });
      };
    })();
  }

  /* ------------------------------------------------------------------
     HOME — self-building house (scroll-scrubbed line drawing)
     ------------------------------------------------------------------ */
  var houseSvg = document.getElementById('house-svg');

  if (houseSvg && motionOK) {
    (function () {
      var phases = ['ground', 'foundation', 'frame', 'roof', 'open'];
      var labels = document.querySelectorAll('.house-phase-list li');

      // Prepare every path for draw-on
      phases.forEach(function (ph) {
        houseSvg.querySelectorAll('.ph-' + ph + ' path').forEach(function (p) {
          var len = p.getTotalLength();
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
        });
      });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.house-section',
          start: 'top 55%',
          end: 'bottom 45%',
          scrub: 0.6
        }
      });

      phases.forEach(function (ph, i) {
        var sel = '#house-svg .ph-' + ph + ' path';
        tl.to(sel, {
          strokeDashoffset: 0,
          duration: ph === 'frame' ? 2.2 : 1.4,
          stagger: 0.06,
          ease: 'none',
          onStart: function () { if (labels[i]) labels[i].classList.add('on'); },
          onReverseComplete: function () { if (labels[i]) labels[i].classList.remove('on'); }
        });
      });

      // Windows glow last
      tl.to('#house-svg .glow-pane', { opacity: 0.85, duration: 1.2, stagger: 0.12, ease: 'power1.in' });
    })();
  }

  /* ------------------------------------------------------------------
     HOME — manifesto word-by-word scrub
     ------------------------------------------------------------------ */
  var manifesto = document.querySelector('.manifesto p[data-scrub-words]');

  if (manifesto && motionOK) {
    var raw = manifesto.textContent.trim().split(/\s+/);
    manifesto.setAttribute('aria-label', raw.join(' '));
    manifesto.textContent = '';
    raw.forEach(function (word, i, arr) {
      var s = document.createElement('span');
      s.className = 'w-fade';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = word;
      manifesto.appendChild(s);
      if (i < arr.length - 1) manifesto.appendChild(document.createTextNode(' '));
    });

    gsap.to(manifesto.querySelectorAll('.w-fade'), {
      opacity: 1,
      stagger: 0.06,
      ease: 'none',
      scrollTrigger: {
        trigger: manifesto,
        start: 'top 78%',
        end: 'bottom 45%',
        scrub: 0.5
      }
    });
  }

  /* ------------------------------------------------------------------
     Editorial heroes — slow parallax on the photo
     ------------------------------------------------------------------ */
  if (motionOK) {
    document.querySelectorAll('.hero-photo .hero-img').forEach(function (bg) {
      gsap.fromTo(bg, { yPercent: -7 }, {
        yPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: bg.closest('.hero-photo'), start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    // Ground-up reveal moved to Build a Home hero
    if (document.body.dataset.page === 'build-a-home') {
      gsap.fromTo('.hero-photo .hero-img',
        { clipPath: 'inset(58% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power2.out', delay: 0.55 }
      );
    }
  }

  /* ------------------------------------------------------------------
     Generic scroll reveals + stagger groups
     ------------------------------------------------------------------ */
  if (motionOK) {
    gsap.utils.toArray('.reveal').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 36 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 84%', once: true }
      });
    });

    gsap.utils.toArray('.stagger-group').forEach(function (group) {
      gsap.fromTo(group.children, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 84%', once: true }
      });
    });
  }

  /* ------------------------------------------------------------------
     Count-up stats
     ------------------------------------------------------------------ */
  if (motionOK) {
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.to(obj, {
            val: target, duration: 1.6, ease: 'power1.out',
            onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; }
          });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Lightbox (testimonials)
     ------------------------------------------------------------------ */
  var lightbox = document.querySelector('.lightbox');

  if (lightbox) {
    var lightboxImg = lightbox.querySelector('img');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item[data-full]'));
    var current = 0;

    var show = function (i) {
      current = (i + items.length) % items.length;
      lightboxImg.src = items[current].dataset.full;
      var inner = items[current].querySelector('img');
      lightboxImg.alt = inner ? inner.alt : '';
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
     Lazy backgrounds
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-bg]').forEach(function (el) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.backgroundImage = 'url(' + entry.target.dataset.bg + ')';
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '250px' }).observe(el);
  });
})();
