/* ============================================================
   SUPERIOR TREE AND STUMP — SCRIPTS
   ============================================================ */

/* ── 1. LOAD INCLUDES ──────────────────────────────────────── */
async function loadIncludes() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  try {
    if (headerPlaceholder) {
      const res = await fetch('includes/header.html');
      if (res.ok) {
        headerPlaceholder.innerHTML = await res.text();
      }
    }
  } catch (_) { /* silent fail */ }

  try {
    if (footerPlaceholder) {
      const res = await fetch('includes/footer.html');
      if (res.ok) {
        footerPlaceholder.innerHTML = await res.text();
      }
    }
  } catch (_) { /* silent fail */ }

  setFooterYear();
  initNav();
  setActiveNavLink();
}

/* ── Footer year helper ────────────────────────────────────── */
function setFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ── 2. INIT NAV ───────────────────────────────────────────── */
function initNav() {
  const header   = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const navDrawer = document.querySelector('.nav-drawer');
  const navOverlay = document.querySelector('.nav-overlay');
  const drawerClose = document.querySelector('.nav-drawer__close');
  const drawerLinks = document.querySelectorAll('.nav-drawer__link, .nav-drawer__cta');

  if (!header) return;

  /* Scroll-shrink ------------------------------------------------ */
  function handleScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (!hamburger || !navDrawer || !navOverlay) return;

  /* Drawer open/close -------------------------------------------- */
  function openDrawer() {
    hamburger.classList.add('is-active');
    navDrawer.classList.add('is-active');
    navOverlay.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = navDrawer.querySelector('.nav-drawer__link');
    if (firstLink) firstLink.focus();
  }

  function closeDrawer() {
    hamburger.classList.remove('is-active');
    navDrawer.classList.remove('is-active');
    navOverlay.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    navDrawer.classList.contains('is-active') ? closeDrawer() : openDrawer();
  });

  navOverlay.addEventListener('click', closeDrawer);
  if (drawerClose) drawerClose.addEventListener('click', () => { closeDrawer(); hamburger.focus(); });

  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer.classList.contains('is-active')) {
      closeDrawer();
      hamburger.focus();
    }
  });
}

/* ── 3. SET ACTIVE NAV LINK ────────────────────────────────── */
function setActiveNavLink() {
  const pathname = window.location.pathname;
  const filename = pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav__link, .nav-drawer__link, .nav__dropdown-link').forEach(link => {
    const href     = link.getAttribute('href') || '';
    const linkFile = href.split('/').pop() || 'index.html';

    const isHome = (filename === '' || filename === 'index.html') &&
                   (linkFile === 'index.html' || href === 'index.html');
    const isMatch = linkFile === filename;

    if (isHome || (!isHome && isMatch && filename !== '')) {
      link.classList.add('active');
      if (link.classList.contains('nav__dropdown-link')) {
        const dropdown = link.closest('.nav__item--dropdown');
        const trigger = dropdown && dropdown.querySelector('.nav__link--dropdown');
        if (trigger) trigger.classList.add('active');
      }
    }
  });
}

/* ── 4. SMOOTH SCROLL ──────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ── 5. SCROLL REVEAL ANIMATIONS ──────────────────────────── */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  document.querySelectorAll('.animate-stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      observer.observe(child);
    });
  });
}

/* ── 6. COUNTER ANIMATION ──────────────────────────────────── */
function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.stat-number').forEach(el => {
      const t = el.dataset.target;
      el.textContent = (t !== undefined ? t : el.textContent) + (el.dataset.suffix || '');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el       = entry.target;
      const target   = parseFloat(el.dataset.target);
      const suffix   = el.dataset.suffix || '';

      if (isNaN(target) || target === 0) {
        el.textContent = (el.dataset.target || '0') + suffix;
        return;
      }

      const decimals = parseInt(el.dataset.decimals) || 0;
      const duration = 1800;
      const start    = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals) + (progress === 1 ? suffix : '');
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
}

/* ── 7. CALL BAR ───────────────────────────────────────────── */
function initCallBar() {
  const callBar = document.querySelector('.call-bar');
  if (!callBar) return;

  if (sessionStorage.getItem('callBarDismissed')) return;

  setTimeout(() => {
    callBar.classList.add('is-visible');
  }, 2000);

  const dismissBtn = callBar.querySelector('.call-bar__dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      callBar.classList.remove('is-visible');
      sessionStorage.setItem('callBarDismissed', '1');
    });
  }
}

/* ── 8. CONTACT FORM ───────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  function validateField(field) {
    const parent = field.closest('.form-group');
    if (!parent) return true;
    parent.classList.remove('form-field--error');

    if (field.required && !field.value.trim()) {
      parent.classList.add('form-field--error');
      return false;
    }

    if (field.type === 'email' && field.value.trim()) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(field.value)) {
        parent.classList.add('form-field--error');
        return false;
      }
    }

    return true;
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      const parent = field.closest('.form-group');
      if (parent && parent.classList.contains('form-field--error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) return;

    const successMsg = document.querySelector('.form-success');
    form.style.display = 'none';

    if (successMsg) {
      successMsg.classList.add('is-visible');
    } else {
      const msg = document.createElement('div');
      msg.className = 'form-success is-visible';
      msg.innerHTML = 'Thanks — we\'ll be in touch soon! For urgent jobs call <a href="tel:+61431636925">0431 636 925</a> directly.';
      form.parentNode.insertBefore(msg, form.nextSibling);
    }
  });
}

/* ── 9. FAQ ACCORDION ──────────────────────────────────────── */
function initFaq() {
  document.querySelectorAll('.faq__item').forEach(details => {
    const summary = details.querySelector('.faq__question');
    const answer  = details.querySelector('.faq__answer');
    if (!summary || !answer) return;

    answer.style.overflow   = 'hidden';
    answer.style.transition = 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)';
    answer.style.maxHeight  = details.open ? answer.scrollHeight + 'px' : '0';

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (details.open) {
        answer.style.maxHeight = '0';
        setTimeout(() => { details.open = false; }, 360);
      } else {
        /* Close any other open items first */
        document.querySelectorAll('.faq__item[open]').forEach(other => {
          if (other !== details) {
            const otherAnswer = other.querySelector('.faq__answer');
            if (otherAnswer) otherAnswer.style.maxHeight = '0';
            setTimeout(() => { other.open = false; }, 360);
          }
        });

        details.open = true;
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ── DOMContentLoaded ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadIncludes().then(() => {
    initSmoothScroll();
    initScrollAnimations();
    initCounters();
    initCallBar();
    initContactForm();
    initFaq();
  });
});
