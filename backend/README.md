# Backend Profil Hasil Tani Desa Banjar Agung

REST API Laravel 13 untuk profil hasil pertanian Desa Banjar Agung. Autentikasi dashboard memakai **Laravel Sanctum mode cookie SPA**, bukan Bearer token.

## Prasyarat

- PHP 8.3+ dengan ekstensi `pdo_mysql`, `gd`, `fileinfo`, `mbstring`, `openssl`
- Composer 2
- MySQL 8 / MariaDB
- Server lokal: `php artisan serve` di port `8000`

## Instalasi

```powershell
cd D:\Tubes_Kapsel\backend

# MySQL Laragon harus berjalan di port 3306
mysql -u root -e "CREATE DATABASE IF NOT EXISTS katalog_desa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Untuk membangun ulang database dari awal:

```powershell
php artisan migrate:fresh --seed
```

Seeder aman dijalankan ulang dengan `php artisan db:seed` karena memakai `updateOrCreate` (kecuali file gambar yang akan ditimpa dengan nama sama).

## Konfigurasi penting

| Variabel | Nilai dev | Keterangan |
|---|---|---|
| `APP_URL` | `http://localhost:8000` | URL backend |
| `FRONTEND_URL` | `http://localhost:5173` | Origin React yang diizinkan CORS |
| `DB_DATABASE` | `katalog_desa` | Nama database |
| `SESSION_DRIVER` | `database` | Session disimpan di tabel `sessions` |
| `SESSION_DOMAIN` | `localhost` | Gunakan `localhost`, jangan campur dengan `127.0.0.1` |
| `SANCTUM_STATEFUL_DOMAINS` | `localhost:5173,localhost:8000,...` | Domain SPA yang mendapat cookie autentikasi |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | kredensial admin seeder | Ganti di produksi |

**Penting:** frontend dan Postman harus mengakses backend melalui `http://localhost:8000` (bukan `127.0.0.1:8000`) agar cookie `localhost` ikut terkirim. Jika memakai `127.0.0.1`, sesuaikan `SESSION_DOMAIN` dan `SANCTUM_STATEFUL_DOMAINS` secara konsisten.

## Alur autentikasi Sanctum SPA

1. Frontend/Postman memanggil `GET /sanctum/csrf-cookie`. Server mengirim cookie `laravel_session` dan `XSRF-TOKEN`.
2. Setiap request yang mengubah data mengirim header `X-XSRF-TOKEN` berisi nilai cookie `XSRF-TOKEN` yang sudah di-URL-decode.
3. Request stateful juga harus mengirim `Origin` (dan sebaiknya `Referer`) yang cocok dengan `SANCTUM_STATEFUL_DOMAINS`.
4. `POST /api/login` membuat session. Tidak ada token Bearer yang dikembalikan.
5. `POST /api/logout` menghapus session.
6. Axios di React nanti menggunakan `withCredentials: true` dan `withXSRFToken: true`.

## Endpoint autentikasi

| Method | Path | Middleware | Fungsi |
|---|---|---|---|
| `GET` | `/sanctum/csrf-cookie` | Sanctum | Mengambil cookie CSRF |
| `POST` | `/api/login` | `throttle:login` | Login admin |
| `POST` | `/api/logout` | `auth:sanctum` | Logout |
| `GET` | `/api/admin/me` | `auth:sanctum` | Profil admin yang sedang login |

Rate limit login: **5 percobaan per menit** per kombinasi email + IP. Percobaan ke-6 menghasilkan `429`.

Tanpa session yang valid, endpoint `auth:sanctum` mengembalikan:

```json
{
  "message": "Sesi tidak valid atau sudah berakhir. Silakan login kembali."
}
```

## Menguji login dengan Postman

Koleksi siap pakai: `docs/postman/Katalog-Desa-Fase-1.postman_collection.json`.

### Cara otomatis

1. Jalankan backend: `php artisan serve`.
2. Buka Postman → **Import** → pilih file koleksi di atas.
3. Periksa tab **Variables**:
   - `baseUrl` = `http://localhost:8000`
   - `frontendOrigin` = `http://localhost:5173`
   - `adminEmail` = `admin@banjaragung.desa.id`
   - `adminPassword` = `Admin12345!`
4. Pastikan **cookie jar** Postman aktif (Pengaturan → General → Cookies).
5. Jalankan folder secara berurutan:
   1. **Ambil CSRF Cookie** → `204`
   2. **Login Admin** → `200`, mengembalikan data admin
   3. **Profil Admin** → `200`
   4. **Logout Admin** → `200`
   5. **Profil Admin Tanpa Sesi** → `401`

Pre-request script pada request login/logout otomatis menyalin cookie `XSRF-TOKEN` ke header `X-XSRF-TOKEN`.

### Cara manual

1. `GET http://localhost:8000/sanctum/csrf-cookie`
   - Header: `Accept: application/json`, `Origin: http://localhost:5173`
   - Pastikan cookie `XSRF-TOKEN` muncul di cookie jar.
2. Salin nilai cookie `XSRF-TOKEN`, lakukan **URL decode** (misalnya `%3D` menjadi `=`).
3. `POST http://localhost:8000/api/login`
   - Header: `Accept: application/json`, `Content-Type: application/json`
   - Header: `Origin: http://localhost:5173`
   - Header: `Referer: http://localhost:5173/`
   - Header: `X-XSRF-TOKEN: <nilai cookie hasil decode>`
   - Body raw JSON:
     ```json
     {
       "email": "admin@banjaragung.desa.id",
       "password": "Admin12345!"
     }
     ```
   - Respons `200`:
     ```json
     {
       "message": "Login berhasil.",
       "data": {
         "id": 1,
         "name": "Admin Desa Banjar Agung",
         "email": "admin@banjaragung.desa.id",
         "created_at": "2026-11-04T18:45:00+07:00"
       }
     }
     ```
4. `GET http://localhost:8000/api/admin/me` dengan cookie yang sama → `200`.
5. `POST http://localhost:8000/api/logout` dengan header CSRF terbaru → `200`.
6. Ulangi `GET /api/admin/me` → `401`.

### Troubleshooting Postman

| Status | Penyebab umum |
|---|---|
| `419` | Header `X-XSRF-TOKEN` belum diisi, nilainya belum di-decode, atau cookie jar mati |
| `401` setelah login | `Origin` tidak cocok dengan `SANCTUM_STATEFUL_DOMAINS`, atau cookie tidak tersimpan |
| `429` | Sudah 5 percobaan login dalam satu menit; tunggu 60 detik |
| CORS error | `FRONTEND_URL`/`SANCTUM_STATEFUL_DOMAINS` tidak sesuai origin frontend |
| `could not find driver` | Ekstensi `pdo_mysql` belum aktif |

## Pengujian otomatis

```powershell
php artisan test --compact
```

Cakupan: login sukses/gagal, validasi, rate limit 5x, 401 tanpa session, profil admin, logout, preflight CORS, relasi model, soft delete, kode permintaan, statistik kunjungan total, dan penyembunyian `kontak_internal`.

`tests/Feature/AcceptanceTest.php` mengunci skenario wajib Fase 6: login benar/salah, akses admin tanpa autentikasi (`401`), CRUD hasil tani, pengabaian kolom harga, penolakan unggahan file tidak valid, `POST /api/leads` yang membuat tepat satu permintaan ber-`kode_ref` dan `kebutuhan`, serta `kontak_internal` yang tidak pernah muncul di API publik.

## Struktur data

| Tabel | Keterangan |
|---|---|
| `users` | Admin dashboard |
| `categories` | Kategori hasil tani |
| `farmers` | Profil petani; `kontak_internal` disembunyikan dari serialisasi |
| `products` | Hasil tani, status ketersediaan, stok, soft delete (tanpa harga) |
| `product_images` | Galeri foto hasil tani |
| `leads` | Permintaan informasi WhatsApp, kode `LD-000001`, kolom `kebutuhan` |
| `site_settings` | Nomor WhatsApp admin dan template pesan |
| `pages` | Halaman profil desa/storytelling |
| `activity_logs` | Log aktivitas admin |
| `page_views` | Statistik kunjungan halaman |

Model memakai enum `ProductAvailability` dan `LeadStatus`.

## Catatan keamanan

- Password admin di-hash melalui cast `hashed`.
- Endpoint `/api/admin/*` dilindungi `auth:sanctum`.
- Login dibatasi 5 percobaan per menit.
- `kontak_internal` petani di-`$hidden` pada model.
- CORS hanya mengizinkan origin frontend dan mendukung cookie (`supports_credentials`).
- Respons error API selalu JSON, bukan redirect HTML.
- Untuk produksi: aktifkan HTTPS, set `SESSION_SECURE_COOKIE=true`, `APP_DEBUG=false`, ganti kredensial admin, dan batasi `FRONTEND_URL`.

## Status implementasi

Seluruh fase sudah diimplementasikan:

- **Fase 1** — migration, model, seeder, Sanctum SPA, CORS, login/logout.
- **Fase 2** — API publik hasil tani, permintaan informasi WhatsApp, pelacakan kunjungan.
- **Fase 3** — seluruh endpoint `/api/admin/*`: CRUD hasil tani/kategori/petani/permintaan/halaman/pengaturan, gambar, ekspor CSV, statistik, log aktivitas.
- **Fase 4** — aplikasi React halaman publik.
- **Fase 5** — dashboard admin React.
- **Fase 6** — feature test penerimaan dan dokumentasi.

Daftar endpoint lengkap, instalasi frontend, dan panduan admin ada di [README utama](../README.md) dan [docs/panduan-admin.md](../docs/panduan-admin.md).
