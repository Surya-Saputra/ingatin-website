/* ingatin — landing page behaviour (vanilla JS, no dependencies) */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Theme ---------- */
  const themeBtn = $('#theme-toggle');
  function setTheme(t, persist) {
    root.dataset.theme = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap');
    themeBtn.title = themeBtn.getAttribute('aria-label');
    $('meta[name="theme-color"]').content = t === 'dark' ? '#0F1214' : '#FFFFFF';
    if (persist) { try { localStorage.setItem('ingatin-theme', t); } catch (_) { /* ignore */ } }
  }
  setTheme(root.dataset.theme || 'light', false);
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Scroll spy ---------- */
  const navLinks = $$('.main-nav a');
  const spyTargets = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const ratios = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => ratios.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0));
      let best = null, max = 0;
      spyTargets.forEach((t) => { const r = ratios.get(t.id) || 0; if (r > max) { max = r; best = t.id; } });
      navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + best)));
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, .01, .5, 1] });
    spyTargets.forEach((t) => io.observe(t));
  }

  /* ---------- Portfolio showcase ---------- */
  /* icons: filter_list, map, handshake, dark_mode, search, shopping_bag, sell, chat, event_available, bed, photo_library, receipt_long */
  const PF = {
    'lumbung-niaga': {
      url: 'lumbungniaga.co.id', name: 'PT Lumbung Niaga Nusantara', kicker: 'Company profile · Distributor FMCG',
      features: [['filter_list', 'Filter kategori produk'], ['map', 'Info 4 depo'], ['handshake', 'Formulir kemitraan'], ['dark_mode', 'Mode gelap']],
    },
    'rara-roastery': {
      url: 'rararoastery.id', name: 'Rara Roastery', kicker: 'Website jualan pribadi · Kopi',
      features: [['search', 'Pencarian & urutkan'], ['shopping_bag', 'Keranjang tersimpan'], ['sell', 'Voucher & ongkir'], ['chat', 'Checkout WhatsApp']],
    },
    'kirana-ubud': {
      url: 'kiranaubud.com', name: 'Kirana Ubud', kicker: 'Company profile · Hotel & resort',
      features: [['event_available', 'Cek ketersediaan'], ['bed', 'Pilihan kamar'], ['photo_library', 'Galeri carousel'], ['receipt_long', 'Pemesanan 3 langkah']],
    },
  };
  const schemes = window.M3_SCHEMES || {};
  const preview = $('#preview');
  const items = $$('.pf-item[data-pf]');

  function showPortfolio(id, animate) {
    const p = PF[id]; const s = schemes[id];
    items.forEach((it) => it.setAttribute('aria-selected', String(it.dataset.pf === id)));
    const set = (sel, attr, val) => { const el = $(sel); if (el) el[attr] = val; };
    set('#pv-url', 'textContent', p.url);
    set('#pv-name', 'textContent', p.name);
    set('#pv-kicker', 'textContent', p.kicker);
    set('#pv-open', 'href', `portfolio/${id}/index.html`);
    $('#pv-open').setAttribute('aria-label', `Buka demo ${p.name}`);
    ['desk', 'mob'].forEach((kind) => ['light', 'dark'].forEach((t) => {
      const img = $(`#pv-${kind}-${t}`);
      img.src = `assets/img/shots/${id}-${kind === 'desk' ? 'desktop' : 'mobile'}-${t}.webp`;
      img.alt = `Tampilan ${kind === 'desk' ? 'desktop' : 'ponsel'} ${p.name}${t === 'dark' ? ' (mode gelap)' : ''}`;
    }));
    $('#pv-features').innerHTML = p.features.map(([icon, label]) => `<li><span class="ms">${icon}</span>${label}</li>`).join('');
    if (s) {
      $('#pv-seed').textContent = s.seed.toUpperCase();
      const roles = ['primary', 'primary-container', 'secondary-container', 'tertiary-container', 'surface-container-high'];
      const mode = root.dataset.theme === 'dark' ? 'dark' : 'light';
      $('#pv-swatches').innerHTML = roles.map((r) => `<span title="${r}" style="background:${s[mode][r]}"></span>`).join('');
    }
    if (animate && !reduce.matches) {
      preview.classList.remove('swap'); void preview.offsetWidth; preview.classList.add('swap');
    }
  }
  items.forEach((it) => it.addEventListener('click', () => {
    showPortfolio(it.dataset.pf, true);
    // Stacked layout: bring the preview into view after picking an item.
    if (matchMedia('(max-width: 999px)').matches) {
      const top = preview.getBoundingClientRect().top + scrollY - 76;
      window.scrollTo({ top, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
  }));
  $('#pf-list').addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const visible = items.filter((i) => !i.closest('li').hidden);
    const idx = visible.indexOf(document.activeElement);
    if (idx < 0) return;
    e.preventDefault();
    const next = visible[(idx + (e.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length];
    next.focus(); showPortfolio(next.dataset.pf, true);
  });
  new MutationObserver(() => {
    const cur = items.find((i) => i.getAttribute('aria-selected') === 'true');
    if (cur) showPortfolio(cur.dataset.pf, false);
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  // Category tabs
  const tabs = $$('#cat-tabs [role="tab"]');
  function selectCat(tab, focus) {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    if (focus) tab.focus();
    const cat = tab.dataset.cat;
    let firstVisible = null;
    items.forEach((it) => {
      const show = cat === 'semua' || it.dataset.cats.split(' ').includes(cat);
      it.closest('li').hidden = !show;
      if (show && !firstVisible) firstVisible = it;
    });
    const current = items.find((i) => i.getAttribute('aria-selected') === 'true');
    if (firstVisible && (!current || current.closest('li').hidden)) showPortfolio(firstVisible.dataset.pf, true);
  }
  tabs.forEach((t) => {
    t.addEventListener('click', () => selectCat(t));
    t.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(t);
      const next = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length] }[e.key];
      if (next) { e.preventDefault(); selectCat(next, true); }
    });
  });
  showPortfolio('lumbung-niaga', false);

  /* ---------- Live Material 3 color demo ---------- */
  const demo = $('#m3demo');
  const picker = $('#seed-picker');
  let seedId = 'ingatin';
  let demoMode = 'light';
  const LABELS = { ingatin: 'ingatin', 'lumbung-niaga': 'Lumbung Niaga', 'rara-roastery': 'Rara Roastery', 'kirana-ubud': 'Kirana Ubud', plum: 'Plum', kunyit: 'Kunyit' };
  picker.innerHTML = Object.keys(schemes).map((id) => `<button class="seed" type="button" role="radio" aria-checked="${id === seedId}" data-seed="${id}" style="--c:${schemes[id].seed}"><i></i>${LABELS[id] || schemes[id].label}</button>`).join('');
  const ROLE_SWATCHES = [
    ['primary', 'Primary'], ['secondary', 'Secondary'], ['tertiary', 'Tertiary'],
    ['primary-container', 'P. container'], ['surface-container', 'Surface'], ['outline', 'Outline'],
  ];
  function applyDemo() {
    const s = schemes[seedId]; if (!s) return;
    const c = s[demoMode];
    Object.entries(c).forEach(([k, v]) => demo.style.setProperty(`--md-${k}`, v));
    $('#m3d-name').textContent = LABELS[seedId] || s.label;
    $('#m3d-roles').innerHTML = ROLE_SWATCHES.map(([k, label]) => `<div><i style="background:${c[k]}"></i><span>${label}</span></div>`).join('');
  }
  picker.addEventListener('click', (e) => {
    const b = e.target.closest('.seed'); if (!b) return;
    seedId = b.dataset.seed;
    $$('.seed', picker).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    applyDemo();
  });
  picker.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const seeds = $$('.seed', picker); const i = seeds.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault();
    const next = seeds[(i + (/Right|Down/.test(e.key) ? 1 : -1) + seeds.length) % seeds.length];
    next.focus(); next.click();
  });
  $$('.ds-toggle button').forEach((b) => b.addEventListener('click', () => {
    demoMode = b.dataset.mode;
    $$('.ds-toggle button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    applyDemo();
  }));
  applyDemo();

  /* ---------- Contact form -> WhatsApp ---------- */
  const form = $('#contact-form');
  const WA = '6281200000000';
  function check(input) {
    const tf = input.closest('.tf');
    const ok = input.checkValidity();
    tf.classList.toggle('invalid', !ok);
    const help = tf.querySelector('.tf-help');
    if (help) help.textContent = ok ? '' : (input.dataset.error || input.validationMessage);
    return ok;
  }
  $$('.tf-input[required]', form).forEach((i) => i.addEventListener('input', () => { if (i.closest('.tf').classList.contains('invalid')) check(i); }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('.tf-input[required]', form);
    const bad = required.filter((i) => !check(i));
    if (bad.length) { bad[0].focus(); return; }
    const d = new FormData(form);
    const msg = [
      'Halo ingatin, saya ingin konsultasi website.',
      '',
      `Nama: ${d.get('nama').trim()}`,
      d.get('bisnis').trim() ? `Bisnis: ${d.get('bisnis').trim()}` : null,
      `Jenis website: ${d.get('jenis')}`,
      d.get('pesan').trim() ? `\n${d.get('pesan').trim()}` : null,
    ].filter((x) => x !== null).join('\n');
    $('#wa-open').href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    $('#done-text').textContent = `Terima kasih, ${d.get('nama').trim()}. Klik tombol di bawah untuk membuka WhatsApp dengan pesan yang sudah terisi.`;
    const done = $('#form-done');
    done.hidden = false;
    done.focus();
  });
  $('#form-reset').addEventListener('click', () => { $('#form-done').hidden = true; form.querySelector('[name="nama"]').focus(); });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.section-head, .showcase, .bento > *, .ds-demo-wrap, .steps > *, .contact-form');
  revealEls.forEach((el) => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window) || reduce.matches) revealEls.forEach((el) => el.classList.add('in'));
  else {
    const rio = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; rio.observe(el); });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
