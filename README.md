# ingatin — landing page + portofolio demo

Website statis (HTML/CSS/JS murni, tanpa build step) untuk studio website **ingatin**, berisi tiga portofolio demo yang bisa dicoba langsung.

| Halaman | Jenis | Acuan desain | Fitur yang berjalan |
|---|---|---|---|
| `index.html` | Landing page ingatin | Agensi digital korporat (Hallmark redesign): navbar dengan dropdown, hero navy dengan tumpukan screenshot karya, Plus Jakarta Sans, biru ingatin `#0073E6` untuk CTA | Mode gelap/terang (tersimpan), dropdown Layanan/Portofolio, bento layanan + demo warna M3, tab studi kasus, proses 4 langkah, paket harga, FAQ, formulir → WhatsApp. **Placeholder bertanda** (logo klien, testimoni, harga, termin pembayaran) — cari `data-placeholder` di `index.html` |
| `portfolio/lumbung-niaga/` | Company profile distributor FMCG | [Material 3](https://m3.material.io) | Tab visi/misi/nilai, filter lini produk, pemilih depo (connected button group), formulir kemitraan dengan validasi + loading indicator M3 Expressive + dialog sukses |
| `portfolio/rara-roastery/` | Website jualan pribadi (kopi) | Material 3 Expressive (ROND 100, shape morph) | Pencarian, filter, urutkan, dialog produk (ukuran, gilingan, jumlah), keranjang tersimpan di localStorage, voucher `KOPIPERTAMA`, ongkir per wilayah + gratis ongkir, checkout ke WhatsApp |
| `portfolio/kirana-ubud/` | Company profile hotel / resort | Material 3 | Widget cek ketersediaan (tanggal + tamu), harga kamar/+sarapan, pemesanan 3 langkah (kamar → data tamu → kode booking), carousel galeri, peta Google Maps |

Semua merek, alamat, nomor telepon, dan ulasan di portofolio adalah **fiktif** untuk demo. Formulir tidak mengirim data ke server mana pun.

## Menjalankan

```bash
npm run serve          # http://localhost:4173  (python3 -m http.server)
```

Atau buka `index.html` langsung di browser (file://) — semua tautan memakai path relatif.

## Struktur

```
index.html                    landing page ingatin
tokens.css                    token desain landing (warna OKLCH, font, spasi, motion) terang + gelap
assets/css/landing.css        gaya landing (korporat), hanya memakai token dari tokens.css
assets/js/landing.js          interaksi landing
assets/js/schemes.js          (generated) skema warna M3 untuk demo warna
assets/img/shots/             screenshot asli tiap portofolio (desktop/ponsel × terang/gelap)
portfolio/m3/m3.css           mini design system Material 3: token, tipografi, tombol, chip,
                              kartu, text field, dialog, sheet, drawer, tab, switch, snackbar
portfolio/m3/m3.js            perilaku bersama: tema, ripple, dialog, tab, snackbar, validasi
portfolio/m3/shapes.css       (generated) bentuk M3 Expressive (cookie, clover, burst, …) sebagai clip-path yang bisa di-morph
portfolio/themes/<site>.css   (generated) 49 color role M3 (terang + gelap) dari satu warna dasar
portfolio/<site>/             index.html + site.css + site.js + img/
scripts/                      generator tema, bentuk, dan subset ikon
CREDITS.md                    sumber foto (Unsplash License)
```

## Mengubah warna sebuah portofolio

Warna setiap situs dihitung dari **satu warna dasar** dengan `@material/material-color-utilities` (algoritma resmi Material You, spesifikasi 2025):

1. Ubah `seed` di `scripts/gen-themes.mjs`.
2. `npm install && npm run themes`
3. Semua tombol, permukaan, kontras teks, dan mode gelap ikut menyesuaikan.

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run themes` | Generate `portfolio/themes/*.css` + `assets/js/schemes.js` |
| `npm run shapes` | Generate `portfolio/m3/shapes.css` (96 titik per bentuk, bisa di-morph) |
| `npm run icons` | Scan ikon yang dipakai tiap halaman → tulis ulang `icon_names=` di link Material Symbols (subset font, ±20 KB per halaman) |
| `npm run build` | Ketiganya sekaligus |

Setelah menambah ikon baru di HTML/JS, jalankan `npm run icons`. Ikon yang hanya muncul di data JS bisa ditandai dengan komentar `/* icons: nama_ikon, … */`.

## Deploy

Tidak ada build step: unggah seluruh folder (kecuali `node_modules/`, `scripts/`, `_scratch/`) ke hosting statis apa pun — Apache/Nginx, Netlify, Cloudflare Pages, GitHub Pages.

## Dependensi eksternal (CDN)

- Google Fonts: Plus Jakarta Sans (landing), Google Sans Flex (portofolio), Material Symbols Rounded (portofolio)
- Google Maps embed (Kirana Ubud, bagian Lokasi)
