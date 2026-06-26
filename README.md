# LarisNusa AI

LarisNusa AI adalah MVP web untuk IDCamp Developer Challenge bertema Generative AI bagi UMKM Indonesia. Aplikasi ini membantu pelaku usaha kecil mengubah catatan transaksi, stok, pertanyaan pelanggan, dan foto produk menjadi kampanye siap unggah, ringkasan omzet, rekomendasi stok, chatbot WhatsApp, catatan CSV, dan deskripsi produk bilingual.

Entry aplikasi ada di `app/index.html`. File `index.html` di root otomatis mengarahkan pengguna ke aplikasi.

## Akses Publik

Demo aplikasi sudah dapat diakses melalui:

```text
https://larisnusa.site.je
```

## Nama Aplikasi

LarisNusa AI - Growth Desk UMKM

## Latar Belakang

Banyak pelaku UMKM Indonesia masih mencatat transaksi secara manual, membuat konten promosi dari intuisi, dan membalas pertanyaan pelanggan satu per satu melalui WhatsApp atau Instagram. Padahal mereka perlu bergerak cepat: tahu produk mana yang paling laku, stok apa yang berisiko habis, bagaimana membuat caption yang menarik, dan bagaimana menjelaskan produk untuk pasar yang lebih luas.

## Solusi

LarisNusa AI adalah MVP berbasis Generative AI yang mengubah catatan harian UMKM menjadi rencana aksi siap pakai. Pengguna cukup memasukkan catatan transaksi, stok, pertanyaan pelanggan, atau foto produk. Aplikasi akan menghasilkan:

- Caption Instagram dan copy marketplace.
- Broadcast WhatsApp.
- Ringkasan omzet dan produk unggulan.
- Rekomendasi stok dan prioritas harian.
- Balasan chatbot pelanggan.
- Deskripsi produk bilingual Indonesia-Inggris.
- Estimasi harga global memakai kurs USD-IDR real-time.

## Nilai AI

MVP ini memakai local copilot berbasis prompt composition agar bisa didemokan tanpa backend, serta menyediakan mode endpoint proxy AI opsional untuk integrasi LLM produksi seperti Gemini, OpenAI, atau model lokal. Desain ini menjaga demo tetap mudah diakses, tetapi tetap punya jalur realistis menuju produk AI sebenarnya.

## Fitur Utama

- Analisis catatan transaksi dari bahasa natural seperti `42 risol mayo harga 5000`.
- Upload foto produk dan analisis warna visual via Canvas API.
- Dashboard omzet, produk unggulan, prioritas stok, dan estimasi nilai USD.
- Generator konten Instagram, WhatsApp Broadcast, dan Marketplace.
- Simulasi chatbot WhatsApp untuk harga, promo, stok, dan pengiriman.
- Export CSV catatan kas.
- Kurs USD-IDR real-time dari API publik dengan fallback offline.
- Input suara via Web Speech API pada browser yang mendukung.

## Target Pengguna

UMKM kuliner, fashion lokal, kerajinan handmade, produk pertanian, dan jasa harian yang mengandalkan WhatsApp, Instagram, serta marketplace sebagai kanal utama penjualan.

## Dampak

LarisNusa AI membantu UMKM:

- Menghemat waktu membuat konten promosi.
- Mengubah catatan informal menjadi ringkasan kas.
- Merespons pelanggan lebih cepat.
- Mengurangi risiko stok habis saat permintaan naik.
- Membuka peluang ekspor mikro lewat deskripsi bilingual.

## Cara Menjalankan

Buka `index.html` langsung di browser, atau jalankan server statis dari root proyek:

```bash
python -m http.server 5173
```

Lalu akses:

```text
http://localhost:5173
```

## Catatan Teknis

MVP ini berjalan client-side agar mudah didemokan dan tidak membutuhkan instalasi backend. Untuk versi produksi, database dapat ditambahkan untuk menyimpan profil usaha, riwayat transaksi, template konten, riwayat chat pelanggan, dan laporan penjualan.
