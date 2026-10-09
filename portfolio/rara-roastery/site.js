/* Rara Roastery — catalog, product dialog, cart & WhatsApp checkout */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rp = M3.rupiah;
  const WA_NUMBER = '6281300000000';
  const CART_KEY = 'rara-cart-v1';

  /* ---------- Data ---------- */
  const SIZES = [
    { id: '200', label: '200 g', mult: 1 },
    { id: '500', label: '500 g', mult: 2.35 },
    { id: '1000', label: '1 kg', mult: 4.5 },
  ];
  const GRIND_TYPES = new Set(['arabika', 'robusta']);
  const PRODUCTS = [
    { id: 'gayo-wine', cat: 'arabika', name: 'Gayo Wine Process', origin: 'Aceh Tengah · Arabika', img: 'img/gayo.webp', price: 98000, pop: 1, badge: 'Terlaris',
      notes: ['Anggur merah', 'Cokelat hitam', 'Kayu manis'], roast: .42, specs: { Proses: 'Wine (anaerob)', Ketinggian: '1.500 mdpl', Varietas: 'Ateng, Tim-tim' },
      desc: 'Buah ceri difermentasi 30 hari sebelum dijemur. Manis, asam lembut, dan aroma seperti anggur. Enak diseduh V60 tanpa gula.' },
    { id: 'kintamani', cat: 'arabika', name: 'Kintamani Natural', origin: 'Bangli, Bali · Arabika', img: 'img/kintamani.webp', price: 89000, pop: 3,
      notes: ['Jeruk', 'Gula aren', 'Stroberi'], roast: .3, specs: { Proses: 'Natural', Ketinggian: '1.400 mdpl', Varietas: 'Kopyol, S795' },
      desc: 'Dari kebun Subak Abian di lereng Batur. Segar dan cerah, cocok untuk yang baru mencoba kopi fruity.' },
    { id: 'toraja', cat: 'arabika', name: 'Toraja Sapan', origin: 'Tana Toraja · Arabika', img: 'img/toraja.webp', price: 92000, pop: 4,
      notes: ['Karamel', 'Kacang panggang', 'Rempah'], roast: .55, specs: { Proses: 'Full wash', Ketinggian: '1.600 mdpl', Varietas: 'Typica, S795' },
      desc: 'Body tebal dan manis karamel. Paling fleksibel: enak untuk tubruk, V60, maupun french press.' },
    { id: 'robusta', cat: 'robusta', name: 'Robusta Temanggung', origin: 'Jawa Tengah · Robusta fine', img: 'img/robusta.webp', price: 62000, pop: 5,
      notes: ['Cokelat', 'Gula merah', 'Tembakau manis'], roast: .72, specs: { Proses: 'Natural petik merah', Ketinggian: '900 mdpl', Varietas: 'BP 42, BP 358' },
      desc: 'Robusta petik merah yang pahitnya bersih. Teman setia kopi tubruk pagi dan es kopi susu.' },
    { id: 'pagi-blend', cat: 'robusta', name: 'Blend “Pagi”', origin: 'Gayo 60% · Temanggung 40%', img: 'img/blend.webp', price: 72000, pop: 2, badge: 'Untuk kopi susu',
      notes: ['Cokelat susu', 'Karamel', 'Kacang'], roast: .64, specs: { Proses: 'Campuran', Ketinggian: '900–1.500 mdpl', Varietas: 'Arabika + Robusta' },
      desc: 'Racikan andalan untuk espresso dan kopi susu gula aren. Tetap terasa kopinya walau dicampur susu.' },
    { id: 'dripbag', cat: 'praktis', name: 'Drip Bag Sampler', origin: 'Isi 10 · 4 varian', img: 'img/dripbag.webp', price: 75000, pop: 6,
      notes: ['Praktis', 'Tanpa alat'], specs: { Isi: '10 sachet × 12 g', Varian: 'Gayo, Kintamani, Toraja, Pagi', Tahan: '3 bulan' },
      desc: 'Cukup sobek, gantung di cangkir, tuang air panas. Cocok untuk kantor, perjalanan, atau hadiah.' },
    { id: 'greenbean', cat: 'arabika', name: 'Green Bean Gayo', origin: 'Biji mentah · 1 kg', img: 'img/greenbean.webp', price: 145000, pop: 9, soldout: true,
      notes: ['Untuk home roaster'], specs: { Proses: 'Semi wash', Kadar_air: '11–12%', Grade: 'Grade 1' },
      desc: 'Biji kopi mentah untuk yang ingin menyangrai sendiri. Stok berikutnya datang setelah panen.' },
    { id: 'dripper', cat: 'alat', name: 'Dripper Kaca + 40 Filter', origin: 'Alat seduh', img: 'img/dripper.webp', price: 135000, pop: 7,
      notes: ['Kaca borosilikat', 'Ukuran 02'], specs: { Bahan: 'Kaca borosilikat', Kapasitas: '1–4 cangkir', Bonus: '40 kertas filter' },
      desc: 'Dripper kerucut gaya V60 yang saya pakai sehari-hari. Bonus kertas filter dan kartu resep.' },
    { id: 'grinder', cat: 'alat', name: 'Hand Grinder Stainless', origin: 'Alat seduh', img: 'img/grinder.webp', price: 385000, pop: 8,
      notes: ['Burr stainless', '24 klik'], specs: { Burr: 'Stainless 38 mm', Kapasitas: '25 g', Garansi: '6 bulan' },
      desc: 'Gilingan konsisten dari tubruk sampai espresso. Ringan, mudah dibongkar untuk dibersihkan.' },
  ];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const hasVariants = (p) => GRIND_TYPES.has(p.cat) && !p.soldout && p.id !== 'greenbean';
  const priceFor = (p, sizeId) => {
    if (!hasVariants(p)) return p.price;
    const s = SIZES.find((x) => x.id === sizeId) || SIZES[0];
    return Math.round((p.price * s.mult) / 1000) * 1000;
  };

  /* ---------- Next roast date (WIB) ---------- */
  // Roast days: Monday & Thursday. Orders paid before 20.00 WIB the day before make that batch.
  (function nextRoast() {
    const wib = new Date(Date.now() + 7 * 3600e3); // read with UTC getters = WIB wall clock
    const fmt = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
    for (let i = 1; i <= 8; i++) {
      const d = new Date(wib.getTime() + i * 864e5);
      const dow = d.getUTCDay();
      if (dow !== 1 && dow !== 4) continue;
      if (i === 1 && wib.getUTCHours() >= 20) continue;
      $('#next-roast').textContent = `Sangrai berikutnya: ${fmt.format(d)}`;
      return;
    }
  })();

  /* ---------- Catalog ---------- */
  const grid = $('#product-grid');
  const state = { cat: 'semua', q: '', sort: 'pop' };
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function renderCatalog() {
    const q = norm(state.q.trim());
    let items = PRODUCTS.filter((p) => state.cat === 'semua' || p.cat === state.cat);
    if (q) items = items.filter((p) => norm([p.name, p.origin, p.notes.join(' '), p.desc, p.cat].join(' ')).includes(q));
    const sorters = { pop: (a, b) => a.pop - b.pop, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name, 'id') };
    items.sort(sorters[state.sort]);
    grid.innerHTML = items.map((p, i) => `
      <li style="--i:${i}">
        <article class="product">
          <button class="p-open" type="button" data-open="${p.id}" aria-label="Lihat detail ${p.name}">
            <div class="p-media">
              <img src="${p.img}" alt="" loading="lazy" width="800" height="800">
              ${p.soldout ? '<span class="p-badge soldout">Habis</span>' : p.badge ? `<span class="p-badge">${p.badge}</span>` : ''}
            </div>
            <div class="p-body">
              <span class="p-origin">${p.origin}</span>
              <h3 class="p-name">${p.name}</h3>
              <p class="p-notes">${p.notes.join(' · ')}</p>
            </div>
          </button>
          <div class="p-foot">
            <span class="p-price">${rp(p.price)}${hasVariants(p) ? '<small>/ 200 g</small>' : ''}</span>
            ${p.soldout
              ? '<button class="icon-btn outlined" type="button" disabled aria-label="Stok habis"><span class="ms">block</span></button>'
              : `<button class="icon-btn tonal" type="button" data-quick-add="${p.id}" aria-label="Tambah ${p.name}${hasVariants(p) ? ' 200 g' : ''} ke keranjang"><span class="ms">add_shopping_cart</span></button>`}
          </div>
        </article>
      </li>`).join('');
    $('#empty').hidden = items.length > 0;
    $('#result-count').textContent = items.length ? `${items.length} produk` : '';
  }
  $('#cat-chips').addEventListener('m3:select', (e) => { state.cat = e.detail.value; renderCatalog(); });
  const search = $('#search');
  const clearBtn = $('#search-clear');
  search.addEventListener('input', () => { state.q = search.value; clearBtn.hidden = !search.value; renderCatalog(); });
  clearBtn.addEventListener('click', () => { search.value = ''; state.q = ''; clearBtn.hidden = true; renderCatalog(); search.focus(); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderCatalog(); });
  $('#reset-filter').addEventListener('click', () => {
    search.value = ''; state.q = ''; clearBtn.hidden = true; state.cat = 'semua';
    $$('#cat-chips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === 'semua')));
    renderCatalog();
  });
  renderCatalog();

  /* ---------- Cart state ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]').filter((l) => byId[l.id]); } catch (_) { cart = []; }
  let voucher = null;
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) { /* ignore */ } };
  const lineKey = (l) => `${l.id}|${l.size || ''}|${l.grind || ''}`;
  const count = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => cart.reduce((s, l) => s + priceFor(byId[l.id], l.size) * l.qty, 0);

  function addToCart(line, sourceEl) {
    const existing = cart.find((l) => lineKey(l) === lineKey(line));
    if (existing) existing.qty = Math.min(20, existing.qty + line.qty);
    else cart.push(line);
    save(); renderCart();
    flyToCart(sourceEl);
    const p = byId[line.id];
    M3.snackbar(`${p.name}${line.size ? ' ' + SIZES.find((s) => s.id === line.size).label : ''} masuk keranjang`, {
      action: 'Lihat', onAction: () => M3.openDialog($('#cart-sheet')),
    });
  }

  function flyToCart(from) {
    const target = $('#cart-btn');
    if (!from || M3.reduceMotion.matches) { target.classList.add('bump'); setTimeout(() => target.classList.remove('bump'), 500); return; }
    const a = from.getBoundingClientRect(); const b = target.getBoundingClientRect();
    const dot = document.createElement('span'); dot.className = 'fly-dot'; document.body.appendChild(dot);
    const x0 = a.left + a.width / 2 - 10, y0 = a.top + a.height / 2 - 10, x1 = b.left + b.width / 2 - 10, y1 = b.top + b.height / 2 - 10;
    dot.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(1)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 80}px) scale(1.2)`, offset: .5 },
      { transform: `translate(${x1}px, ${y1}px) scale(.4)`, opacity: .6 },
    ], { duration: 650, easing: 'cubic-bezier(.3,0,.2,1)' }).onfinish = () => {
      dot.remove(); target.classList.add('bump'); setTimeout(() => target.classList.remove('bump'), 500);
    };
  }

  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-quick-add]');
    if (q) {
      const p = byId[q.dataset.quickAdd];
      addToCart({ id: p.id, size: hasVariants(p) ? '200' : null, grind: hasVariants(p) ? 'Biji utuh' : null, qty: 1 }, q);
      return;
    }
    const o = e.target.closest('[data-open]');
    if (o) openProduct(o.dataset.open, o);
    const g = e.target.closest('[data-goto]');
    if (g) setTimeout(() => document.querySelector(g.dataset.goto)?.scrollIntoView({ behavior: M3.reduceMotion.matches ? 'auto' : 'smooth' }), 50);
  });

  /* ---------- Product dialog ---------- */
  const pd = { id: null, size: '200', qty: 1 };
  const dlg = $('#product-dialog');
  function openProduct(id, opener) {
    const p = byId[id];
    pd.id = id; pd.size = '200'; pd.qty = 1;
    $('#pd-img').src = p.img; $('#pd-img').alt = p.name;
    $('#pd-origin').textContent = p.origin;
    $('#pd-title').textContent = p.name;
    $('#pd-desc').textContent = p.desc;
    $('#pd-notes').innerHTML = p.notes.map((n) => `<span class="chip static filled">${n}</span>`).join('');
    $('#pd-specs').innerHTML = Object.entries(p.specs).map(([k, v]) => `<div><dt>${k.replace('_', ' ')}</dt><dd>${v}</dd></div>`).join('');
    const variants = hasVariants(p);
    $('#pd-roast-wrap').hidden = p.roast == null;
    if (p.roast != null) {
      $('#pd-roast-bar').style.left = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => { $('#pd-roast-bar').style.left = `${p.roast * 100}%`; }));
      $('#pd-roast-text').textContent = `Tingkat sangrai: ${p.roast < .4 ? 'light' : p.roast < .62 ? 'medium' : 'medium-dark'}`;
    }
    $('#pd-size-wrap').hidden = !variants;
    $('#pd-grind-wrap').hidden = !variants;
    $('#pd-grind').selectedIndex = 0;
    if (variants) {
      $('#pd-size').innerHTML = SIZES.map((s) => `<button class="btn" type="button" aria-pressed="${s.id === '200'}" data-value="${s.id}"><span class="ms sel-icon">check</span>${s.label}<small>${rp(priceFor(p, s.id))}</small></button>`).join('');
    }
    $('#pd-add').disabled = !!p.soldout;
    $('#pd-minus').disabled = !!p.soldout; $('#pd-plus').disabled = !!p.soldout;
    syncPd();
    M3.openDialog(dlg, opener);
  }
  function syncPd() {
    const p = byId[pd.id];
    $('#pd-qty').textContent = pd.qty;
    $('#pd-minus').disabled = pd.qty <= 1 || !!p.soldout;
    $('#pd-add-label').textContent = p.soldout ? 'Stok habis' : `Tambah · ${rp(priceFor(p, pd.size) * pd.qty)}`;
  }
  $('#pd-size').addEventListener('m3:select', (e) => { pd.size = e.detail.value; syncPd(); });
  $('#pd-minus').addEventListener('click', () => { pd.qty = Math.max(1, pd.qty - 1); syncPd(); });
  $('#pd-plus').addEventListener('click', () => { pd.qty = Math.min(20, pd.qty + 1); syncPd(); });
  $('#pd-add').addEventListener('click', (e) => {
    const p = byId[pd.id];
    const variants = hasVariants(p);
    addToCart({ id: p.id, size: variants ? pd.size : null, grind: variants ? $('#pd-grind').value : null, qty: pd.qty }, e.currentTarget);
    M3.closeDialog(dlg);
  });

  /* ---------- Cart sheet ---------- */
  const SHIP = { bandung: 10000, jawa: 18000, luar: 35000, ambil: 0 };
  const FREE_SHIP = 250000;
  const zoneSel = $('#c-zone');

  function discount() {
    if (!voucher) return 0;
    return Math.min(25000, Math.round(subtotal() * 0.1));
  }
  function shipping() {
    const z = zoneSel.value;
    if (!z) return null;
    if (z === 'ambil') return 0;
    return subtotal() - discount() >= FREE_SHIP ? 0 : SHIP[z];
  }

  function renderCart() {
    const n = count();
    const badge = $('#cart-badge');
    badge.textContent = n > 99 ? '99+' : n; badge.dataset.count = n;
    $('#cart-btn').setAttribute('aria-label', `Keranjang belanja (${n} barang)`);
    $('#fab-cart-label').textContent = n ? `Keranjang · ${rp(subtotal() - discount())}` : 'Keranjang';
    syncFab();

    $('#cart-empty').hidden = n > 0;
    $('#checkout').hidden = n === 0;
    $('#cart-foot').hidden = n === 0;
    $('#cart-title').textContent = n ? `Keranjang (${n})` : 'Keranjang';
    $('#cart-list').innerHTML = cart.map((l, i) => {
      const p = byId[l.id];
      const variant = [l.size && SIZES.find((s) => s.id === l.size).label, l.grind].filter(Boolean).join(' · ');
      return `<li class="cart-item">
        <img src="${p.img}" alt="" width="64" height="64">
        <div class="ci-text">
          <span class="ci-name">${p.name}</span>
          ${variant ? `<span class="ci-variant">${variant}</span>` : ''}
          <span class="ci-price">${rp(priceFor(p, l.size) * l.qty)}</span>
        </div>
        <div class="ci-side">
          <button class="icon-btn ci-remove" type="button" data-remove="${i}" aria-label="Hapus ${p.name}"><span class="ms">delete</span></button>
          <div class="stepper sm">
            <button class="icon-btn" type="button" data-dec="${i}" aria-label="Kurangi ${p.name}" ${l.qty <= 1 ? 'disabled' : ''}><span class="ms">remove</span></button>
            <output aria-live="polite">${l.qty}</output>
            <button class="icon-btn" type="button" data-inc="${i}" aria-label="Tambah ${p.name}"><span class="ms">add</span></button>
          </div>
        </div>
      </li>`;
    }).join('');

    const sub = subtotal(); const disc = discount(); const ship = shipping();
    $('#t-sub').textContent = rp(sub);
    $('#t-disc-row').hidden = !disc;
    $('#t-disc').textContent = '−' + rp(disc);
    $('#t-ship').textContent = ship === null ? 'Pilih wilayah' : ship === 0 ? 'Gratis' : rp(ship);
    $('#t-total').textContent = rp(sub - disc + (ship || 0));
    const remain = FREE_SHIP - (sub - disc);
    $('#ship-text').innerHTML = remain > 0 ? `Tambah <b>${rp(remain)}</b> lagi untuk gratis ongkir` : '<b>Yeay, gratis ongkir!</b> (kecuali ambil sendiri)';
    $('#ship-bar').style.width = Math.min(100, ((sub - disc) / FREE_SHIP) * 100) + '%';
  }

  $('#cart-list').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.remove) {
      const i = +b.dataset.remove; const removed = cart.splice(i, 1)[0]; save(); renderCart();
      M3.snackbar(`${byId[removed.id].name} dihapus`, { action: 'Urungkan', onAction: () => { cart.splice(i, 0, removed); save(); renderCart(); } });
    } else if (b.dataset.inc) { cart[+b.dataset.inc].qty = Math.min(20, cart[+b.dataset.inc].qty + 1); save(); renderCart(); }
    else if (b.dataset.dec) { cart[+b.dataset.dec].qty = Math.max(1, cart[+b.dataset.dec].qty - 1); save(); renderCart(); }
  });
  zoneSel.addEventListener('change', () => {
    const pickup = zoneSel.value === 'ambil';
    $('#addr-field').hidden = pickup;
    $('#c-addr').required = !pickup;
    renderCart();
  });

  $('#apply-voucher').addEventListener('click', () => {
    const input = $('#c-voucher'); const field = input.closest('.field'); const msg = $('#voucher-msg');
    const code = input.value.trim().toUpperCase();
    if (code === 'KOPIPERTAMA') {
      voucher = code; field.classList.remove('error'); field.classList.add('ok');
      msg.textContent = 'Voucher aktif: diskon 10% (maks. Rp25.000)';
    } else {
      voucher = null; field.classList.remove('ok'); field.classList.add('error');
      msg.textContent = code ? 'Kode tidak ditemukan' : 'Masukkan kode voucher';
    }
    renderCart();
  });

  $('#checkout').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const vField = $('#c-voucher').closest('.field');
    const vWasError = vField.classList.contains('error');
    if (!M3.validate(form)) { M3.snackbar('Lengkapi data pengiriman dulu ya.'); return; }
    if (vWasError) vField.classList.add('error');
    const zoneText = zoneSel.options[zoneSel.selectedIndex].text.split(' — ')[0];
    const lines = cart.map((l, i) => {
      const p = byId[l.id];
      const v = [l.size && SIZES.find((s) => s.id === l.size).label, l.grind].filter(Boolean).join(', ');
      return `${i + 1}. ${p.name}${v ? ` (${v})` : ''} ×${l.qty} = ${rp(priceFor(p, l.size) * l.qty)}`;
    });
    const sub = subtotal(); const disc = discount(); const ship = shipping() || 0;
    const msg = [
      'Halo Rara, saya mau pesan:',
      '',
      ...lines,
      '',
      `Subtotal: ${rp(sub)}`,
      disc ? `Voucher ${voucher}: −${rp(disc)}` : null,
      `Ongkir (${zoneText}): ${ship ? rp(ship) : 'Gratis'}`,
      `*Total: ${rp(sub - disc + ship)}*`,
      '',
      `Nama: ${$('#c-name').value.trim()}`,
      `WA: ${$('#c-wa').value.trim()}`,
      zoneSel.value === 'ambil' ? 'Diambil sendiri di Dago' : `Alamat: ${$('#c-addr').value.trim()}`,
    ].filter((x) => x !== null).join('\n');
    $('#order-preview').textContent = msg;
    $('#wa-link').href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    M3.hideSnackbar();
    M3.closeDialog($('#cart-sheet'));
    M3.openDialog($('#order-dialog'));
  });
  $('#copy-order').addEventListener('click', async () => {
    const text = $('#order-preview').textContent;
    try { await navigator.clipboard.writeText(text); M3.snackbar('Ringkasan pesanan disalin'); }
    catch (_) {
      const r = document.createRange(); r.selectNodeContents($('#order-preview'));
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      M3.snackbar('Teks sudah diblok — tekan Ctrl/⌘+C untuk menyalin');
    }
  });

  /* ---------- FAB ---------- */
  const fab = $('#fab-cart');
  let heroVisible = true;
  function syncFab() { fab.classList.toggle('hidden', heroVisible || count() === 0); }
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; syncFab(); }).observe($('.hero'));

  renderCart();
})();
