/**
 * base-scripts.js — JavaScript base para guías de viaje
 * Ver SPECS.md sección 2.8
 *
 * USO EN FASE 2: Leer este fichero (cabe en una lectura) en lugar de
 * parsear el index.html de referencia completo.
 *
 * CONTENIDO: Solo BLOQUE 2 (acordeones, nav, parallax, fade-in, lazy load).
 *
 * BLOQUE 1 (mapa Leaflet) fue extraído a mapa.html por destino.
 * Ver _templates/mapa-template.html como referencia.
 * El mapa se ensambla como fichero independiente:
 *   cat _draft/base.html _draft/mapa.html _draft/dias-*.html _draft/end.html > draft.html
 */

/* ══════════════════════════════════════════════════════════════
   BLOQUE 2 — ACORDEONES, NAV, PARALLAX, FADE-IN, LAZY LOAD
   (embeber justo antes del cierre </body>)
══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  /* ── ACORDEONES ──────────────────────────────────── */
  function initAccordions() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(function(header) {
      const bodyId = header.getAttribute('aria-controls');
      const body = document.getElementById(bodyId);
      if (!body) return;

      // Si está marcado como expanded en el HTML, abrir
      if (header.getAttribute('aria-expanded') === 'true') {
        body.removeAttribute('hidden');
      }

      header.addEventListener('click', function() {
        const isOpen = header.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
          // Cerrar
          header.setAttribute('aria-expanded', 'false');
          body.setAttribute('hidden', '');
        } else {
          // Abrir
          header.setAttribute('aria-expanded', 'true');
          body.removeAttribute('hidden');
        }
      });

      // Soporte teclado
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  /* ── LAZY LOAD CON FADE-IN ───────────────────────── */
  function initLazyImages() {
    const images = document.querySelectorAll('.accordion-img-wrap img, .accordion-thumb');
    images.forEach(function(img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() {
          img.classList.add('loaded');
        });
        img.addEventListener('error', function() {
          // Si falla, el contenedor ya tiene el gradiente de fallback
          img.style.display = 'none';
        });
      }
    });
  }

  /* ── PARALLAX HERO ───────────────────────────────── */
  var heroBg = document.getElementById('hero-bg');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateParallax() {
    if (prefersReducedMotion || !heroBg) return;
    var scrolled = window.pageYOffset;
    heroBg.style.transform = 'translateY(' + (scrolled * 0.4) + 'px)';
  }

  /* ── SCROLL SPY + NAV ────────────────────────────── */
  var nav = document.getElementById('main-nav');
  var navBtns = document.querySelectorAll('.nav-btn[data-target]');
  var sections = [];

  navBtns.forEach(function(btn) {
    var id = btn.getAttribute('data-target');
    var el = document.getElementById(id);
    if (el) sections.push({ btn: btn, el: el });
  });

  function updateScrollSpy() {
    var scrollY = window.pageYOffset + 100;

    // Nav background
    if (window.pageYOffset > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active button
    var current = null;
    sections.forEach(function(s) {
      if (s.el.offsetTop <= scrollY) {
        current = s.btn;
      }
    });

    navBtns.forEach(function(b) { b.classList.remove('active'); });
    if (current) current.classList.add('active');
  }

  /* ── FADE-IN ON SCROLL ───────────────────────────── */
  function initFadeIn() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.day-section').forEach(function(s) {
        s.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    document.querySelectorAll('.day-section').forEach(function(s) {
      observer.observe(s);
    });
  }

  /* ── SCROLL HANDLER ──────────────────────────────── */
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateParallax();
        updateScrollSpy();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── SCROLL TO SECTION ───────────────────────────── */
  window.scrollToSection = function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var navH = nav ? nav.offsetHeight : 0;
    var top = el.getBoundingClientRect().top + window.pageYOffset - navH - 16;
    window.scrollTo({ top: top, behavior: 'smooth' });
  };

  /* ── INIT ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function() {
    initAccordions();
    initLazyImages();
    initFadeIn();
    updateScrollSpy();
  });

  // También ejecutar si DOMContentLoaded ya pasó
  if (document.readyState !== 'loading') {
    initAccordions();
    initLazyImages();
    initFadeIn();
    updateScrollSpy();
  }

})();
