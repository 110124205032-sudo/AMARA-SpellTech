(function () {
  async function includeComponents() {
    const navbarHost = document.querySelector('[data-include="navbar"]');
    const footerHost = document.querySelector('[data-include="footer"]');
    const tasks = [];

    if (navbarHost) {
      tasks.push(
        fetch('./navbar.html')
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Failed to load navbar.html'))))
          .then((html) => {
            navbarHost.style.opacity = 0;
            navbarHost.style.transition = 'opacity 0.3s ease';
            navbarHost.innerHTML = html;
            requestAnimationFrame(() => navbarHost.style.opacity = 1);
          })
          .catch((err) => console.error('Navbar fallback skipped.', err))
      );
    }

    if (footerHost) {
      tasks.push(
        fetch('./footer.html')
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Failed to load footer.html'))))
          .then((html) => {
            footerHost.style.opacity = 0;
            footerHost.style.transition = 'opacity 0.3s ease';
            footerHost.innerHTML = html;
            requestAnimationFrame(() => footerHost.style.opacity = 1);
          })
          .catch((err) => console.error('Footer fallback skipped.', err))
      );
    }

    if (tasks.length) await Promise.all(tasks);
  }

  function initMobileDrawer() {
    const nav = document.querySelector('.nav');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const drawer = document.getElementById('mobile-drawer');
    if (!nav || !navToggle || !mobileNav || !drawer) return;

    const overlay = mobileNav.querySelector('[data-mobile-nav-overlay]') || null;
    let lastFocusEl = null;

    function isOpen() { return nav.classList.contains('is-drawer-open'); }

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
        if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus({ preventScroll: true });
        else if (typeof navToggle.focus === 'function') navToggle.focus({ preventScroll: true });
      }
    }

    navToggle.addEventListener('click', () => setOpen(!isOpen()));
    if (overlay) overlay.addEventListener('click', (e) => { e.preventDefault(); setOpen(false); });
    drawer.querySelectorAll('.mobile-nav__link').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) setOpen(false); });

    drawer.addEventListener('keydown', (e) => {
      if (!isOpen() || e.key !== 'Tab') return;
      const items = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
        .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1], active = document.activeElement;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus({ preventScroll: true }); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus({ preventScroll: true }); }
    });
  }

  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function updateNavUnderlineImmediate() {
    const underline = document.querySelector('.nav-underline');
    if (!underline) return;
    const activeLink = document.querySelector('.nav-links a.nav-link[data-active="true"]') || document.querySelector('.nav-links a.nav-link[data-nav="home"]');
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
      else if (pathname.endsWith('') && a.getAttribute('data-nav') === 'home') activeData = 'home';
    });
    links.forEach((a) => a.dataset.active = a.dataset.nav === activeData ? 'true' : 'false');
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

  // Boot Sequence
  includeComponents().finally(() => {
    initMobileDrawer();
    initFooterYear();
    initNavUnderline();
    
    // Initialize other modules if they are loaded
    if (window.initAnimations) window.initAnimations();
    if (window.initForms) window.initForms();
  });

})();
