(() => {
  'use strict';

  /* ---- Mobile nav toggle ---- */
  const header = document.querySelector('.site-header');
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Animated stat counters (respect reduced motion) ---- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statNums = document.querySelectorAll('.stat-num[data-count]');

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = (target % 1 === 0 ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('.stat-num[data-static]').forEach(el => {
    el.textContent = el.dataset.static;
  });

  if (statNums.length) {
    if (prefersReducedMotion) {
      statNums.forEach(el => {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      statNums.forEach(el => observer.observe(el));
    } else {
      statNums.forEach(el => {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
    }
  }

  /* ---- Live manifest ticker: simulated vessel position + countdown ETA ---- */
  const coordEl = document.getElementById('coordReadout');
  const etaEl = document.getElementById('etaReadout');
  const statusEl = document.getElementById('voyageStatus');

  // Base coordinates simulating a vessel drifting slowly along a route.
  let lat = -4.30;
  let lng = 39.28;

  // ETA expressed as days:hours:minutes:seconds counting down for atmosphere.
  let etaSeconds = 4 * 86400 + 12 * 3600 + 59 * 60 + 11;

  function formatCoord(value, posLabel, negLabel) {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = Math.round((minFloat - min) * 60);
    const label = value >= 0 ? posLabel : negLabel;
    return `${deg}°${min}'${label}`;
  }

  function formatEta(totalSeconds) {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function tickManifest() {
    if (!coordEl || !etaEl) return;

    // Small pseudo-random drift so the position looks alive without being erratic.
    lat += (Math.random() - 0.48) * 0.004;
    lng += (Math.random() - 0.5) * 0.004;

    coordEl.textContent = `${formatCoord(lat, 'N', 'S')}, ${formatCoord(lng, 'E', 'W')}`;

    if (etaSeconds > 0) {
      etaSeconds -= 1;
      etaEl.textContent = formatEta(etaSeconds);
    }

    if (statusEl) {
      statusEl.textContent = etaSeconds > 0 ? 'IN TRANSIT' : 'ARRIVING';
    }
  }

  if (coordEl && etaEl && !prefersReducedMotion) {
    tickManifest();
    setInterval(tickManifest, 1000);
  } else if (coordEl && etaEl) {
    // Reduced motion: show a single static snapshot instead of a live tick.
    coordEl.textContent = `${formatCoord(lat, 'N', 'S')}, ${formatCoord(lng, 'E', 'W')}`;
    etaEl.textContent = formatEta(etaSeconds);
  }

  /* ---- Quote form: front-end only confirmation with generated reference ---- */
  const quoteForm = document.getElementById('quoteForm');
  const formConfirm = document.getElementById('formConfirm');
  const confirmNum = document.getElementById('confirmNum');

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }
      const ref = 'AC-' + Math.floor(100000 + Math.random() * 900000);
      if (confirmNum) confirmNum.textContent = ref;
      if (formConfirm) {
        formConfirm.hidden = false;
        formConfirm.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
      }
      quoteForm.reset();
    });
  }
})();
