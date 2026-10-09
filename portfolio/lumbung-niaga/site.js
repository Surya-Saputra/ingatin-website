/* Lumbung Niaga — page logic */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);

  /* ---------- Product lines ---------- */
  const LINES = [
    { cat: 'makanan', icon: 'ramen_dining', shape: 'cookie-9', tone: 'a', title: 'Mi & makanan instan', desc: 'Mi goreng dan kuah, bihun, bubur instan, makanan kaleng.', sku: 260, brands: ['Mie Sedap Rasa', 'Bihun Nusa', 'Kaleng Kita'] },
    { cat: 'makanan', icon: 'cookie', shape: 'clover-8', tone: 'b', title: 'Biskuit & makanan ringan', desc: 'Biskuit, wafer, keripik, kacang, dan cokelat batang.', sku: 410, brands: ['Renyah', 'Wafero', 'Kacang Pak Dul'] },
    { cat: 'minuman', icon: 'local_drink', shape: 'sunny', tone: 'c', title: 'Minuman siap saji', desc: 'Air mineral, teh kemasan, minuman isotonik, dan jus.', sku: 180, brands: ['Tirta Jernih', 'Teh Sejuk', 'Isotona'] },
    { cat: 'minuman', icon: 'coffee', shape: 'cookie-6', tone: 'a', title: 'Kopi, teh & susu bubuk', desc: 'Kopi sachet, teh celup, susu bubuk dan kental manis.', sku: 230, brands: ['Kopi Pagi', 'Teh Tubruk', 'Susu Sapi Mas'] },
    { cat: 'perawatan', icon: 'soap', shape: 'pentagon', tone: 'b', title: 'Sabun & sampo', desc: 'Sabun mandi, sampo, pasta gigi, deodoran.', sku: 290, brands: ['Wangi Segar', 'Gigi Kuat', 'Rambut Indah'] },
    { cat: 'perawatan', icon: 'child_care', shape: 'flower', tone: 'c', title: 'Perawatan bayi', desc: 'Popok, minyak telon, bedak, dan tisu basah bayi.', sku: 120, brands: ['Si Kecil', 'Telon Bunda'] },
    { cat: 'rumah', icon: 'local_laundry_service', shape: 'gem', tone: 'a', title: 'Deterjen & pembersih', desc: 'Deterjen bubuk dan cair, pewangi, sabun cuci piring.', sku: 210, brands: ['Bersih Kilat', 'Harum Sari', 'Kinclong'] },
    { cat: 'rumah', icon: 'kitchen', shape: 'clover-4', tone: 'b', title: 'Tisu & kebutuhan dapur', desc: 'Tisu, minyak goreng, gula, kecap, dan bumbu instan.', sku: 140, brands: ['Lembut', 'Minyak Sawit Emas', 'Bumbu Ibu'] },
  ];
  const CAT_LABEL = { makanan: 'Makanan', minuman: 'Minuman', perawatan: 'Perawatan diri', rumah: 'Rumah tangga' };
  const grid = $('#product-grid');

  function renderProducts(cat) {
    const items = LINES.filter((l) => cat === 'semua' || l.cat === cat);
    grid.innerHTML = items.map((l, i) => `
      <li style="--i:${i}">
        <article class="card filled product-card tone-${l.tone}">
          <div class="p-top">
            <span class="p-shape shape-${l.shape}"><span class="ms">${l.icon}</span></span>
            <span class="p-sku">${l.sku} SKU</span>
          </div>
          <span class="label-m on-surface-variant">${CAT_LABEL[l.cat]}</span>
          <h3 class="title-l">${l.title}</h3>
          <p class="body-m on-surface-variant">${l.desc}</p>
          <div class="p-brands" aria-label="Contoh merek">${l.brands.map((b) => `<span>${b}</span>`).join('')}</div>
        </article>
      </li>`).join('');
  }
  renderProducts('semua');
  $('#cat-filter').addEventListener('m3:select', (e) => renderProducts(e.detail.value));

  /* ---------- Depots ---------- */
  const DEPOTS = {
    karawang: { name: 'Depo Karawang', tag: 'Kantor pusat', img: 'img/hero-gudang.webp', alt: 'Gudang utama dengan rak palet tinggi', address: 'Jl. Raya Industri Blok C No. 18, Karawang Barat', area: '6.000 m²', fleet: '18 unit', schedule: 'Senin–Sabtu', cities: ['Karawang', 'Bekasi', 'Purwakarta', 'Subang', 'Cikarang'], phone: '(0267) 812 345' },
    bandung: { name: 'Depo Bandung', tag: 'Sejak 2014', img: 'img/paket.webp', alt: 'Tumpukan kardus barang siap kirim', address: 'Jl. Soekarno-Hatta No. 702, Bandung', area: '2.500 m²', fleet: '12 unit', schedule: 'Senin–Sabtu', cities: ['Bandung', 'Cimahi', 'Sumedang', 'Garut', 'Bandung Barat'], phone: '(022) 7530 112' },
    tangerang: { name: 'Depo Tangerang', tag: 'Baru 2025', img: 'img/ritel.webp', alt: 'Rak minimarket penuh produk', address: 'Kawasan Pergudangan Jatake Blok F-7, Tangerang', area: '2.000 m²', fleet: '9 unit', schedule: 'Senin–Sabtu', cities: ['Tangerang', 'Tangerang Selatan', 'Jakarta Barat', 'Serang', 'Cilegon'], phone: '(021) 5940 2210' },
    semarang: { name: 'Depo Semarang', tag: 'Sejak 2023', img: 'img/pelabuhan.webp', alt: 'Derek peti kemas di pelabuhan', address: 'Jl. Arteri Yos Sudarso No. 41, Semarang Utara', area: '1.500 m²', fleet: '7 unit', schedule: 'Senin–Jumat', cities: ['Semarang', 'Kendal', 'Demak', 'Salatiga', 'Ungaran'], phone: '(024) 3554 087' },
  };
  const depotCard = $('#depot-card');
  function renderDepot(key) {
    const d = DEPOTS[key];
    const maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(d.address);
    depotCard.innerHTML = `
      <div class="depot-media">
        <img src="${d.img}" alt="${d.alt}" loading="lazy">
        <span class="chip elevated static depot-tag"><span class="ms" style="color:var(--md-sys-color-primary)">location_on</span>${d.tag}</span>
      </div>
      <div class="depot-info">
        <div class="stack" style="--gap:6px">
          <h3 class="headline-m">${d.name}</h3>
          <p class="body-l on-surface-variant">${d.address}</p>
        </div>
        <dl class="depot-meta">
          <div><dt>Luas gudang</dt><dd>${d.area}</dd></div>
          <div><dt>Armada</dt><dd>${d.fleet}</dd></div>
          <div><dt>Jadwal kirim</dt><dd>${d.schedule}</dd></div>
          <div><dt>Telepon depo</dt><dd>${d.phone}</dd></div>
        </dl>
        <div class="stack" style="--gap:10px">
          <span class="label-l on-surface-variant">Kota yang dilayani</span>
          <div class="chip-set">${d.cities.map((c) => `<span class="chip static">${c}</span>`).join('')}</div>
        </div>
        <div class="row" style="--gap:8px">
          <a class="btn btn-tonal" href="${maps}" target="_blank" rel="noopener"><span class="ms">directions</span>Petunjuk arah</a>
          <a class="btn btn-text" href="#kemitraan">Daftar mitra di area ini</a>
        </div>
      </div>`;
  }
  renderDepot('karawang');
  $('#depot-switch').addEventListener('m3:select', (e) => renderDepot(e.detail.value));

  /* ---------- Partner form ---------- */
  const form = $('#partner-form');
  const usahaLabel = $('label[for="f-usaha"]');
  let partnerType = 'toko';
  $('#partner-type').addEventListener('m3:select', (e) => {
    partnerType = e.detail.value;
    usahaLabel.textContent = usahaLabel.dataset['label' + (partnerType === 'toko' ? 'Toko' : 'Prinsipal')];
    $('#biz-fieldset').hidden = partnerType !== 'toko';
    $('label[for="f-pesan"]').textContent = partnerType === 'toko' ? 'Produk yang dicari (opsional)' : 'Kategori & wilayah distribusi yang diinginkan (opsional)';
  });
  const pesan = $('#f-pesan');
  const counter = $('#pesan-count');
  pesan.addEventListener('input', () => { counter.textContent = `${pesan.value.length} / 500`; });

  document.querySelectorAll('[data-interest]').forEach((a) => a.addEventListener('click', () => {
    if (!pesan.value) { pesan.value = 'Mohon kirimkan daftar harga dan minimum order untuk toko saya.'; pesan.dispatchEvent(new Event('input')); }
  }));

  const submit = $('#partner-submit');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!M3.validate(form)) { M3.snackbar('Periksa kembali kolom yang ditandai merah.'); return; }
    const original = submit.innerHTML;
    submit.disabled = true;
    submit.innerHTML = '<span class="m3-loader" aria-hidden="true"></span>Mengirim…';
    setTimeout(() => {
      submit.disabled = false;
      submit.innerHTML = original;
      const data = new FormData(form);
      const biz = partnerType === 'toko' ? ($('#biz-type [aria-pressed="true"]')?.dataset.value || '') : 'Prinsipal / brand';
      const ticket = 'LN-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
      $('#success-text').textContent = `Terima kasih, ${data.get('pic')}. Sales area ${data.get('kota')} akan menghubungi ${data.get('usaha')} (${biz}) lewat WhatsApp dalam 1×24 jam kerja.`;
      $('#success-ticket').textContent = ticket;
      M3.openDialog($('#success-dialog'));
      form.reset();
      counter.textContent = '0 / 500';
      form.querySelectorAll('.field.error').forEach((f) => f.classList.remove('error'));
    }, 1400);
  });

  /* ---------- FAB appears after the hero ---------- */
  const fab = $('#fab-wa');
  const hero = $('.hero');
  const formSection = $('#kemitraan');
  if ('IntersectionObserver' in window) {
    let heroVisible = true, formVisible = false;
    const sync = () => fab.classList.toggle('hidden', heroVisible || formVisible);
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(([en]) => { formVisible = en.isIntersecting; sync(); }, { threshold: .25 }).observe(formSection);
  } else fab.classList.remove('hidden');
})();
