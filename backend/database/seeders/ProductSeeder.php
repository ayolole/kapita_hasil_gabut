<?php

namespace Database\Seeders;

use App\Enums\ProductAvailability;
use App\Models\Category;
use App\Models\Farmer;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::query()->pluck('id', 'slug');
        $farmers = Farmer::query()->pluck('id', 'nama');

        $products = [
            [
                'nama' => 'Pisang Kepok',
                'slug' => 'pisang-kepok',
                'category' => 'buah',
                'farmer' => 'Pak Slamet Riyadi',
                'deskripsi' => 'Pisang kepok matang pohon dengan rasa manis dan tekstur lembut. Cocok untuk konsumsi langsung, pisang goreng, atau olahan kue.',
                'spesifikasi' => "Satu sisir berisi 8-12 buah\nDipanen saat matang pohon\nTanpa pengawet",
                'satuan' => 'kg',
                'status' => ProductAvailability::Tersedia,
                'stok' => 120,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Pepaya California',
                'slug' => 'pepaya-california',
                'category' => 'buah',
                'farmer' => 'Bu Siti Aminah',
                'deskripsi' => 'Pepaya California dengan daging buah merah, manis, dan tebal. Dipetik sesuai tingkat kematangan agar tahan perjalanan.',
                'spesifikasi' => "Berat 1,5-2,5 kg per buah\nDaging merah oranye\nDipetik saat mulai matang",
                'satuan' => 'kg',
                'status' => ProductAvailability::Tersedia,
                'stok' => 80,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Singkong Mentega',
                'slug' => 'singkong-mentega',
                'category' => 'umbi-palawija',
                'farmer' => 'Pak Wagiman',
                'deskripsi' => 'Singkong mentega dengan tekstur pulen dan rasa gurih. Cocok untuk singkong goreng, tape, maupun tepung.',
                'spesifikasi' => "Umur panen 9-10 bulan\nDaging putih kekuningan\nDikemas dalam karung 25 kg",
                'satuan' => 'kg',
                'status' => ProductAvailability::Tersedia,
                'stok' => 300,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Kangkung Segar',
                'slug' => 'kangkung-segar',
                'category' => 'sayur',
                'farmer' => 'Pak Slamet Riyadi',
                'deskripsi' => 'Kangkung darat segar yang dipanen pada pagi hari. Batang muda dan daun hijau, siap dimasak.',
                'spesifikasi' => "Satu ikat sekitar 250 gram\nDipanen pagi hari\nDikirim tanpa akar",
                'satuan' => 'ikat',
                'status' => ProductAvailability::Tersedia,
                'stok' => 50,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Jagung Manis',
                'slug' => 'jagung-manis',
                'category' => 'umbi-palawija',
                'farmer' => 'Bu Nurhayati',
                'deskripsi' => 'Jagung manis varietas unggul dengan biji kuning cerah dan rasa manis alami. Cocok untuk jagung bakar dan sayur.',
                'spesifikasi' => "Satu buah sekitar 300-400 gram\nDipetik saat rambut jagung kecokelatan\nTanpa pestisida berlebihan",
                'satuan' => 'kg',
                'status' => ProductAvailability::Terbatas,
                'stok' => 40,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Cabai Merah Keriting',
                'slug' => 'cabai-merah-keriting',
                'category' => 'sayur',
                'farmer' => 'Pak Wagiman',
                'deskripsi' => 'Cabai merah keriting dengan tingkat kepedasan sedang. Dipanen manual dan disortir agar hanya buah sehat yang dikirim.',
                'spesifikasi' => "Panen manual\nWarna merah merata\nDisortir sebelum dikemas",
                'satuan' => 'kg',
                'status' => ProductAvailability::Terbatas,
                'stok' => 15,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Bayam Hijau',
                'slug' => 'bayam-hijau',
                'category' => 'sayur',
                'farmer' => 'Bu Siti Aminah',
                'deskripsi' => 'Bayam hijau segar dengan daun lebar dan batang muda. Stok sedang kosong dan akan tersedia kembali setelah panen berikutnya.',
                'spesifikasi' => "Satu ikat sekitar 200 gram\nDaun lebar dan batang muda\nDipanen pagi hari",
                'satuan' => 'ikat',
                'status' => ProductAvailability::Habis,
                'stok' => 0,
                'estimasi_panen' => null,
                'aktif' => true,
            ],
            [
                'nama' => 'Semangka Inul',
                'slug' => 'semangka-inul',
                'category' => 'buah',
                'farmer' => 'Bu Siti Aminah',
                'deskripsi' => 'Semangka Inul berdaging merah dan berair. Produk contoh ini sengaja dinonaktifkan untuk menguji filter hasil tani publik.',
                'spesifikasi' => "Berat 3-5 kg per buah\nDaging merah tanpa biji\nDitanam di lahan kering",
                'satuan' => 'kg',
                'status' => ProductAvailability::Habis,
                'stok' => 0,
                'estimasi_panen' => null,
                'aktif' => false,
            ],
            [
                'nama' => 'Terong Ungu',
                'slug' => 'terong-ungu',
                'category' => 'sayur',
                'farmer' => 'Bu Nurhayati',
                'deskripsi' => 'Terong ungu dengan kulit mengilap dan daging lembut. Panen berikutnya diperkirakan dalam beberapa minggu ke depan.',
                'spesifikasi' => "Panjang 18-25 cm\nKulit ungu mengilap\nPanen berikutnya dalam 2-3 minggu",
                'satuan' => 'kg',
                'status' => ProductAvailability::AkanPanen,
                'stok' => 0,
                'estimasi_panen' => now()->addDays(18)->toDateString(),
                'aktif' => true,
            ],
            [
                'nama' => 'Ubi Jalar Cilembu',
                'slug' => 'ubi-jalar-cilembu',
                'category' => 'umbi-palawija',
                'farmer' => 'Pak Slamet Riyadi',
                'deskripsi' => 'Ubi jalar Cilembu dengan rasa manis dan tekstur lembut. Sedang dalam masa pertumbuhan dan diperkirakan panen awal bulan depan.',
                'spesifikasi' => "Daging kuning kemerahan\nRasa manis alami\nEstimasi panen awal Desember",
                'satuan' => 'kg',
                'status' => ProductAvailability::AkanPanen,
                'stok' => 0,
                'estimasi_panen' => now()->addDays(31)->toDateString(),
                'aktif' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [
                    'nama' => $product['nama'],
                    'category_id' => $categories[$product['category']],
                    'farmer_id' => $farmers[$product['farmer']],
                    'deskripsi' => $product['deskripsi'],
                    'spesifikasi' => $product['spesifikasi'],
                    'satuan' => $product['satuan'],
                    'status_ketersediaan' => $product['status'],
                    'stok' => $product['stok'],
                    'estimasi_panen' => $product['estimasi_panen'],
                    'aktif' => $product['aktif'],
                ],
            );
        }
    }
}
