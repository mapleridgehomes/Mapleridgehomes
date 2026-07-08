/* ==========================================================================
   MAPLE RIDGE HOMES — main.js v2
   GSAP/ScrollTrigger motion system on native scrolling.
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
     Scrolling is NATIVE. A smooth-scroll library froze the page for
     real users when its animation loop stalled — never again. All the
     cinematic motion comes from scroll-scrubbed animations, which work
     perfectly with native scrolling.
     ------------------------------------------------------------------ */

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
    // The curtain must NEVER trap the page. Its lift is a CSS transition
    // (compositor-driven, no JS loop), triggered by plain timeouts, with
    // a hard remove as the last line of defence.
    if (!motionOK) {
      curtain.classList.add('done');
    } else {
      var mark = curtain.querySelector('img');
      var count = curtain.querySelector('.pre-count');
      if (mark) mark.style.opacity = '1';

      var start = Date.now();
      var counting = setInterval(function () {
        var p = Math.min((Date.now() - start) / 1300, 1);
        if (count) count.textContent = String(Math.round(p * 100)).padStart(2, '0');
        if (p >= 1) clearInterval(counting);
      }, 40);

      var lift = function () {
        curtain.classList.add('lift');
        setTimeout(function () { curtain.classList.add('done'); }, 900);
      };
      setTimeout(lift, 1450);
      // Hard failsafe — remove no matter what
      setTimeout(function () { curtain.classList.add('done'); }, 4000);
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
    // Collect words, remembering which came from italic (.it) spans
    var words = [];
    Array.prototype.forEach.call(el.childNodes, function (node) {
      var italic = node.nodeType === 1 && node.classList && node.classList.contains('it');
      (node.textContent || '').split(/\s+/).forEach(function (word) {
        if (word) words.push({ t: word, it: italic });
      });
    });
    el.setAttribute('aria-label', words.map(function (w) { return w.t; }).join(' '));
    el.textContent = '';
    el.classList.add('kinetic');
    words.forEach(function (word, i) {
      var w = document.createElement('span');
      w.className = 'w' + (word.it ? ' it' : '');
      w.setAttribute('aria-hidden', 'true');
      var wi = document.createElement('span');
      wi.className = 'wi';
      wi.textContent = word.t;
      w.appendChild(wi);
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
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
     HOME — leaves on the wind: real miniature leaves tumble in and
     settle while the brand leaf materializes. No dots, no tech look.
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
        var isMobile = window.matchMedia('(max-width: 700px)').matches;
        var COUNT = isMobile ? 16 : 24;
        var AR = img.height / img.width;

        // Each sprite: a small real leaf blowing in from off-canvas,
        // swaying and tumbling like a falling leaf, then settling/fading
        // near the centre as the brand mark appears.
        var sprites = [];
        for (var i = 0; i < COUNT; i++) {
          var fromLeft = Math.random() < 0.65;
          sprites.push({
            sx: fromLeft ? -60 - Math.random() * cw * 0.3 : cw * (0.2 + Math.random() * 0.6),
            sy: fromLeft ? ch * (Math.random() * 0.5 - 0.15) : -70 - Math.random() * 60,
            tx: cw * (0.28 + Math.random() * 0.44),
            ty: ch * (0.30 + Math.random() * 0.42),
            w: 13 + Math.random() * 17,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 4.5,
            sway: 16 + Math.random() * 26,
            f: 2.2 + Math.random() * 2.4,
            d0: Math.random() * 0.32,
            seed: Math.random() * Math.PI * 2
          });
        }

        var state = { p: 0 };

        function draw() {
          ctx.clearRect(0, 0, cw, ch);
          for (var i = 0; i < sprites.length; i++) {
            var sp = sprites[i];
            var t = (state.p - sp.d0) / (1 - sp.d0);
            if (t <= 0) continue;
            t = Math.min(t, 1);
            var e = 1 - Math.pow(1 - t, 3); // ease-out drift
            var x = sp.sx + (sp.tx - sp.sx) * e + Math.sin(t * sp.f * Math.PI + sp.seed) * sp.sway * (1 - e);
            var y = sp.sy + (sp.ty - sp.sy) * e + Math.sin(t * sp.f * 0.7 * Math.PI + sp.seed) * 10 * (1 - e);
            var alpha = t < 0.12 ? t / 0.12 : (t > 0.72 ? Math.max(0, 1 - (t - 0.72) / 0.28) : 1);
            var w = sp.w, h = w * AR;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(sp.rot + sp.spin * t + Math.sin(t * sp.f * Math.PI + sp.seed) * 0.5 * (1 - e));
            ctx.globalAlpha = alpha * 0.9;
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();
          }
        }

        gsap.to(state, {
          p: 1,
          duration: 3.4,
          ease: 'none',
          delay: 0.55,
          onUpdate: draw,
          onComplete: function () { ctx.clearRect(0, 0, cw, ch); }
        });

        // The brand leaf materializes as the blown leaves settle
        gsap.fromTo('.hero-leaf-real',
          { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
          { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.9, ease: 'power2.out', delay: 2.1 }
        );

        // Gentle organic float, forever
        gsap.to('.hero-leaf-wrap', {
          y: 9,
          rotation: 1.2,
          duration: 3.6,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: 4.0
        });
      };
    })();
  }

  /* ------------------------------------------------------------------
     HOME — continuous scroll choreography
     ------------------------------------------------------------------ */
  if (motionOK && isHome) {
    // A thread draws down the page with your scroll — ties every act together
    var thread = document.querySelector('.scroll-thread');
    if (thread) {
      gsap.fromTo(thread, { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 0.4 }
      });
    }

    // Chapters: every photo owns a full-screen scroll-zoom section.
    // The image settles from 1.14 to 1 as you scroll through, the title
    // drifts, and the next chapter slides over — one continuous film.
    gsap.utils.toArray('.chapter').forEach(function (ch) {
      var img = ch.querySelector('.ch-img');
      var title = ch.querySelector('.ch-title');

      gsap.fromTo(img, { scale: 1.14 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true }
      });

      if (title) {
        gsap.fromTo(title, { yPercent: 0 }, {
          yPercent: -30,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: { trigger: ch, start: 'bottom 90%', end: 'bottom 30%', scrub: true }
        });
      }
    });

    // Service titles drift laterally with scroll — nothing sits still
    gsap.utils.toArray('.service-row').forEach(function (row, i) {
      gsap.fromTo(row.querySelector('.name'),
        { x: i % 2 ? -28 : 28 },
        {
          x: i % 2 ? 28 : -28,
          ease: 'none',
          scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true }
        }
      );
    });

    // Marquee reacts to scroll velocity — faster as you move
    var track = document.querySelector('.marquee-track');
    if (track) {
      track.style.animation = 'none';
      var loop = gsap.to(track, { xPercent: -50, repeat: -1, ease: 'none', duration: 30 });
      var boost = 1;
      ScrollTrigger.create({
        onUpdate: function (self) {
          boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 4);
        }
      });
      gsap.ticker.add(function () {
        loop.timeScale(gsap.utils.interpolate(loop.timeScale(), boost, 0.06));
        boost = gsap.utils.interpolate(boost, 1, 0.03);
      });
    }
  }

  /* ------------------------------------------------------------------
     HOME — self-building house (scroll-scrubbed line drawing)
     ------------------------------------------------------------------ */
  var houseSvg = document.getElementById('house-svg');

  if (houseSvg && motionOK) {
    (function () {
      var wirePhases = ['ground', 'foundation', 'frame', 'roof'];
      var labels = document.querySelectorAll('.house-phase-list li');

      // Prepare wireframe paths for draw-on
      wirePhases.forEach(function (ph) {
        houseSvg.querySelectorAll('.ph-' + ph + ' path').forEach(function (p) {
          var len = p.getTotalLength();
          p.style.strokeDasharray = len;
          p.style.strokeDashoffset = len;
        });
      });

      // Solid house starts buried below the lot (ground clip hides it)
      gsap.set('#house-svg .house-solid', { y: 250 });

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.house-section',
          start: 'top 12%',
          end: '+=1800',
          scrub: 0.6,
          pin: true
        }
      });

      // 1) Blueprint draws itself
      wirePhases.forEach(function (ph, i) {
        tl.to('#house-svg .ph-' + ph + ' path', {
          strokeDashoffset: 0,
          duration: ph === 'frame' ? 2.0 : 1.3,
          stagger: 0.05,
          ease: 'none',
          onStart: function () { if (labels[i]) labels[i].classList.add('on'); },
          onReverseComplete: function () { if (labels[i]) labels[i].classList.remove('on'); }
        });
      });

      // 2) The real home rises out of the ground; blueprint fades to a ghost
      gsap.set('#house-svg .ground-solid', { opacity: 0 });
      tl.to('#house-svg .house-wire', { opacity: 0.16, duration: 2.2, ease: 'none' }, '>');
      tl.to('#house-svg .house-solid', {
        y: 0,
        duration: 2.6,
        ease: 'power2.out',
        onStart: function () { if (labels[4]) labels[4].classList.add('on'); },
        onReverseComplete: function () { if (labels[4]) labels[4].classList.remove('on'); }
      }, '<');
      tl.to('#house-svg .ground-solid', { opacity: 1, duration: 1.6, ease: 'none' }, '<+0.6');

      // 3) Lights on — windows glow, the fire pit catches, hotspots go live
      var flameLoop = gsap.timeline({ repeat: -1, yoyo: true, paused: true })
        .to('#house-svg .fire-flame', { scaleY: 1.25, scaleX: 0.9, duration: 0.35, ease: 'sine.inOut' })
        .to('#house-svg .fire-flame', { scaleY: 0.9, scaleX: 1.08, duration: 0.28, ease: 'sine.inOut' });

      tl.to('#house-svg .glow-pane', {
        opacity: 0.85,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power1.in',
        onStart: function () { if (labels[5]) labels[5].classList.add('on'); },
        onReverseComplete: function () { if (labels[5]) labels[5].classList.remove('on'); }
      });
      tl.to('#house-svg .fire-flame', {
        fillOpacity: function (i) { return i === 0 ? 0.85 : 0.65; },
        duration: 0.8,
        ease: 'power1.in',
        onComplete: function () {
          flameLoop.play();
          var hs = houseSvg.querySelector('.hotspots');
          if (hs) hs.classList.add('live');
        },
        onReverseComplete: function () {
          flameLoop.pause();
          var hs = houseSvg.querySelector('.hotspots');
          if (hs) hs.classList.remove('live');
        }
      }, '<+0.4');
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
