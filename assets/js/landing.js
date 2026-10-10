/* ingatin — landing page behaviour (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- Theme ---------- */
  const themeBtn = $('#theme-toggle');
  function setTheme(t, persist) {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap');
    if (persist) { try { localStorage.setItem('ingatin-theme', t); } catch (_) { /* private mode */ } }
    applySwatch();
  }
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

  /* ---------- Nav: solid after the first scroll, mobile sheet, dropdowns ---------- */
  const nav = $('#nav');
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none';
  document.body.prepend(sentinel);
  let scrolled = false;
  const syncNav = () => nav.classList.toggle('is-solid', scrolled || !menu.hidden);
  new IntersectionObserver(([en]) => { scrolled = !en.isIntersecting; syncNav(); }).observe(sentinel);

  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    syncNav();
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  const menuButtons = $$('.has-menu > .nav-link');
  const closeMenus = (except) => menuButtons.forEach((b) => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  menuButtons.forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') !== 'true';
    closeMenus(b);
    b.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-menu')) closeMenus(); });
  $$('.dropdown a').forEach((a) => a.addEventListener('click', () => { closeMenus(); a.blur(); }));
  // Escape closes a dropdown even while it is held open by hover or focus-within.
  menuButtons.forEach((b) => {
    const item = b.parentElement;
    b.addEventListener('click', () => item.classList.remove('is-closed'));
    item.addEventListener('mouseleave', () => item.classList.remove('is-closed'));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) item.classList.remove('is-closed'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openBtn = menuButtons.find((b) => b.getAttribute('aria-expanded') === 'true' || b.parentElement.matches(':focus-within, :hover'));
    if (openBtn) { closeMenus(); openBtn.parentElement.classList.add('is-closed'); openBtn.focus(); }
    if (!menu.hidden) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Case-study tabs ---------- */
  const tabs = $$('.case-tab');
  function selectCase(id, focus) {
    tabs.forEach((t) => {
      const on = t.dataset.case === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (on && panel.hidden) {
        panel.hidden = false;
        panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering');
      } else if (!on) panel.hidden = true;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectCase(t.dataset.case, false));
    t.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); selectCase(tabs[e.key === 'Home' ? 0 : tabs.length - 1].dataset.case, true); return; }
      if (!step) return;
      e.preventDefault();
      selectCase(tabs[(i + step + tabs.length) % tabs.length].dataset.case, true);
    });
  });
  // Links elsewhere on the page ("Studi kasus: …", portfolio dropdown) open the matching tab.
  $$('a[data-case]').forEach((a) => a.addEventListener('click', () => selectCase(a.dataset.case, false)));

  /* ---------- "Warna dari logo Anda" live swatch ---------- */
  const schemes = window.M3_SCHEMES || {};
  const picker = $('#seed-picker');
  const demo = $('#swatch-demo');
  const LABELS = { ingatin: 'ingatin', 'lumbung-niaga': 'Lumbung Niaga', 'rara-roastery': 'Rara Roastery', 'kirana-ubud': 'Kirana Ubud', plum: 'Plum', kunyit: 'Kunyit' };
  const ROLES = [['primary', 'Utama'], ['secondary', 'Kedua'], ['tertiary', 'Ketiga'], ['primary-container', 'Wadah'], ['surface-container-high', 'Latar']];
  const label = (id) => LABELS[id] || (schemes[id] && schemes[id].label) || id;
  let seedId = schemes.ingatin ? 'ingatin' : Object.keys(schemes)[0];

  function applySwatch() {
    const s = schemes[seedId];
    if (!s || !demo) return;
    const c = s[root.dataset.theme === 'dark' ? 'dark' : 'light'];
    Object.entries(c).forEach(([k, v]) => demo.style.setProperty(`--md-${k}`, v));
    $('#sd-name').textContent = `Website ${label(seedId)}`;
    $('#sd-roles').innerHTML = ROLES.map(([k, n]) => `<span><i style="background:${c[k]}"></i>${n}</span>`).join('');
  }
  if (picker && seedId) {
    picker.innerHTML = Object.keys(schemes).map((id) =>
      `<button class="seed" type="button" role="radio" aria-checked="${id === seedId}" tabindex="${id === seedId ? 0 : -1}" data-seed="${id}" style="--c:${schemes[id].seed}"><i aria-hidden="true"></i>${label(id)}</button>`
    ).join('');
    const seeds = $$('.seed', picker);
    const pick = (btn, focus) => {
      seedId = btn.dataset.seed;
      seeds.forEach((x) => { const on = x === btn; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
      if (focus) btn.focus();
      applySwatch();
    };
    picker.addEventListener('click', (e) => { const b = e.target.closest('.seed'); if (b) pick(b, false); });
    picker.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      const i = seeds.indexOf(document.activeElement);
      if (!step || i < 0) return;
      e.preventDefault();
      pick(seeds[(i + step + seeds.length) % seeds.length], true);
    });
  }

  /* ---------- Contact form -> WhatsApp ---------- */
  const form = $('#contact-form');
  const WA = '6281200000000';
  const doneBox = $('#form-done');

  // "Konsultasikan paket ini" / "Buat yang serupa" preselect the website type.
  $$('a[data-jenis]').forEach((a) => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="jenis"][value="${a.dataset.jenis}"]`);
    if (r) r.checked = true;
  }));

  function check(input) {
    const field = input.closest('.field');
    const ok = input.checkValidity();
    field.classList.toggle('invalid', !ok);
    field.classList.toggle('valid', ok && input.value.trim() !== '');
    input.setAttribute('aria-invalid', String(!ok));
    const help = field.querySelector('.field-help');
    if (help) help.textContent = ok ? '' : (input.dataset.error || input.validationMessage);
    return ok;
  }
  $$('.field-input[required]', form).forEach((input) => {
    input.addEventListener('blur', () => { if (input.value.trim() !== '' || input.dataset.touched) { input.dataset.touched = '1'; check(input); } });
    input.addEventListener('input', () => { if (input.dataset.touched) check(input); });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('.field-input[required]', form);
    required.forEach((i) => { i.dataset.touched = '1'; });
    const bad = required.filter((i) => !check(i));
    if (bad.length) { bad[0].focus(); return; }
    const d = new FormData(form);
    const nama = String(d.get('nama')).trim();
    const bisnis = String(d.get('bisnis') || '').trim();
    const pesan = String(d.get('pesan') || '').trim();
    const msg = [
      'Halo ingatin, saya ingin konsultasi website.',
      '',
      `Nama: ${nama}`,
      bisnis ? `Bisnis: ${bisnis}` : null,
      `Jenis website: ${d.get('jenis')}`,
      pesan ? `\n${pesan}` : null,
    ].filter((x) => x !== null).join('\n');
    $('#wa-open').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    $('#done-text').textContent = `Terima kasih, ${nama}. Buka WhatsApp untuk mengirim pesan yang sudah terisi — Anda masih bisa mengubahnya di sana.`;
    doneBox.hidden = false;
    doneBox.focus();
  });
  $('#form-reset').addEventListener('click', () => { doneBox.hidden = true; $('#f-nama').focus(); });

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  setTheme(root.dataset.theme || 'light', false);
})();
