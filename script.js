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
            navbarHost.innerHTML = html;
          })
      );
    }

    if (footerHost) {
      tasks.push(
        fetch('./footer.html')
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Failed to load footer.html'))))
          .then((html) => {
            footerHost.innerHTML = html;
          })
      );
    }

    if (tasks.length) await Promise.all(tasks);
  }

  function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');

    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });

      // Close on link click (mobile)
      document.querySelectorAll('.nav-links a').forEach((a) => {
        a.addEventListener('click', () => {
          if (nav.classList.contains('open')) {
            nav.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
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
      else if (href.includes('career.html') && pathname.endsWith('career.html')) activeData = 'career';
      else if (href.includes('projects.html') && pathname.endsWith('projects.html')) activeData = 'projects';
      else if (href.includes('about-us.html') && pathname.endsWith('about-us.html')) activeData = 'about';
      else if (href.includes('contact.html') && pathname.endsWith('contact.html')) activeData = 'contact';
      else if (pathname.endsWith('') && a.getAttribute('data-nav') === 'home') activeData = 'home';
    });

    links.forEach((a) => {
      a.dataset.active = a.dataset.nav === activeData ? 'true' : 'false';
    });
  }

  function initSmoothScroll() {
    // Only smooth-scroll same-page anchors (href starts with #)
    // Skip if the hash target doesn't exist on this page.
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

  function initNavUnderline() {
    const links = document.querySelectorAll('.nav-links a.nav-link');
    const underline = document.querySelector('.nav-underline');
    if (!underline || !links.length) return;

    setActiveNavByUrl();
    updateNavUnderlineImmediate();

    links.forEach((a) => {
      a.addEventListener('mouseenter', () => {
        // Only preview underline on hover if it's not the active page
        // (keep glide for real navigation only)
        // We’ll still animate on click/page load via setActiveNavByUrl.
      });

      a.addEventListener('click', () => {
        links.forEach((x) => (x.dataset.active = 'false'));
        a.dataset.active = 'true';
        // animate underline before navigation, so it glides from old -> new
        updateNavUnderlineImmediate();
      });

    });

    window.addEventListener('resize', () => {
      updateNavUnderlineImmediate();
    });
  }

  // Boot
  includeComponents()

    .catch(() => {
      // If running from an environment that blocks fetch for file://,
      // the page will still render without the shared components.
    })
    .finally(() => {
      initMobileNav();
      initFooterYear();
      initSmoothScroll();
      initNavUnderline();
    });

})();


