/* Kirana Ubud — rooms, availability & booking flow */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const rp = M3.rupiah;
  const TAX = 0.21;          // PB1 10% + service 11%
  const BREAKFAST = 180000;  // per room per night (2 persons)
  const PICKUP = 450000;

  const ROOMS = [
    { id: 'deluxe', name: 'Deluxe Sawah', img: 'img/room-deluxe.webp', alt: 'Kamar dengan ranjang besar dan jendela ke taman', price: 1650000, size: 32, guests: 2, bed: 'King / twin', view: 'Teras ke sawah', total: 12,
      desc: 'Kamar paling populer: teras pribadi menghadap terasering, kamar mandi semi terbuka.' },
    { id: 'jungle', name: 'Jungle Suite', img: 'img/room-jungle.webp', alt: 'Suite dengan ranjang besar dan balkon menghadap pepohonan', price: 2450000, size: 48, guests: 3, bed: 'King + sofa bed', view: 'Balkon ke hutan', total: 6, tag: 'Untuk keluarga kecil',
      desc: 'Ruang duduk terpisah dan balkon di antara pucuk pohon. Muat 3 orang dengan sofa bed.' },
    { id: 'pool', name: 'Pool Villa', img: 'img/room-villa.webp', alt: 'Villa dengan ranjang berkelambu', price: 4200000, size: 95, guests: 2, bed: 'King berkelambu', view: 'Kolam pribadi', total: 4, tag: 'Bulan madu',
      desc: 'Villa satu kamar dengan kolam pribadi 8 m, bale bengong, dan sarapan apung.' },
    { id: 'family', name: 'Family Villa', img: 'img/room-suite.webp', alt: 'Kamar tidur luas dengan pintu kaca geser', price: 5900000, size: 140, guests: 5, bed: '2 kamar tidur', view: 'Kolam & taman', total: 2,
      desc: 'Dua kamar tidur, dapur kecil, dan kolam pribadi. Pas untuk 4–5 orang.' },
  ];
  const byId = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

  /* ---------- Dates ---------- */
  const DAY = 864e5;
  const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtDate = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtLong = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const inEl = $('#b-in'); const outEl = $('#b-out');
  inEl.min = toISO(today);
  inEl.value = toISO(new Date(today.getTime() + 7 * DAY));
  outEl.value = toISO(new Date(today.getTime() + 9 * DAY));
  outEl.min = toISO(new Date(fromISO(inEl.value).getTime() + DAY));
  const nights = () => Math.round((fromISO(outEl.value) - fromISO(inEl.value)) / DAY);

  inEl.addEventListener('change', () => {
    if (!inEl.value) return;
    const minOut = new Date(fromISO(inEl.value).getTime() + DAY);
    outEl.min = toISO(minOut);
    if (!outEl.value || fromISO(outEl.value) <= fromISO(inEl.value)) outEl.value = toISO(new Date(minOut.getTime() + DAY));
    updateHint();
  });
  outEl.addEventListener('change', updateHint);

  /* ---------- Guests ---------- */
  let guests = 2;
  const gOut = $('#g-count');
  const syncGuests = () => { gOut.textContent = guests; $('#g-minus').disabled = guests <= 1; $('#g-plus').disabled = guests >= 8; };
  $('#g-minus').addEventListener('click', () => { guests = Math.max(1, guests - 1); syncGuests(); });
  $('#g-plus').addEventListener('click', () => { guests = Math.min(8, guests + 1); syncGuests(); });
  syncGuests();

  function updateHint() {
    const hint = $('#b-hint');
    if (inEl.value && outEl.value && nights() > 0) {
      hint.innerHTML = `<span class="ms">nights_stay</span>${nights()} malam · ${fmtDate.format(fromISO(inEl.value))} – ${fmtDate.format(fromISO(outEl.value))} · Gratis pembatalan H-3`;
    }
  }
  updateHint();

  /* ---------- Availability (deterministic demo data) ---------- */
  function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function roomsLeft(room) {
    // Minimum free units across the stay, derived from a hash of date + room.
    let left = room.total;
    for (let t = fromISO(inEl.value).getTime(); t < fromISO(outEl.value).getTime(); t += DAY) {
      const h = hash(room.id + toISO(new Date(t)));
      const booked = Math.min(room.total, Math.floor((h % 100) / 100 * (room.total + 1.4)));
      left = Math.min(left, room.total - booked);
    }
    return left;
  }

  /* ---------- Room list ---------- */
  let priceMode = 'room';
  const nightly = (r) => r.price + (priceMode === 'breakfast' ? BREAKFAST : 0);
  function renderRooms() {
    $('#room-list').innerHTML = ROOMS.map((r) => `
      <li class="room reveal">
        <div class="room-media">
          <img src="${r.img}" alt="${r.alt}" loading="lazy" width="1000" height="667">
          ${r.tag ? `<span class="chip elevated static">${r.tag}</span>` : ''}
        </div>
        <div class="room-body">
          <h3 class="room-name">${r.name}</h3>
          <p class="body-l on-surface-variant">${r.desc}</p>
          <div class="room-specs">
            <span><span class="ms">square_foot</span>${r.size} m²</span>
            <span><span class="ms">group</span>Maks. ${r.guests} tamu</span>
            <span><span class="ms">bed</span>${r.bed}</span>
            <span><span class="ms">landscape</span>${r.view}</span>
          </div>
          <div class="room-foot">
            <div class="room-price">
              <span class="from">Mulai</span>
              <span class="amt" data-room="${r.id}">${rp(nightly(r))}</span>
              <span class="per">per malam${priceMode === 'breakfast' ? ', termasuk sarapan' : ''} · belum termasuk pajak 21%</span>
            </div>
            <button class="btn btn-filled" type="button" data-book="${r.id}">Pilih kamar<span class="ms">arrow_forward</span></button>
          </div>
        </div>
      </li>`).join('');
    document.querySelectorAll('#room-list .reveal').forEach((el) => el.classList.add('in'));
  }
  renderRooms();
  $('#price-mode').addEventListener('m3:select', (e) => {
    priceMode = e.detail.value;
    document.querySelectorAll('.room-price').forEach((p) => {
      const amt = p.querySelector('.amt');
      amt.classList.add('swap');
      setTimeout(() => {
        amt.textContent = rp(nightly(byId[amt.dataset.room]));
        p.querySelector('.per').textContent = `per malam${priceMode === 'breakfast' ? ', termasuk sarapan' : ''} · belum termasuk pajak 21%`;
        amt.classList.remove('swap');
      }, 160);
    });
  });

  /* ---------- Booking dialog ---------- */
  const dlg = $('#book-dialog');
  const nextBtn = $('#bd-next');
  const backBtn = $('#bd-back');
  let step = 1;
  let selected = null;

  function setStep(n) {
    step = n;
    [1, 2, 3].forEach((i) => {
      $('#bd-pane-' + i).hidden = i !== n;
      $('#bd-step-' + i).classList.toggle('on', i <= n);
    });
    backBtn.hidden = n !== 2;
    nextBtn.textContent = n === 1 ? 'Lanjut' : n === 2 ? 'Konfirmasi pemesanan' : 'Selesai';
    nextBtn.disabled = n === 1 && !selected;
    $('#bd-title').textContent = n === 3 ? 'Terima kasih!' : 'Lengkapi pemesanan';
  }

  function renderDialogRooms() {
    const n = nights();
    $('#bd-summary').textContent = `${fmtLong.format(fromISO(inEl.value))} – ${fmtLong.format(fromISO(outEl.value))} · ${n} malam · ${guests} tamu`;
    $('#bd-rooms').innerHTML = ROOMS.map((r) => {
      const left = roomsLeft(r);
      const fits = guests <= r.guests;
      const disabled = left === 0 || !fits;
      const note = !fits ? `Maks. ${r.guests} tamu` : left === 0 ? 'Penuh di tanggal ini' : left <= 2 ? `<span class="r-left">Sisa ${left} unit</span>` : `${left} unit tersedia`;
      return `<button class="bd-room" type="button" role="radio" aria-checked="${selected === r.id && !disabled}" data-room="${r.id}" ${disabled ? 'disabled' : ''}>
        <img src="${r.img}" alt="" width="72" height="72">
        <span><span class="r-name">${r.name}</span><br><span class="r-meta">${r.size} m² · ${note}</span></span>
        <span class="r-price">${rp(nightly(r) * n)}<small>${n} malam</small></span>
      </button>`;
    }).join('');
    if (selected && document.querySelector(`.bd-room[data-room="${selected}"][disabled]`)) selected = null;
  }
  $('#bd-rooms').addEventListener('click', (e) => {
    const b = e.target.closest('.bd-room'); if (!b || b.disabled) return;
    selected = b.dataset.room;
    document.querySelectorAll('.bd-room').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    nextBtn.disabled = false;
  });
  $('#bd-rooms').addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const items = [...document.querySelectorAll('.bd-room:not([disabled])')];
    const i = items.indexOf(document.activeElement);
    const next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    if (next) { e.preventDefault(); next.focus(); next.click(); }
  });

  function totals() {
    const r = byId[selected]; const n = nights();
    const room = nightly(r) * n;
    const pickup = $('#g-pickup').checked ? (n >= 3 ? 0 : PICKUP) : 0;
    const tax = Math.round(room * TAX);
    return { room, pickup, tax, total: room + tax + pickup, n };
  }
  function renderTotals() {
    const r = byId[selected]; const t = totals();
    $('#pickup-note').textContent = t.n >= 3 ? 'Gratis untuk menginap 3 malam atau lebih' : `${rp(PICKUP)} sekali jalan`;
    $('#bd-picked').innerHTML = `<img src="${r.img}" alt=""><div><p class="title-s">${r.name}${priceMode === 'breakfast' ? ' · dengan sarapan' : ''}</p><p class="body-s on-surface-variant">${$('#bd-summary').textContent}</p></div>`;
    $('#bd-total').innerHTML = `
      <div><dt>${rp(nightly(r))} × ${t.n} malam</dt><dd>${rp(t.room)}</dd></div>
      <div><dt>Pajak &amp; layanan 21%</dt><dd>${rp(t.tax)}</dd></div>
      ${$('#g-pickup').checked ? `<div><dt>Jemput bandara</dt><dd>${t.pickup ? rp(t.pickup) : 'Gratis'}</dd></div>` : ''}
      <div class="grand"><dt>Total dibayar di hotel</dt><dd>${rp(t.total)}</dd></div>`;
  }
  $('#g-pickup').addEventListener('change', renderTotals);

  function openBooking(roomId, opener) {
    selected = roomId || null;
    renderDialogRooms();
    setStep(1);
    if (selected) nextBtn.disabled = !document.querySelector(`.bd-room[data-room="${selected}"][aria-checked="true"]`);
    M3.openDialog(dlg, opener);
  }

  nextBtn.addEventListener('click', () => {
    if (step === 1) { if (!selected) return; renderTotals(); setStep(2); $('#g-name').focus(); return; }
    if (step === 2) {
      if (!M3.validate($('#bd-pane-2'))) return;
      const original = nextBtn.textContent;
      nextBtn.disabled = true; nextBtn.innerHTML = '<span class="m3-loader" aria-hidden="true" style="width:24px;height:24px"></span>Memproses…';
      setTimeout(() => {
        nextBtn.disabled = false; nextBtn.textContent = original;
        const code = 'KRN-' + Math.random().toString(36).slice(2, 7).toUpperCase();
        const r = byId[selected]; const t = totals();
        $('#bd-code').textContent = code;
        $('#bd-done-text').textContent = `${r.name}, ${t.n} malam untuk ${$('#g-name').value.trim()}. Total ${rp(t.total)} dibayar saat check-in. Konfirmasi dikirim ke ${$('#g-email').value.trim()}.`;
        setStep(3);
      }, 1200);
      return;
    }
    M3.closeDialog(dlg);
  });
  backBtn.addEventListener('click', () => setStep(1));
  $('#bd-pane-2').addEventListener('submit', (e) => { e.preventDefault(); if (!nextBtn.disabled) nextBtn.click(); });
  dlg.addEventListener('close', () => {
    if (step === 3) { $('#bd-pane-2').reset(); selected = null; }
  });

  $('#booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!inEl.value || !outEl.value || nights() < 1) {
      outEl.closest('.field').classList.add('error');
      M3.snackbar('Tanggal check-out harus setelah check-in.');
      return;
    }
    outEl.closest('.field').classList.remove('error');
    openBooking(null, e.submitter);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (b) openBooking(b.dataset.book, b);
  });

  /* ---------- Carousel buttons ---------- */
  const car = $('#carousel');
  const step2 = () => (car.querySelector('.c-item')?.getBoundingClientRect().width || 400) + 8;
  $('#car-prev').addEventListener('click', () => car.scrollBy({ left: -step2(), behavior: M3.reduceMotion.matches ? 'auto' : 'smooth' }));
  $('#car-next').addEventListener('click', () => car.scrollBy({ left: step2(), behavior: M3.reduceMotion.matches ? 'auto' : 'smooth' }));
  const syncCar = () => {
    $('#car-prev').disabled = car.scrollLeft < 4;
    $('#car-next').disabled = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4;
  };
  car.addEventListener('scroll', syncCar, { passive: true });
  syncCar();

  /* ---------- FAB ---------- */
  const fab = $('#fab-book');
  let bookingVisible = true, ctaVisible = false;
  const syncFab = () => fab.classList.toggle('hidden', bookingVisible || ctaVisible);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { bookingVisible = en.isIntersecting; syncFab(); }).observe($('.hero'));
    new IntersectionObserver(([en]) => { ctaVisible = en.isIntersecting; syncFab(); }).observe($('.cta-section'));
  }
  fab.addEventListener('click', (e) => { e.preventDefault(); openBooking(null, fab); });
})();
