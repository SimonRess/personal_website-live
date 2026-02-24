/* ============================================================
   script.js — Simon Ress Personal Website
   Handles: navbar scroll effects, active link highlighting,
            mobile menu toggle, smooth scroll fallback
   ============================================================ */

/* ===== DOM READY ===== */
document.addEventListener('DOMContentLoaded', function () {

  /* ===== ELEMENT REFERENCES ===== */
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href*="index.html#"]');

  /* ===== MOBILE MENU TOGGLE ===== */
  // Opens/closes the nav link list on small screens
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      // Update aria attribute for accessibility
      const isOpen = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a nav link is clicked
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
      }
    });
  }

  /* ===== NAVBAR SCROLL EFFECT ===== */
  // Add shadow class when user scrolls down from top
  function handleNavbarScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* ===== ACTIVE NAV LINK HIGHLIGHTING ===== */
  // Uses IntersectionObserver to track which section is in view
  // and highlights the corresponding nav link.
  const sections = document.querySelectorAll('section[id]');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,                   // viewport
      rootMargin: '-60px 0px -40% 0px',  // trigger slightly past top
      threshold: 0
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Remove active class from all links
          allNavLinks.forEach(function (link) {
            link.classList.remove('active');
          });
          // Add active to matching link
          const id = entry.target.getAttribute('id');
          const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ===== SMOOTH SCROLL FALLBACK ===== */
  // CSS scroll-behavior: smooth handles most browsers.
  // This JS fallback handles older browsers and offsets the fixed navbar.
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      // Extract the hash part (e.g. "#about" from "index.html#about")
      const hash = href.includes('#') ? '#' + href.split('#')[1] : href;
      const target = document.querySelector(hash);

      if (target) {
        e.preventDefault();
        const navHeight = navbar ? navbar.offsetHeight : 64;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  /* ===== INITIAL STATE ===== */
  handleNavbarScroll();

}); // end DOMContentLoaded
