# Profil Hasil Tani Desa Banjar Agung

Profil hasil tani **Desa Banjar Agung, Kecamatan Jati Agung, Lampung Selatan**.

Pengunjung dapat melihat profil hasil tani tanpa login, lalu mengirim **permintaan informasi** ke **WhatsApp admin desa**. Tidak ada harga, pembayaran, atau checkout. Petani dikelola sebagai profil oleh admin — tidak ada akun pembeli/petani.

```
D:\Tubes_Kapsel\
├── backend\    REST API Laravel 13 + Sanctum (cookie SPA)
├── frontend\   React 19 + Vite + Tailwind CSS 4 + React Router + Axios
├── docs\       Panduan admin dan koleksi Postman
└── README.md
```

## Fitur

**Halaman publik**
- Beranda, hasil tani (`/hasil-tani`) dengan pencarian/filter/urut/pagination, detail hasil tani, profil petani, halaman statis.
- Permintaan informasi WhatsApp berisi kode referensi, hasil tani, kebutuhan, dan catatan pemohon. Tanpa harga.
- Pelacakan kunjungan halaman (total kunjungan).
- Tombol **Login Admin** di header, footer, dan halaman publik.

**Dashboard admin** (`/admin`)
- Login/logout dengan sesi Sanctum; semua route admin terlindungi.
- Ringkasan statistik, permintaan terbaru, hasil tani terpopuler, dan aktivitas terbaru.
- CRUD hasil tani (termasuk gambar), kategori, petani, dan halaman.
- Ubah status ketersediaan panen secara cepat dari tabel hasil tani.
- Daftar permintaan informasi dengan filter, ubah status, catatan admin, dan ekspor CSV.
- Pengaturan situs (identitas desa, nomor WhatsApp, logo, media sosial, template pesan).
- Log aktivitas setiap tambah/ubah/hapus.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Backend | PHP 8.3+, Laravel 13, Sanctum 4, MySQL 8 / MariaDB |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7, Axios |
| Gambar | Kompresi GD bawaan (maks. 1600 px, kualitas 82) |
| Pengujian | PHPUnit 12 (feature + unit test) |

## Prasyarat

- PHP **8.3+** dengan ekstensi `pdo_mysql`, `gd`, `fileinfo`, `mbstring`, `openssl`
- **Composer 2**
- **MySQL 8 / MariaDB** (mis. Laragon) yang berjalan di port `3306`
- **Node.js 20+** dan npm
- Windows: gunakan PowerShell. Perintah di bawah diasumsikan dari `D:\Tubes_Kapsel`.

## Instalasi

### 1. Backend (Laravel)

```powershell
cd D:\Tubes_Kapsel\backend

# Buat database (MySQL Laragon harus berjalan)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS katalog_desa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

`migrate --seed` membuat tabel sekaligus data contoh (admin, kategori, petani, produk, pengaturan, halaman).

Untuk membangun ulang database dari awal:

```powershell
php artisan migrate:fresh --seed
```

Seeder memakai `updateOrCreate`, jadi `php artisan db:seed` aman dijalankan ulang.

### 2. Frontend (React)

```powershell
cd D:\Tubes_Kapsel\frontend
npm install
copy .env.example .env
```

Isi `.env` frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Konfigurasi environment

### `backend/.env` — variabel penting

| Variabel | Nilai dev | Keterangan |
|---|---|---|
| `APP_URL` | `http://localhost:8000` | URL backend |
| `FRONTEND_URL` | `http://localhost:5173` | Origin frontend untuk CORS |
| `DB_CONNECTION` | `mysql` | Driver database |
| `DB_DATABASE` | `katalog_desa` | Nama database |
| `DB_USERNAME` / `DB_PASSWORD` | `root` / kosong | Kredensial MySQL |
| `SESSION_DRIVER` | `database` | Sesi disimpan di tabel `sessions` |
| `SESSION_DOMAIN` | `localhost` | Jangan campur `localhost` dengan `127.0.0.1` |
| `SANCTUM_STATEFUL_DOMAINS` | `localhost:5173,localhost:8000,...` | Domain SPA yang mendapat cookie login |
| `ADMIN_NAME` | `Admin Desa Banjar Agung` | Nama admin dari seeder |
| `ADMIN_EMAIL` | `admin@banjaragung.desa.id` | Email admin dari seeder |
| `ADMIN_PASSWORD` | `Admin12345!` | Password admin dari seeder |

> **Penting:** akses backend melalui `http://localhost:8000` (bukan `127.0.0.1:8000`) agar cookie `localhost` terkirim. Jika memakai `127.0.0.1`, sesuaikan `SESSION_DOMAIN` dan `SANCTUM_STATEFUL_DOMAINS` secara konsisten.

### `frontend/.env`

| Variabel | Nilai dev | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Alamat API backend |

## Menjalankan aplikasi

Jalankan dua terminal:

```powershell
# Terminal 1 — backend
cd D:\Tubes_Kapsel\backend
php artisan serve
# API: http://localhost:8000

# Terminal 2 — frontend
cd D:\Tubes_Kapsel\frontend
npm run dev
# SPA: http://localhost:5173
```

Buka `http://localhost:5173` untuk halaman publik dan `http://localhost:5173/admin/login` untuk dashboard admin.

### Akun admin contoh

| Field | Nilai default |
|---|---|
| URL | `http://localhost:5173/admin/login` |
| Email | `admin@banjaragung.desa.id` |
| Password | `Admin12345!` |

Nilai ini berasal dari `ADMIN_EMAIL` / `ADMIN_PASSWORD` di `backend/.env`. **Ganti sebelum produksi.**

## Pengujian

```powershell
cd D:\Tubes_Kapsel\backend

# Seluruh test
php artisan test --compact

# Hanya uji penerimaan Fase 6
php artisan test --compact tests/Feature/AcceptanceTest.php

# Format kode PHP
vendor/bin/pint --format agent
```

`tests/Feature/AcceptanceTest.php` mencakup skenario wajib:

1. Login berhasil dengan kredensial benar.
2. Login gagal dengan kata sandi salah.
3. Akses route admin tanpa autentikasi mengembalikan `401`.
4. CRUD hasil tani (buat, ubah, hapus/soft delete).
5. Kolom harga diabaikan dan tidak lagi muncul di respons API.
6. Unggahan file tidak valid ditolak (`422`).
7. `POST /api/leads` membuat tepat satu permintaan dengan `kode_ref` dan `kebutuhan`.
8. `kontak_internal` petani tidak pernah muncul di API publik.

Build frontend untuk produksi:

```powershell
cd D:\Tubes_Kapsel\frontend
npm run build
```

## Ringkasan API

Semua endpoint berada di bawah `/api` (tanpa versioning).

**Publik**

| Method | Path | Fungsi |
|---|---|---|
| `GET` | `/api/products` | Daftar hasil tani aktif (filter, urut, pagination) |
| `GET` | `/api/products/{slug}` | Detail hasil tani |
| `GET` | `/api/categories` | Daftar kategori |
| `GET` | `/api/farmers` | Daftar petani |
| `GET` | `/api/farmers/{id}` | Profil petani + hasil tani aktif |
| `GET` | `/api/pages/{slug}` | Halaman statis |
| `GET` | `/api/settings/public` | Identitas desa dan nomor WhatsApp |
| `POST` | `/api/leads` | Membuat permintaan informasi (rate limit 10/menit) |
| `POST` | `/api/track` | Mencatat kunjungan (rate limit 60/menit) |

**Admin** (butuh sesi login, prefix `/api/admin`)

- `POST /api/login`, `POST /api/logout`, `GET /api/admin/me`
- `products` — CRUD, restore, `PATCH .../availability`, gambar
- `categories`, `farmers`, `leads` (+ `GET /api/admin/leads/export` CSV), `pages`, `settings`
- `GET /api/admin/stats`, `GET /api/admin/activity-logs`

Login dibatasi **5 percobaan per menit** per kombinasi email + IP. Tanpa sesi valid, route admin mengembalikan `401` dengan pesan berbahasa Indonesia.

## Panduan admin

Panduan langkah demi langkah untuk pengelola desa tersedia di **[docs/panduan-admin.md](docs/panduan-admin.md)**. Ringkasnya:

1. Login di `/admin/login`.
2. Gunakan menu **Hasil Tani** untuk menambah/mengubah hasil tani dan mengunggah foto.
3. Perbarui status panen langsung dari kolom **Ketersediaan** di tabel hasil tani.
4. Pantau permintaan di menu **Permintaan Informasi**, ubah status, dan tambahkan catatan internal.
5. Atur nomor WhatsApp dan template pesan di **Pengaturan**.
6. Periksa riwayat perubahan di **Log Aktivitas**.

## Troubleshooting

| Gejala | Penyebab umum |
|---|---|
| `419 CSRF token mismatch` | Cookie CSRF belum diambil atau header `X-XSRF-TOKEN` tidak dikirim; muat ulang halaman login |
| `401` setelah login | `SESSION_DOMAIN`/`SANCTUM_STATEFUL_DOMAINS` tidak cocok dengan origin yang dipakai |
| `429` saat login | Sudah 5 percobaan gagal dalam satu menit; tunggu 60 detik |
| CORS error | `FRONTEND_URL` di `backend/.env` tidak sama dengan origin frontend |
| `could not find driver` | Ekstensi `pdo_mysql` belum aktif |
| Gambar tidak tampil | Belum menjalankan `php artisan storage:link` |
| Perubahan frontend tidak muncul | Jalankan ulang `npm run dev` atau `npm run build` |

## Catatan keamanan

- Password admin di-hash melalui cast `hashed`.
- `kontak_internal` petani di-`$hidden` pada model dan tidak pernah diserialisasi ke API publik.
- CORS hanya mengizinkan origin frontend dan mendukung cookie.
- Semua respons error API berformat JSON.
- Untuk produksi: aktifkan HTTPS, set `SESSION_SECURE_COOKIE=true`, `APP_DEBUG=false`, ganti kredensial admin, dan batasi `FRONTEND_URL` / `SANCTUM_STATEFUL_DOMAINS`.
#   k a p i t a _ h a s i l _ g a b u t  
 