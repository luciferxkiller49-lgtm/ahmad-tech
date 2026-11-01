/**
 * Ahmad Tech - Global Website Scripts
 * Domain: ahmadtech.site
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTheme();
    initAccordions();
    initBackToTop();
    initServerPingSimulator();
    initCodeBlockCopy();
  });

  /* -------------------------------------------------------------
   * 1. Mobile Navigation
   * ------------------------------------------------------------- */
  function initNavigation() {
    const navToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('primaryNav');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Close menu on link click
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Header background change on scroll
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          siteHeader.classList.add('scrolled');
        } else {
          siteHeader.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  }

  /* -------------------------------------------------------------
   * 2. Dark / Light Theme Toggle
   * ------------------------------------------------------------- */
  function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    const storedTheme = localStorage.getItem('ahmadtech_theme') || 'dark';

    setTheme(storedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
      });
    }

    function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('ahmadtech_theme', theme);

      if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (icon) {
          icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      }
    }
  }

  /* -------------------------------------------------------------
   * 3. Accordion / FAQ Functionality
   * ------------------------------------------------------------- */
  function initAccordions() {
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isOpen = item.classList.contains('active');

        // Close siblings if in same accordion group
        const group = item.closest('.accordion-group');
        if (group) {
          group.querySelectorAll('.accordion-item').forEach(sibling => {
            sibling.classList.remove('active');
            const sibBtn = sibling.querySelector('.accordion-header');
            if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
          });
        }

        if (!isOpen) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        } else {
          item.classList.remove('active');
          header.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * 4. Back To Top Button
   * ------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* -------------------------------------------------------------
   * 5. Live Ping / Network Simulator
   * ------------------------------------------------------------- */
  function initServerPingSimulator() {
    const pingBadges = document.querySelectorAll('.live-ping-val');
    if (!pingBadges.length) return;

    setInterval(() => {
      pingBadges.forEach(badge => {
        const base = parseInt(badge.getAttribute('data-base') || '30', 10);
        const jitter = Math.floor(Math.random() * 9) - 4;
        const current = Math.max(12, base + jitter);
        badge.textContent = `${current}ms`;
      });
    }, 6000);
  }

  /* -------------------------------------------------------------
   * 6. Code Snippet Copy Buttons
   * ------------------------------------------------------------- */
  function initCodeBlockCopy() {
    const codeBlocks = document.querySelectorAll('.code-copy-btn');
    codeBlocks.forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-target');
        const codeEl = targetId ? document.getElementById(targetId) : btn.closest('.code-box-wrapper')?.querySelector('code');
        if (!codeEl) return;

        const textToCopy = codeEl.innerText;
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
          }
          const prevHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = prevHTML;
            btn.classList.remove('copied');
          }, 2000);
        } catch (e) {
          console.warn('Copy failed', e);
        }
      });
    });
  }
})();
