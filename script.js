/* ============================================================
   script.js — Simon Ress Personal Website
   Handles: theme switching (Light / Dark / Automatic),
            mobile menu, active-tab highlighting (scroll-spy),
            smooth scroll fallback.
   Contract documented in docs/style-guide.md §14.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ===== ELEMENT REFERENCES ===== */
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('nav-toggle');
  const navLinks    = document.getElementById('nav-links');
  const themeToggle = document.getElementById('theme-toggle');
  const themeMenu   = document.getElementById('theme-menu');
  const allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href*="index.html#"]');
  const root        = document.documentElement;
  const darkQuery   = window.matchMedia('(prefers-color-scheme: dark)');

  /* ===== THEME (Light / Dark / Automatic) ===== */
  // Stored in localStorage under "theme": "light" | "dark" | "auto" (default).
  // The inline snippet in <head> applies the class before first paint;
  // this code keeps it in sync afterwards and drives the dropdown.
  function getTheme() {
    try { return localStorage.getItem('theme') || 'auto'; } catch (e) { return 'auto'; }
  }

  function applyTheme(mode) {
    const dark = mode === 'dark' || (mode === 'auto' && darkQuery.matches);
    root.classList.toggle('dark', dark);

    if (themeToggle) {
      // moon in light mode, sun in dark mode
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (themeMenu) {
      themeMenu.querySelectorAll('button[data-theme]').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.theme === mode);
      });
    }
  }

  function setTheme(mode) {
    try { localStorage.setItem('theme', mode); } catch (e) { /* storage unavailable */ }
    applyTheme(mode);
  }

  function setThemeMenu(open) {
    if (!themeMenu || !themeToggle) return;
    themeMenu.hidden = !open;
    themeToggle.setAttribute('aria-expanded', String(open));
  }

  if (themeToggle && themeMenu) {
    themeToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setThemeMenu(themeMenu.hidden);
    });
    themeMenu.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-theme]');
      if (!btn) return;
      setTheme(btn.dataset.theme);
      setThemeMenu(false);
    });
  }

  // In "auto" mode follow OS changes live
  const onSchemeChange = function () { if (getTheme() === 'auto') applyTheme('auto'); };
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSchemeChange);
  else if (darkQuery.addListener) darkQuery.addListener(onSchemeChange);

  applyTheme(getTheme());

  /* ===== MOBILE MENU ===== */
  // Opens/closes the tab list below 992px (CSS decides when it is visible)
  function setMenu(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!navLinks.classList.contains('open'));
    });
    // Close the menu once a tab is chosen
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }

  /* ===== GLOBAL DISMISSAL (outside click / Esc) ===== */
  document.addEventListener('click', function (e) {
    if (navbar && !navbar.contains(e.target)) { setMenu(false); setThemeMenu(false); }
    else if (themeMenu && !e.target.closest('.theme-dropdown')) setThemeMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (themeMenu && !themeMenu.hidden) { setThemeMenu(false); if (themeToggle) themeToggle.focus(); }
    if (navLinks && navLinks.classList.contains('open')) { setMenu(false); if (navToggle) navToggle.focus(); }
  });

  /* ===== ACTIVE TAB (scroll-spy) ===== */
  // The tab whose section is in view is shown bold + blue (.active).
  const sections = document.querySelectorAll('section[id]');
  const tabFor = function (id) { return document.querySelector('.nav-links a[href$="#' + id + '"]'); };

  if ('IntersectionObserver' in window && sections.length > 0) {
    const headerH = navbar ? navbar.offsetHeight : 70;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const tab = tabFor(entry.target.id);
        if (!tab) return;                       // sections without a tab keep the previous one
        allNavLinks.forEach(function (link) {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-current', 'true');
      });
    }, {
      root: null,
      rootMargin: '-' + (headerH + 10) + 'px 0px -40% 0px',   // trigger just below the fixed header
      threshold: 0
    });
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ===== SMOOTH SCROLL FALLBACK ===== */
  // CSS scroll-behavior + scroll-padding-top covers modern browsers; this
  // offsets the fixed header for the rest.
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      const hash = '#' + href.split('#')[1];
      // On sub-pages the target section doesn't exist, so the browser
      // navigates to ../../index.html#… as usual.
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 70;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        if (history.replaceState) history.replaceState(null, '', hash);
      }
    });
  });

}); // end DOMContentLoaded
