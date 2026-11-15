<?php

namespace Database\Seeders;

use App\Models\Farmer;
use Illuminate\Database\Seeder;

class FarmerSeeder extends Seeder
{
    public function run(): void
    {
        $farmers = [
            [
                'nama' => 'Pak Slamet Riyadi',
                'kelompok' => 'Kelompok Tani Sido Makmur',
                'cerita' => 'Pak Slamet sudah lebih dari dua puluh tahun menanam pisang dan sayuran di lahan keluarga. Ia memulai dari kebun kecil di belakang rumah dan kini memasok pisang kepok ke pedagang di Jati Agung.',
                'lokasi_lahan' => 'Dusun 1, Desa Banjar Agung',
                'kontak_internal' => '0812-3456-7801',
            ],
            [
                'nama' => 'Bu Siti Aminah',
                'kelompok' => 'Kelompok Wanita Tani Melati',
                'cerita' => 'Bu Siti mengelola kebun pepaya dan bayam bersama anggota KWT Melati. Hasil panennya biasa dijual di pasar desa dan menjadi bahan baku olahan warga.',
                'lokasi_lahan' => 'Dusun 2, Desa Banjar Agung',
                'kontak_internal' => '0812-3456-7802',
            ],
            [
                'nama' => 'Pak Wagiman',
                'kelompok' => 'Kelompok Tani Tunas Harapan',
                'cerita' => 'Pak Wagiman menanam singkong dan cabai dengan pola tanam bergilir. Ia aktif berbagi pengalaman budidaya kepada petani muda di kelompoknya.',
                'lokasi_lahan' => 'Dusun 3, Desa Banjar Agung',
                'kontak_internal' => '0812-3456-7803',
            ],
            [
                'nama' => 'Bu Nurhayati',
                'kelompok' => 'Kelompok Tani Sri Rejeki',
                'cerita' => 'Bu Nurhayati mengembangkan jagung manis dan terong ungu di lahan seluas setengah hektar. Ia dikenal teliti dalam memilih bibit dan menjaga kualitas hasil panen.',
                'lokasi_lahan' => 'Dusun 4, Desa Banjar Agung',
                'kontak_internal' => '0812-3456-7804',
            ],
        ];

        foreach ($farmers as $farmer) {
            Farmer::query()->updateOrCreate(
                ['nama' => $farmer['nama']],
                $farmer,
            );
        }
    }
}
