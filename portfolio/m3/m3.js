/* ingatin · shared Material 3 behaviours for portfolio demos (no dependencies). */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const THEME_KEY = 'm3-theme:' + (document.body.dataset.site || location.pathname);

  /* ---------- Theme (light / dark) ---------- */
  const systemDark = () => matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = () => root.dataset.theme || (systemDark() ? 'dark' : 'light');
  function syncThemeButtons() {
    const dark = currentTheme() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-label', dark ? 'Gunakan tema terang' : 'Gunakan tema gelap');
      b.title = b.getAttribute('aria-label');
      const icon = b.querySelector('.ms');
      if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--md-sys-color-surface').trim() || meta.content;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme-toggle]');
    if (!b) return;
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* private mode */ }
    syncThemeButtons();
  });

  /* ---------- Ripple ---------- */
  const RIPPLE = '.btn, .icon-btn, .fab, .chip:not(.static), .tab, .drawer-item, .nav-links a, .list-item.interactive, .card.interactive';
  document.addEventListener('pointerdown', (e) => {
    if (reduceMotion.matches || e.button !== 0) return;
    const host = e.target.closest(RIPPLE);
    if (!host || host.disabled) return;
    const r = host.getBoundingClientRect();
    const size = Math.hypot(Math.max(e.clientX - r.left, r.right - e.clientX), Math.max(e.clientY - r.top, r.bottom - e.clientY)) * 2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.overflow = 'hidden';
    host.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });

  /* ---------- Top app bar ---------- */
  const bar = document.querySelector('.top-app-bar');
  const onScroll = () => { if (bar) bar.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Dialogs, drawer, sheets ---------- */
  function openDialog(d, opener) {
    if (!d || d.open) return;
    d._opener = opener || document.activeElement;
    d.showModal();
    if (d.hasAttribute('data-focus-self')) { d.tabIndex = -1; d.focus(); }
    d.dispatchEvent(new CustomEvent('m3:open'));
  }
  function closeDialog(d) { if (d && d.open) d.close(); }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-dialog-open]');
    if (opener) { e.preventDefault(); openDialog(document.getElementById(opener.dataset.dialogOpen), opener); return; }
    const closer = e.target.closest('[data-dialog-close]');
    if (closer) { closeDialog(closer.closest('dialog')); return; }
    // light dismiss: click on the backdrop area of a dialog
    if (e.target instanceof HTMLDialogElement && e.target.open && !e.target.hasAttribute('data-no-light-dismiss')) {
      const r = e.target.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeDialog(e.target);
    }
    // links inside the nav drawer close it
    const navLink = e.target.closest('.nav-drawer a[href^="#"]');
    if (navLink) closeDialog(navLink.closest('dialog'));
  });
  document.addEventListener('close', (e) => {
    const d = e.target;
    if (d instanceof HTMLDialogElement && d._opener && document.contains(d._opener)) d._opener.focus({ preventScroll: true });
  }, true);

  /* ---------- Scroll spy for nav links ---------- */
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"], .nav-drawer a[href^="#"]')];
  const sections = [...new Set(navLinks.map((a) => a.getAttribute('href')))].map((h) => document.querySelector(h)).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const visible = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => visible.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0));
      let best = null, bestRatio = 0;
      sections.forEach((s) => { const r = visible.get(s.id) || 0; if (r > bestRatio) { best = s.id; bestRatio = r; } });
      navLinks.forEach((a) => a.setAttribute('aria-current', String(best !== null && a.getAttribute('href') === '#' + best)));
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .01, .25, .5, 1] });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Tabs (role=tablist) ---------- */
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      list.dispatchEvent(new CustomEvent('m3:tab', { detail: { tab } }));
    };
    tabs.forEach((t) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(t);
        const next = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1] }[e.key];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  /* ---------- Single-select groups: [data-single-select] > [aria-pressed] ---------- */
  document.addEventListener('click', (e) => {
    const item = e.target.closest('[data-single-select] > [aria-pressed]');
    if (!item) return;
    const group = item.parentElement;
    group.querySelectorAll(':scope > [aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', String(b === item)));
    group.dispatchEvent(new CustomEvent('m3:select', { detail: { value: item.dataset.value, item }, bubbles: true }));
  });

  /* ---------- Snackbar ---------- */
  let snackTimer;
  function hideSnackbar() { const el = document.querySelector('.snackbar'); if (el) el.classList.remove('show'); }
  function snackbar(message, opts = {}) {
    let el = document.querySelector('.snackbar');
    if (!el) {
      el = document.createElement('div');
      el.className = 'snackbar';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    const msg = document.createElement('span'); msg.className = 'msg'; msg.textContent = message; el.appendChild(msg);
    if (opts.action) {
      const a = document.createElement('button'); a.type = 'button'; a.className = 'btn btn-text'; a.textContent = opts.action;
      a.addEventListener('click', () => { hide(); opts.onAction && opts.onAction(); });
      el.appendChild(a);
    }
    const x = document.createElement('button'); x.type = 'button'; x.className = 'icon-btn'; x.setAttribute('aria-label', 'Tutup');
    x.innerHTML = '<span class="ms">close</span>'; x.addEventListener('click', hide); el.appendChild(x);
    function hide() { el.classList.remove('show'); }
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(snackTimer);
    snackTimer = setTimeout(hide, opts.duration || 4000);
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || reduceMotion.matches) reveals.forEach((r) => r.classList.add('in'));
    else {
      const rio = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      }), { rootMargin: '0px 0px -8% 0px' });
      reveals.forEach((r) => rio.observe(r));
    }
  }

  /* ---------- Helpers ---------- */
  const rupiah = (n) => 'Rp' + Math.round(n).toLocaleString('id-ID');
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /** Validate a form, flag invalid fields (works with :user-invalid fallback). */
  function validate(form) {
    let firstBad = null;
    form.querySelectorAll('.field').forEach((f) => {
      const input = f.querySelector('.field-input');
      if (!input) return;
      const ok = input.checkValidity();
      f.classList.toggle('error', !ok);
      const support = f.querySelector('.field-support');
      if (support) {
        if (!support.dataset.default) support.dataset.default = support.textContent;
        support.textContent = ok ? support.dataset.default : (input.dataset.error || input.validationMessage);
      }
      if (!ok && !firstBad) firstBad = input;
      if (!input._m3bound) {
        input._m3bound = true;
        input.addEventListener('input', () => { if (input.checkValidity()) { f.classList.remove('error'); if (support) support.textContent = support.dataset.default; } });
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  syncThemeButtons();
  window.M3 = { openDialog, closeDialog, snackbar, hideSnackbar, rupiah, validate, reduceMotion };
})();
