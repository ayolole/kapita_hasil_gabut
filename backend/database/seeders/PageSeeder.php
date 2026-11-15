<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'slug' => 'profil-desa',
                'judul' => 'Profil Desa Banjar Agung',
                'isi' => <<<'HTML'
<p>Desa Banjar Agung terletak di Kecamatan Jati Agung, Kabupaten Lampung Selatan, Provinsi Lampung. Wilayah ini dikenal sebagai salah satu sentra pertanian dengan tanah yang subur dan sumber air yang mendukung budidaya sayur, buah, serta palawija.</p>
<p>Sebagian besar warga desa menggantungkan hidup dari bertani. Selain dijual di pasar lokal, hasil panen mulai dipromosikan melalui profil hasil tani digital agar lebih mudah ditemukan pembeli dari luar desa.</p>
<p>Profil ini dikelola oleh perangkat desa. Pembeli dapat menghubungi admin desa melalui WhatsApp untuk menanyakan ketersediaan dan pengiriman hasil tani.</p>
HTML,
            ],
            [
                'slug' => 'potensi-pertanian',
                'judul' => 'Potensi Pertanian',
                'isi' => <<<'HTML'
<p>Potensi utama Desa Banjar Agung meliputi komoditas pisang, pepaya, singkong, jagung manis, cabai, sayuran daun, dan ubi jalar. Pola tanam dilakukan secara bergilir agar hasil panen tersedia sepanjang tahun.</p>
<p>Kelompok tani dan kelompok wanita tani di desa aktif berbagi bibit, pengalaman budidaya, serta menjaga kualitas hasil panen. Pengelolaan lahan masih banyak dilakukan secara turun-temurun dengan sentuhan teknik pertanian yang terus diperbarui.</p>
<p>Melalui profil hasil tani digital ini, potensi tersebut diharapkan lebih mudah dikenal oleh pembeli, pedagang, maupun pengelola kuliner di Lampung dan sekitarnya.</p>
HTML,
            ],
            [
                'slug' => 'cerita-petani',
                'judul' => 'Cerita dari Petani Banjar Agung',
                'isi' => <<<'HTML'
<p>Setiap hasil tani di halaman ini berasal dari kebun warga Desa Banjar Agung. Para petani merawat tanaman sejak pemilihan bibit, perawatan harian, hingga panen dan penyortiran.</p>
<p>Kisah Pak Slamet, Bu Siti, Pak Wagiman, dan Bu Nurhayati adalah sebagian kecil dari cerita warga yang menjaga tradisi bertani di desa. Halaman ini dibagikan melalui kegiatan desa maupun kemasan hasil tani.</p>
<p>Dengan menanyakan hasil panen warga, Anda ikut mendukung penghasilan keluarga petani dan keberlanjutan pertanian lokal.</p>
HTML,
            ],
        ];

        foreach ($pages as $page) {
            Page::query()->updateOrCreate(
                ['slug' => $page['slug']],
                ['judul' => $page['judul'], 'isi' => $page['isi']],
            );
        }
    }
}
