/* ingatin — landing page behaviour (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- Theme ---------- */
  const toHex = (color) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1;
    const ctx = cv.getContext('2d');
    if (!ctx) return color;
    ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  };
  const themeBtn = $('#theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');
  function setTheme(t, persist) {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap');
    // Browser chrome follows the paper token of the active theme (normalised to hex via canvas).
    themeMeta.content = toHex(getComputedStyle(document.body).backgroundColor);
    if (persist) { try { localStorage.setItem('ingatin-theme', t); } catch (_) { /* private mode */ } }
  }
  setTheme(root.dataset.theme || 'light', false);
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

  /* ---------- Edition line ---------- */
  const now = new Date();
  const edition = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(now);
  $$('[data-edition]').forEach((el) => { el.textContent = edition; });
  $$('[data-year]').forEach((el) => { el.textContent = String(now.getFullYear()); });

  /* ---------- Live Material 3 colour plate ---------- */
  const schemes = window.M3_SCHEMES || {};
  const demo = $('#m3demo');
  const picker = $('#seed-picker');
  const LABELS = { ingatin: 'ingatin', 'lumbung-niaga': 'Lumbung Niaga', 'rara-roastery': 'Rara Roastery', 'kirana-ubud': 'Kirana Ubud', plum: 'Plum', kunyit: 'Kunyit' };
  const ROLES = [
    ['primary', 'Primary'],
    ['on-primary', 'On primary'],
    ['primary-container', 'Primary container'],
    ['secondary-container', 'Secondary container'],
    ['tertiary-container', 'Tertiary container'],
    ['surface-container', 'Surface container'],
    ['outline', 'Outline'],
  ];
  let seedId = schemes.ingatin ? 'ingatin' : Object.keys(schemes)[0];
  let demoMode = root.dataset.theme === 'dark' ? 'dark' : 'light';
  $$('.ds-toggle button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === demoMode)));
  const label = (id) => LABELS[id] || (schemes[id] && schemes[id].label) || id;

  if (picker && seedId) {
    picker.innerHTML = Object.keys(schemes).map((id) =>
      `<button class="seed" type="button" role="radio" aria-checked="${id === seedId}" tabindex="${id === seedId ? 0 : -1}" data-seed="${id}" style="--c:${schemes[id].seed}"><i aria-hidden="true"></i>${label(id)}</button>`
    ).join('');
  }

  function applyDemo() {
    const s = schemes[seedId];
    if (!s || !demo) return;
    const c = s[demoMode];
    Object.entries(c).forEach(([k, v]) => demo.style.setProperty(`--md-${k}`, v));
    $('#m3d-name').textContent = label(seedId);
    $('#legend-seed').textContent = `${label(seedId)}, ${s.seed.toUpperCase()}, mode ${demoMode === 'dark' ? 'gelap' : 'terang'}`;
    $('#m3d-roles').innerHTML = ROLES.map(([k, name]) =>
      `<div><dt><i style="background:${c[k]}" aria-hidden="true"></i>${name}</dt><dd>${c[k].toUpperCase()}</dd></div>`
    ).join('');
  }

  function selectSeed(btn, focus) {
    seedId = btn.dataset.seed;
    $$('.seed', picker).forEach((x) => {
      const on = x === btn;
      x.setAttribute('aria-checked', String(on));
      x.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    applyDemo();
  }
  if (picker) {
    picker.addEventListener('click', (e) => { const b = e.target.closest('.seed'); if (b) selectSeed(b, false); });
    picker.addEventListener('keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (!(e.key in keys)) return;
      const seeds = $$('.seed', picker);
      const i = seeds.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      selectSeed(seeds[(i + keys[e.key] + seeds.length) % seeds.length], true);
    });
  }
  $$('.ds-toggle button').forEach((b) => b.addEventListener('click', () => {
    demoMode = b.dataset.mode;
    $$('.ds-toggle button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    applyDemo();
  }));
  applyDemo();

  /* ---------- Contact form -> WhatsApp ---------- */
  const form = $('#contact-form');
  const WA = '6281200000000';
  const doneBox = $('#form-done');

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
  // "Touched" pattern: validate on blur, then live once the field has been touched.
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
})();
