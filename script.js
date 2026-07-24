/**
 * AMARA SpellTech - Master Application Script
 * Single consolidated script powering navigation, dynamic components, animations, and forms.
 */
(function () {
  'use strict';

  /* ==========================================================================
     1. Dynamic Component Ingestion (Navbar & Footer)
     ========================================================================== */
  async function includeComponents() {
    const navbarHost = document.querySelector('[data-include="navbar"]');
    const footerHost = document.querySelector('[data-include="footer"]');
    const tasks = [];

    if (navbarHost) {
      tasks.push(
        fetch('./navbar.html')
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Failed to load navbar.html'))))
          .then((html) => {
            navbarHost.style.opacity = '0';
            navbarHost.style.transition = 'opacity 0.3s ease';
            navbarHost.innerHTML = html;
            requestAnimationFrame(() => (navbarHost.style.opacity = '1'));
          })
          .catch((err) => console.warn('Navbar dynamic fetch skipped/fallback.', err))
      );
    }

    if (footerHost) {
      tasks.push(
        fetch('./footer.html')
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Failed to load footer.html'))))
          .then((html) => {
            footerHost.style.opacity = '0';
            footerHost.style.transition = 'opacity 0.3s ease';
            footerHost.innerHTML = html;
            requestAnimationFrame(() => (footerHost.style.opacity = '1'));
          })
          .catch((err) => console.warn('Footer dynamic fetch skipped/fallback.', err))
      );
    }

    if (tasks.length) {
      try {
        await Promise.all(tasks);
      } catch (e) {
        // Graceful handling if viewing via file:// without local server
      }
    }
  }

  /* ==========================================================================
     2. Mobile Navigation Drawer
     ========================================================================== */
  function initMobileDrawer() {
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const drawer = document.getElementById('mobile-drawer');
    if (!nav || !navToggle || !mobileNav || !drawer) return;

    const overlay = mobileNav.querySelector('[data-mobile-nav-overlay]') || null;
    let lastFocusEl = null;

    function isOpen() {
      return nav.classList.contains('is-drawer-open');
    }

    function setOpen(open) {
      if (open) {
        if (isOpen()) return;
        lastFocusEl = document.activeElement;
        nav.classList.add('is-drawer-open');
        navToggle.setAttribute('aria-expanded', 'true');
        drawer.focus({ preventScroll: true });
        document.body.style.overflow = 'hidden';
      } else {
        if (!isOpen()) return;
        nav.classList.remove('is-drawer-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
          lastFocusEl.focus({ preventScroll: true });
        } else if (typeof navToggle.focus === 'function') {
          navToggle.focus({ preventScroll: true });
        }
      }
    }

    navToggle.addEventListener('click', () => setOpen(!isOpen()));
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        setOpen(false);
      });
    }

    drawer.querySelectorAll('.mobile-nav__link').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) setOpen(false);
    });

    drawer.addEventListener('keydown', (e) => {
      if (!isOpen() || e.key !== 'Tab') return;
      const items = Array.from(
        drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
      if (!items.length) return;
      const first = items[0],
        last = items[items.length - 1],
        active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    });
  }

  /* ==========================================================================
     3. Active Navigation State & Underline Bar
     ========================================================================== */
  function updateNavUnderlineImmediate() {
    const underline = document.querySelector('.nav-underline');
    if (!underline) return;
    const activeLink =
      document.querySelector('.nav-links a.nav-link[data-active="true"]') ||
      document.querySelector('.nav-links a.nav-link[data-nav="home"]');
    if (!activeLink) return;
    const navLinks = underline.closest('.nav-links-wrap');
    const wrap = navLinks || underline.parentElement;
    const containerRect = wrap.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - containerRect.left;
    underline.style.width = `${linkRect.width}px`;
    underline.style.transform = `translateX(${left}px)`;
  }

  function setActiveNavByUrl() {
    const pathname = window.location.pathname;
    const links = document.querySelectorAll('.nav-links a.nav-link');
    if (!links.length) return;
    let activeData = 'home';
    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.includes('index.html') && pathname.endsWith('index.html')) activeData = 'home';
      else if (href.includes('services.html') && pathname.endsWith('services.html')) activeData = 'services';
      else if (href.includes('projects.html') && pathname.endsWith('projects.html')) activeData = 'projects';
      else if (href.includes('about-us.html') && pathname.endsWith('about-us.html')) activeData = 'about';
      else if (href.includes('contact.html') && pathname.endsWith('contact.html')) activeData = 'contact';
      else if (pathname.endsWith('/') || pathname === '') activeData = 'home';
    });
    links.forEach((a) => (a.dataset.active = a.dataset.nav === activeData ? 'true' : 'false'));
  }

  function initNavUnderline() {
    const links = document.querySelectorAll('.nav-links a.nav-link');
    const underline = document.querySelector('.nav-underline');
    if (!underline || !links.length) return;
    setActiveNavByUrl();
    updateNavUnderlineImmediate();
    links.forEach((a) => {
      a.addEventListener('click', () => {
        links.forEach((x) => (x.dataset.active = 'false'));
        a.dataset.active = 'true';
        updateNavUnderlineImmediate();
      });
    });
    window.addEventListener('resize', updateNavUnderlineImmediate);
  }

  /* ==========================================================================
     4. Footer Dynamic Year
     ========================================================================== */
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     5. Scroll Animations & Effects
     ========================================================================== */
  function initFadeInOnScroll() {
    const els = document.querySelectorAll('[data-animate-on-scroll], .fade-up');
    if (!els.length) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      els.forEach((el) => {
        el.classList.add('in-view', 'is-visible');
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view', 'is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.pageYOffset - 78;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const threshold = 300;
    let ticking = false;

    function setVisible(visible) {
      btn.classList.toggle('is-visible', !!visible);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setVisible(window.scrollY >= threshold);
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = +el.getAttribute('data-target');
            const duration = 2000;
            let startTimestamp = null;

            const step = (timestamp) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = Math.floor(easeProgress * target);

              el.innerText = current.toLocaleString();
              if (progress < 1) {
                window.requestAnimationFrame(step);
              } else {
                el.innerText = target.toLocaleString() + (el.getAttribute('data-suffix') || '');
              }
            };
            window.requestAnimationFrame(step);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => io.observe(counter));
  }

  function init3DTilt() {
    const tiltElements = document.querySelectorAll('.device-laptop, .device-phone, .premium-card');
    if (!tiltElements.length) return;

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    tiltElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        el.style.transition = 'transform 0.1s ease-out';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      });
    });
  }

  /* ==========================================================================
     6. Client-Side Form Validation
     ========================================================================== */
  function ensureErrorContainer(fieldEl) {
    const existing = fieldEl.parentElement && fieldEl.parentElement.querySelector('.field-error');
    if (existing) return existing;
    const error = document.createElement('div');
    error.className = 'field-error';
    error.setAttribute('role', 'alert');
    error.style.display = 'none';
    const parent = fieldEl.closest('.field') || fieldEl.parentElement;
    if (!parent) return null;
    parent.appendChild(error);
    return error;
  }

  function setFieldError(fieldEl, message) {
    if (!fieldEl) return;
    fieldEl.classList.add('input--invalid');
    const errorEl = ensureErrorContainer(fieldEl);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearFieldError(fieldEl) {
    if (!fieldEl) return;
    fieldEl.classList.remove('input--invalid');
    const errorEl = fieldEl.closest('.field')?.querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function isValidFullName(name) {
    const v = String(name || '').trim();
    if (v.length < 3) return false;
    const normalized = v.replace(/\s+/g, ' ');
    return /^[A-Za-z ]+$/.test(normalized);
  }

  function initForms() {
    const contactForm = document.getElementById('contact-form') || document.querySelector('.contact-panel form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      let ok = true;
      contactForm.querySelectorAll('.input--invalid').forEach((el) => el.classList.remove('input--invalid'));
      contactForm.querySelectorAll('.field-error').forEach((el) => {
        el.textContent = '';
        el.style.display = 'none';
      });

      const nameField = contactForm.querySelector('input[name="name"]');
      const emailField = contactForm.querySelector('input[type="email"][name="email"]');
      const topicField = contactForm.querySelector('select[name="topic"]');
      const preferredField = contactForm.querySelector('select[name="preferred"]');
      const messageField = contactForm.querySelector('textarea[name="message"]');

      if (!nameField || !isValidFullName(nameField.value)) {
        ok = false;
        setFieldError(nameField, 'Please enter a valid full name (letters and spaces only, min 3 chars).');
      }
      if (!emailField || !isValidEmail(emailField.value)) {
        ok = false;
        setFieldError(emailField, 'Please enter a valid email address.');
      }
      if (!topicField || !topicField.value) {
        ok = false;
        setFieldError(topicField, 'Please select a topic.');
      }
      if (!preferredField || !preferredField.value) {
        ok = false;
        setFieldError(preferredField, 'Please select your preferred contact method.');
      }
      const msgVal = (messageField && messageField.value || '').trim();
      if (!messageField || msgVal.length < 10) {
        ok = false;
        setFieldError(messageField, 'Please enter a message (minimum 10 characters).');
      }

      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
        const firstInvalid = contactForm.querySelector('.input--invalid');
        if (firstInvalid && typeof firstInvalid.focus === 'function') {
          firstInvalid.focus({ preventScroll: true });
        }
      }
    });

    contactForm.addEventListener('input', (e) => {
      const t = e.target;
      if (!t) return;
      if (t.classList.contains('input--invalid')) {
        const name = (t.name || '').toLowerCase();
        let valid = false;
        if (t.type === 'text' && name === 'name') valid = isValidFullName(t.value);
        else if (t.type === 'email') valid = isValidEmail(t.value);
        else if (t.tagName === 'SELECT') valid = !!t.value;
        else if (t.tagName === 'TEXTAREA') valid = (t.value || '').trim().length >= 10;
        if (valid) clearFieldError(t);
      }
    });
  }

  /* ==========================================================================
     7. Floating WhatsApp Interactive Widget
     ========================================================================== */
  function initWhatsAppWidget() {
    if (document.querySelector('.wa-widget-wrap')) return;

    const PRIMARY_NUM = '916369183487';   // Web & App, AI Chatbots, Designs
    const SECONDARY_NUM = '917708314327'; // IoT, General Enquiry

    const services = [
      {
        name: 'Web and App Development',
        icon: '🌐',
        number: PRIMARY_NUM,
        msg: "Hi AMARA SpellTech! I'm interested in Web and App Development."
      },
      {
        name: 'AI Chatbots and Solutions',
        icon: '🤖',
        number: PRIMARY_NUM,
        msg: "Hi AMARA SpellTech! I'm interested in AI Chatbots and Solutions."
      },
      {
        name: 'Designs',
        icon: '🎨',
        number: PRIMARY_NUM,
        msg: "Hi AMARA SpellTech! I'm interested in Design & Branding services."
      },
      {
        name: 'IoT',
        icon: '⚡',
        number: SECONDARY_NUM,
        msg: "Hi AMARA SpellTech! I'm interested in IoT & Robotics solutions."
      },
      {
        name: 'General Enquiry',
        icon: '💬',
        number: SECONDARY_NUM,
        msg: "Hi AMARA SpellTech! I have a general enquiry about your services."
      }
    ];

    const wrap = document.createElement('div');
    wrap.className = 'wa-widget-wrap';

    const optionsHtml = services.map(s => {
      const url = `https://wa.me/${s.number}?text=${encodeURIComponent(s.msg)}`;
      return `
        <a class="wa-option-item" href="${url}" target="_blank" rel="noopener noreferrer">
          <span class="wa-option-label">
            <span class="wa-option-icon">${s.icon}</span>
            <span>${s.name}</span>
          </span>
          <span class="wa-arrow">➔</span>
        </a>
      `;
    }).join('');

    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="#FFFFFF" d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

    wrap.innerHTML = `
      <div class="wa-card" id="wa-card-popup">
        <div class="wa-card-header">
          <div class="wa-card-header-left">
            <div class="wa-avatar">
              ${svgIcon}
            </div>
            <div>
              <div class="wa-title">AMARA Support</div>
              <div class="wa-status"><span class="wa-status-dot"></span> Online | Instant Reply</div>
            </div>
          </div>
          <button class="wa-close-btn" id="wa-close-btn" aria-label="Close card">&times;</button>
        </div>
        <div class="wa-card-body">
          <div class="wa-msg-bubble">
            Hello! 👋 Welcome to AMARA SpellTech. Select a service to chat directly with us on WhatsApp:
          </div>
          <div class="wa-services-title">Select Service</div>
          <div class="wa-options-list">
            ${optionsHtml}
          </div>
        </div>
        <div class="wa-card-footer">
          ⚡ Powered by AMARA SpellTech
        </div>
      </div>
      <button class="wa-btn" id="wa-trigger-btn" aria-label="Chat on WhatsApp" title="Chat with AMARA SpellTech">
        <span class="wa-badge-dot"></span>
        ${svgIcon}
      </button>
    `;

    (document.body || document.documentElement).appendChild(wrap);

    const card = wrap.querySelector('#wa-card-popup');
    const triggerBtn = wrap.querySelector('#wa-trigger-btn');
    const closeBtn = wrap.querySelector('#wa-close-btn');

    function toggleCard(open) {
      const isCurrentlyOpen = card.classList.contains('is-open');
      const shouldOpen = typeof open === 'boolean' ? open : !isCurrentlyOpen;
      card.classList.toggle('is-open', shouldOpen);
      triggerBtn.classList.toggle('is-active', shouldOpen);
    }

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard();
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(false);
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target) && card.classList.contains('is-open')) {
        toggleCard(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && card.classList.contains('is-open')) {
        toggleCard(false);
      }
    });
  }

  /* ==========================================================================
     9. Page Navigation Swipe Gestures & Slide Transitions
     ========================================================================== */
  function initPageSwipeTransitions() {
    const navOrder = [
      'index.html',
      'about-us.html',
      'services.html',
      'projects.html',
      'contact.html'
    ];

    const pageTitles = {
      'index.html': 'Home',
      'about-us.html': 'About Us',
      'services.html': 'Services',
      'projects.html': 'Projects',
      'contact.html': 'Contact'
    };

    function getCurrentPageIndex() {
      const pathname = window.location.pathname;
      for (let i = 0; i < navOrder.length; i++) {
        if (pathname.endsWith(navOrder[i])) return i;
      }
      return 0; // Default to index.html
    }

    const currentIndex = getCurrentPageIndex();

    // Check if we arrived via slide transition
    const slideDir = sessionStorage.getItem('pageSlideDir');
    if (slideDir) {
      sessionStorage.removeItem('pageSlideDir');
      document.body.classList.add(slideDir === 'left' ? 'page-slide-in-left' : 'page-slide-in-right');
    }

    let toastEl = null;
    function showSwipeToast(msg) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'swipe-indicator-toast';
        document.body.appendChild(toastEl);
      }
      toastEl.innerHTML = `<span style="color:var(--cyan)">●</span> ${msg}`;
      toastEl.classList.add('is-visible');
    }

    function navigateToPage(targetUrl, direction) {
      if (document.body.classList.contains('is-navigating')) return;
      document.body.classList.add('is-navigating');

      const isLeft = direction === 'left';
      sessionStorage.setItem('pageSlideDir', isLeft ? 'left' : 'right');
      document.body.classList.add(isLeft ? 'page-slide-out-left' : 'page-slide-out-right');

      const filename = targetUrl.replace('./', '').split('?')[0];
      const pageTitle = pageTitles[filename] || 'Page';
      showSwipeToast(isLeft ? `Swiping to ${pageTitle} →` : `← Swiping to ${pageTitle}`);

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 250);
    }

    // Intercept internal HTML link clicks for smooth page sliding
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';

      if (href.endsWith('.html') && !href.startsWith('http') && !anchor.hasAttribute('target')) {
        const targetFilename = href.replace('./', '');
        let targetIdx = -1;
        for (let i = 0; i < navOrder.length; i++) {
          if (targetFilename.includes(navOrder[i])) { targetIdx = i; break; }
        }

        if (targetIdx !== -1 && targetIdx !== currentIndex) {
          e.preventDefault();
          const dir = targetIdx > currentIndex ? 'left' : 'right';
          navigateToPage(href, dir);
        }
      }
    });

    // Touch Swipe Gesture Detection
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const minSwipeDistance = 70;
    const maxVerticalRatio = 1.2;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!touchStartX || !touchStartY) return;
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;

      handleSwipe();
      touchStartX = 0;
      touchStartY = 0;
    }, { passive: true });

    function handleSwipe() {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * maxVerticalRatio) {
        if (deltaX < 0) {
          // Swipe Left -> Next Page
          if (currentIndex < navOrder.length - 1) {
            navigateToPage(navOrder[currentIndex + 1], 'left');
          }
        } else {
          // Swipe Right -> Previous Page
          if (currentIndex > 0) {
            navigateToPage(navOrder[currentIndex - 1], 'right');
          }
        }
      }
    }

    // Keyboard Arrow Key Shortcuts (Left / Right Arrows)
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight') {
        if (currentIndex < navOrder.length - 1) {
          navigateToPage(navOrder[currentIndex + 1], 'left');
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          navigateToPage(navOrder[currentIndex - 1], 'right');
        }
      }
    });
  }

  /* ==========================================================================
     10. App Master Initialization Sequence
     ========================================================================== */
  function initApp() {
    initMobileDrawer();
    initFooterYear();
    initNavUnderline();
    initFadeInOnScroll();
    initSmoothScroll();
    initBackToTop();
    initCounters();
    init3DTilt();
    initForms();
    initWhatsAppWidget();
    initPageSwipeTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      includeComponents().finally(initApp);
    });
  } else {
    includeComponents().finally(initApp);
  }
})();
