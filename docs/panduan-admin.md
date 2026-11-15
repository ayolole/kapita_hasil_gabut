# Panduan Singkat Admin

Panduan ini untuk pengelola (admin desa) yang mengurus profil hasil tani **Desa Banjar Agung**. Semua menu berbahasa Indonesia dan dapat dipakai dari komputer maupun ponsel.

Situs ini **tidak menjual** hasil tani. Tidak ada harga dan tidak ada pembayaran. Pengunjung hanya melihat profil hasil tani lalu mengirim **permintaan informasi** ke WhatsApp admin desa.

## 1. Masuk dan keluar

1. Buka `http://localhost:5173/admin/login` (atau alamat website desa Anda + `/admin/login`).
2. Masukkan **email** dan **kata sandi** admin, lalu tekan **Masuk**.
3. Setelah masuk, Anda akan melihat halaman **Ringkasan**.
4. Untuk keluar, tekan tombol **Keluar** di bagian bawah menu samping.

> Tombol **Login Admin** juga tersedia di header dan footer situs publik, serta di halaman login.

> Jika muncul pesan "Email atau kata sandi salah", periksa kembali penulisan email dan kata sandi. Setelah 5 kali gagal, tunggu 1 menit sebelum mencoba lagi.

## 2. Ringkasan

Halaman **Ringkasan** menampilkan:

- Jumlah hasil tani aktif, permintaan baru, petani, kategori, dan total kunjungan.
- Peringatan jika ada hasil tani **habis** atau **akan panen**.
- **Permintaan terbaru** — permintaan informasi yang baru masuk.
- **Hasil tani terpopuler** — yang paling sering dilihat.
- **Aktivitas terbaru** — perubahan terakhir yang Anda lakukan.

Gunakan halaman ini setiap pagi untuk melihat permintaan baru dan hasil tani yang perlu diperbarui.

## 3. Mengelola hasil tani

Menu **Hasil Tani** berisi tabel semua hasil tani.

### Menambah hasil tani

1. Tekan **Tambah Hasil Tani**.
2. Isi kolom wajib: **Nama Hasil Tani**, **Kategori**, **Petani**, dan **Satuan** (mis. `kg`, `ikat`, `buah`).
3. Opsional: deskripsi, spesifikasi, stok, tanggal estimasi panen.
4. Pilih **Status Ketersediaan**:
   - **Tersedia** — siap dipanen/diambil.
   - **Terbatas** — stok sedikit.
   - **Habis** — sedang tidak ada.
   - **Akan Panen** — belum tersedia, isi perkiraan tanggal panen.
5. Centang **Tampilkan di halaman hasil tani** agar muncul di situs publik.
6. Tekan **Simpan Hasil Tani**.

> Tidak ada kolom harga. Harga tidak ditampilkan di mana pun.

### Mengubah hasil tani

Tekan **Edit** pada baris hasil tani. Anda dapat mengubah data dan mengganti foto.

### Mengubah status panen dengan cepat

Di tabel hasil tani, ubah pilihan pada kolom **Ketersediaan** (mis. dari *Tersedia* ke *Habis*). Perubahan langsung tersimpan tanpa membuka formulir.

### Mengunggah foto

1. Buka **Edit**, lalu bagian **Foto Hasil Tani**.
2. Pilih berkas JPG, PNG, atau WEBP (maksimal 5 MB).
3. Foto otomatis diperkecil agar website tetap cepat.
4. Tekan **Unggah Foto**.

### Menghapus hasil tani

Tekan **Hapus**, lalu konfirmasi. Data dihapus dari daftar publik (dapat dipulihkan lewat filter **Terhapus** → **Pulihkan**).

## 4. Kategori

Menu **Kategori** untuk mengelompokkan hasil tani (mis. Sayur, Buah, Umbi & Palawija).

- **Tambah Kategori** — isi nama, slug dibuat otomatis.
- **Edit** — ubah nama kategori.
- **Hapus** — hanya bisa jika kategori tidak lagi dipakai hasil tani.

## 5. Petani

Menu **Petani** berisi profil petani desa. Profil ini tampil di halaman publik, tetapi **kontak internal hanya terlihat oleh admin**.

- **Tambah Petani** — isi nama, kelompok tani, lokasi lahan, dan cerita singkat.
- **Foto Petani** — unggah foto wajah atau aktivitas bertani (JPG/PNG/WEBP, maks. 5 MB).
- **Kontak Internal** — nomor telepon/WhatsApp petani untuk keperluan admin. Tidak pernah ditampilkan ke pengunjung.
- Halaman edit juga menampilkan daftar hasil tani milik petani tersebut.
- Petani yang masih memiliki hasil tani **tidak dapat dihapus**.

## 6. Permintaan informasi

Menu **Permintaan Informasi** menampilkan permintaan yang dikirim pengunjung melalui WhatsApp.

- Gunakan pencarian dan filter **status**, **tanggal**, serta **urutan**.
- Ubah status langsung dari tabel: **Baru**, **Dihubungi**, **Selesai**, atau **Batal**.
- Tekan **Detail** untuk melihat hasil tani, **kebutuhan**, dan catatan pemohon.
- Isi **Catatan Admin** untuk mencatat tindak lanjut (tidak dilihat pemohon).
- Tekan **Unduh CSV** untuk mengunduh daftar permintaan sesuai filter.

> Status hanya catatan internal. Pemohon tidak menerima notifikasi otomatis; hubungi pemohon melalui WhatsApp secara manual untuk memberi informasi ketersediaan dan pengiriman.

## 7. Pengaturan situs

Menu **Pengaturan** mengatur identitas dan kontak desa.

- **Nama Desa** dan **Tagline** — tampil di header dan footer.
- **Nomor WhatsApp Admin Desa** — gunakan format `628xxxxxxxxxx` (tanpa tanda `+` dan tanpa spasi). Pengunjung diarahkan ke nomor ini.
- **Logo Desa** — JPG/PNG/WEBP, maks. 3 MB.
- **Media Sosial** — tautan Facebook, Instagram, YouTube (opsional).
- **Template Pesan WhatsApp** — pesan otomatis saat pengunjung menekan tombol permintaan.

Penanda yang dapat dipakai di template:

| Penanda | Isi |
|---|---|
| `{kode_ref}` | Kode permintaan, mis. `LD-000001` |
| `{nama_produk}` | Nama hasil tani |
| `{kebutuhan}` | Kebutuhan yang ditulis pemohon |
| `{catatan}` | Catatan dari pemohon |
| `{nama_pembeli}` | Nama pemohon |
| `{jumlah}` | Jumlah (opsional, jarang dipakai) |
| `{satuan}` | Satuan hasil tani, mis. `kg` |

Tekan **Simpan Pengaturan** setelah selesai.

## 8. Halaman

Menu **Halaman** mengelola halaman statis seperti **Profil Desa** atau **Cerita Petani**.

- **Tambah Halaman** — isi judul, slug (opsional), dan isi halaman.
- **Lihat** — membuka halaman di situs publik.
- **Edit** / **Hapus** — ubah atau hapus halaman.

## 9. Log aktivitas

Menu **Log Aktivitas** mencatat setiap **tambah**, **ubah**, dan **hapus** yang dilakukan admin, lengkap dengan waktu, deskripsi, dan pengguna. Gunakan filter untuk menelusuri perubahan tertentu. Log hanya dapat dilihat, tidak dapat diubah.

## 10. Tips dan pertanyaan umum

**Pengunjung tidak bisa mengirim permintaan?**
Pastikan **Nomor WhatsApp** di Pengaturan sudah benar dan hasil tani berstatus **Tersedia** atau **Terbatas**.

**Hasil tani tidak muncul di halaman publik?**
Periksa centang **Tampilkan di halaman hasil tani** dan pastikan data tidak terhapus.

**Foto gagal diunggah?**
Gunakan JPG, PNG, atau WEBP di bawah batas ukuran (hasil tani 5 MB, logo 3 MB).

**Muncul pesan "Sesi tidak valid atau sudah berakhir"?**
Sesi login berakhir. Masuk kembali melalui halaman login.

**Perubahan tidak terlihat di website?**
Muat ulang halaman (Ctrl+F5). Jika masih belum, hubungi pengelola teknis.

**Apakah pengunjung perlu membuat akun?**
Tidak. Pengunjung langsung melihat halaman hasil tani dan mengirim permintaan informasi lewat WhatsApp admin desa.

**Mengapa tidak ada harga?**
Situs ini hanya profil hasil tani. Ketersediaan, harga, dan pengiriman dijelaskan oleh admin desa melalui WhatsApp.
