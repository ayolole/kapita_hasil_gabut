<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'nama_desa' => 'Desa Banjar Agung',
                'tagline' => 'Profil hasil pertanian warga Desa Banjar Agung, Kecamatan Jati Agung, Lampung Selatan.',
                'nomor_whatsapp' => '6281234567890',
                'template_pesan' => implode("\n", [
                    'Halo Admin Desa Banjar Agung,',
                    'saya ingin menanyakan hasil tani berikut:',
                    '',
                    'Kode permintaan: {kode_ref}',
                    'Hasil tani: {nama_produk}',
                    'Nama: {nama_pembeli}',
                    'Kebutuhan: {kebutuhan}',
                    'Catatan: {catatan}',
                    '',
                    'Mohon dibantu informasi ketersediaan dan pengirimannya. Terima kasih.',
                ]),
                'logo' => null,
                'media_sosial' => [
                    'facebook' => null,
                    'instagram' => null,
                    'youtube' => null,
                ],
            ],
        );
    }
}
