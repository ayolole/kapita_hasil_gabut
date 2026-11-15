# Frontend — Profil Hasil Tani Desa Banjar Agung

Aplikasi **React + Vite + Tailwind CSS (v4) + React Router + Axios** untuk profil hasil pertanian Desa Banjar Agung. Seluruh teks antarmuka berbahasa Indonesia dan dirancang **mobile-first**. Tidak ada harga, pembayaran, atau checkout.

## Menjalankan

```sh
# Terminal 1 — backend
cd ../backend
php artisan serve            # API di http://localhost:8000

# Terminal 2 — frontend
npm install
npm run dev                  # SPA di http://localhost:5173
```

Atur alamat API lewat `.env` (lihat `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8000
```

## Halaman & alur

| Rute | Halaman | Sumber data |
|---|---|---|
| `/` | Beranda (hero, profil desa dari CMS, kategori, hasil tani terbaru, petani) | `GET /api/products` `GET /api/categories` `GET /api/farmers` `GET /api/pages/profil-desa` `GET /api/settings/public` |
| `/hasil-tani` | Daftar hasil tani (cari, filter kategori/ketersediaan, urut, pagination — state tersinkron dengan URL) | `GET /api/products` |
| `/katalog` | Redirect permanen ke `/hasil-tani` | — |
| `/produk/:slug` | Detail hasil tani + galeri + formulir permintaan informasi | `GET /api/products/:slug` `POST /api/leads` |
| `/petani/:id` | Profil petani + hasil tani aktif miliknya | `GET /api/farmers/:id` |
| `/profil-desa` | Redirect ke beranda bagian profil desa (`/#profil-desa`) | — |
| `/halaman/:slug` | Halaman CMS generik | `GET /api/pages/:slug` |
| `/admin/login` | Login admin | `POST /api/login` |
| `/admin` | Ringkasan dashboard | `GET /api/admin/stats` |
| `/admin/produk` (+ `/baru`, `/:id`) | CRUD hasil tani, ketersediaan cepat, foto | `/api/admin/products/*` |
| `/admin/kategori` | CRUD kategori | `/api/admin/categories/*` |
| `/admin/petani` (+ `/baru`, `/:id`) | CRUD petani + foto | `/api/admin/farmers/*` |
| `/admin/lead` | Daftar permintaan informasi, ubah status, detail, ekspor CSV | `/api/admin/leads/*` |
| `/admin/pengaturan` | Identitas desa, WhatsApp, logo, template pesan | `/api/admin/settings` |
| `/admin/halaman` | CRUD halaman statis | `/api/admin/pages/*` |
| `/admin/log-aktivitas` | Riwayat aktivitas admin | `/api/admin/activity-logs` |
| `*` | 404 | — |

Semua route `/admin/*` (kecuali login) dilindungi `AuthContext` + `AdminLayout`; pengguna yang belum login diarahkan ke `/admin/login`. Tombol **Login Admin** juga tampil di header dan footer situs publik.

## Catatan penting

- **Permintaan informasi via WhatsApp**: pengunjung mengisi nama/kebutuhan/catatan di modal → `POST /api/leads` mengembalikan `kode_ref` plus draf pesan `https://wa.me/...` yang dikirim ke **admin desa** (bukan ke petani).
- **Pelacakan kunjungan**: setiap navigasi dikirim ke `POST /api/track` dan disimpan sebagai total kunjungan halaman (tanpa sumber QR).
- **CSRF**: `POST /api/track` dan `POST /api/leads` melewati pipeline Sanctum stateful, sehingga Axios otomatis mengambil cookie `XSRF-TOKEN` dari `GET /sanctum/csrf-cookie` lalu mengirim header `X-XSRF-TOKEN` (dengan satu kali retry bila token kedaluwarsa/419).
- Semua halaman menangani state **loading** (skeleton/spinner), **kosong**, dan **error** (dengan tombol coba lagi), termasuk fallback 404 backend.
