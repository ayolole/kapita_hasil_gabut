<?php

namespace Tests\Feature;

use App\Enums\ProductAvailability;
use App\Models\Category;
use App\Models\Farmer;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_list_only_returns_active_products(): void
    {
        Product::factory()->create(['nama' => 'Pisang Aktif', 'slug' => 'pisang-aktif']);
        Product::factory()->tidakAktif()->create(['nama' => 'Semangka Nonaktif', 'slug' => 'semangka-nonaktif']);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'pisang-aktif')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'nama',
                    'slug',
                    'satuan',
                    'status_ketersediaan' => ['value', 'label'],
                    'stok',
                    'estimasi_panen',
                    'gambar_utama',
                    'kategori' => ['id', 'nama', 'slug'],
                    'petani' => ['id', 'nama', 'kelompok', 'foto'],
                ]],
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_product_list_can_be_searched_by_name_and_description(): void
    {
        Product::factory()->create([
            'nama' => 'Cabai Merah Keriting',
            'slug' => 'cabai-merah',
            'deskripsi' => 'Pedas menyengat',
        ]);
        Product::factory()->create([
            'nama' => 'Pisang Kepok',
            'slug' => 'pisang-kepok',
            'deskripsi' => 'Manis dan lembut',
        ]);

        $this->getJson('/api/products?search=cabai')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'cabai-merah');

        $this->getJson('/api/products?search=lembut')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'pisang-kepok');
    }

    public function test_product_list_can_be_filtered_by_category_slug(): void
    {
        $sayur = Category::factory()->create(['nama' => 'Sayur', 'slug' => 'sayur']);
        $buah = Category::factory()->create(['nama' => 'Buah', 'slug' => 'buah']);

        Product::factory()->create(['category_id' => $sayur->id, 'slug' => 'kangkung-segar']);
        Product::factory()->create(['category_id' => $buah->id, 'slug' => 'pisang-kepok']);

        $this->getJson('/api/products?category=sayur')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'kangkung-segar');
    }

    public function test_product_list_can_be_filtered_by_status(): void
    {
        Product::factory()->create([
            'status_ketersediaan' => ProductAvailability::Tersedia,
            'slug' => 'tersedia-satu',
        ]);
        Product::factory()->create([
            'status_ketersediaan' => ProductAvailability::Habis,
            'slug' => 'habis-satu',
        ]);

        $this->getJson('/api/products?status=habis')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'habis-satu');
    }

    public function test_product_list_rejects_unknown_status(): void
    {
        $this->getJson('/api/products?status=ngawur')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_product_list_can_be_sorted_by_name(): void
    {
        Product::factory()->create(['nama' => 'Zukini', 'slug' => 'zukini']);
        Product::factory()->create(['nama' => 'Anggur', 'slug' => 'anggur']);

        $this->getJson('/api/products?sort=nama')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'anggur')
            ->assertJsonPath('data.1.slug', 'zukini');
    }

    public function test_product_list_rejects_price_sort(): void
    {
        $this->getJson('/api/products?sort=termurah')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('sort');
    }

    public function test_product_list_is_paginated(): void
    {
        Product::factory()->count(5)->create();

        $this->getJson('/api/products?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.last_page', 3);
    }

    public function test_product_list_rejects_per_page_above_limit(): void
    {
        $this->getJson('/api/products?per_page=100')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }

    public function test_product_detail_returns_images_and_farmer_without_internal_contact(): void
    {
        $farmer = Farmer::factory()->create([
            'nama' => 'Pak Slamet',
            'kontak_internal' => '0812-9999-8888',
        ]);

        $product = Product::factory()->create([
            'slug' => 'pisang-kepok',
            'nama' => 'Pisang Kepok',
            'deskripsi' => 'Pisang matang pohon.',
            'farmer_id' => $farmer->id,
        ]);

        ProductImage::query()->create([
            'product_id' => $product->id,
            'path' => 'products/pisang-kepok-1.jpg',
            'alt_text' => 'Foto pisang',
            'urutan' => 1,
        ]);

        $response = $this->getJson('/api/products/pisang-kepok');

        $response->assertOk()
            ->assertJsonPath('data.slug', 'pisang-kepok')
            ->assertJsonPath('data.deskripsi', 'Pisang matang pohon.')
            ->assertJsonPath('data.petani.nama', 'Pak Slamet')
            ->assertJsonCount(1, 'data.gambar')
            ->assertJsonPath(
                'data.gambar.0.url',
                Storage::disk('public')->url('products/pisang-kepok-1.jpg'),
            );

        $this->assertStringNotContainsString('kontak_internal', $response->getContent());
        $this->assertStringNotContainsString('0812-9999-8888', $response->getContent());
    }

    public function test_product_detail_returns_not_found_for_inactive_product(): void
    {
        Product::factory()->tidakAktif()->create(['slug' => 'semangka-inul']);

        $this->getJson('/api/products/semangka-inul')
            ->assertNotFound()
            ->assertJsonPath('message', 'Produk tidak ditemukan.');
    }

    public function test_product_detail_returns_not_found_for_unknown_slug(): void
    {
        $this->getJson('/api/products/tidak-ada')
            ->assertNotFound()
            ->assertJsonPath('message', 'Data yang diminta tidak ditemukan.');
    }

    public function test_categories_list_includes_active_product_counts(): void
    {
        $sayur = Category::factory()->create(['nama' => 'Sayur', 'slug' => 'sayur']);

        Product::factory()->create(['category_id' => $sayur->id]);
        Product::factory()->tidakAktif()->create(['category_id' => $sayur->id]);

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'sayur')
            ->assertJsonPath('data.0.jumlah_produk', 1);
    }

    public function test_farmers_list_hides_internal_contact(): void
    {
        $farmer = Farmer::factory()->create([
            'nama' => 'Bu Siti',
            'kontak_internal' => '0812-7777-6666',
        ]);

        Product::factory()->create(['farmer_id' => $farmer->id]);

        $response = $this->getJson('/api/farmers');

        $response->assertOk()
            ->assertJsonPath('data.0.nama', 'Bu Siti')
            ->assertJsonPath('data.0.jumlah_produk', 1);

        $this->assertStringNotContainsString('0812-7777-6666', $response->getContent());
        $this->assertStringNotContainsString('kontak_internal', $response->getContent());
    }

    public function test_farmer_detail_lists_active_products_only(): void
    {
        $farmer = Farmer::factory()->create(['kontak_internal' => '0812-5555-4444']);

        Product::factory()->create(['farmer_id' => $farmer->id, 'slug' => 'pisang-kepok']);
        Product::factory()->tidakAktif()->create(['farmer_id' => $farmer->id, 'slug' => 'semangka']);

        $response = $this->getJson('/api/farmers/'.$farmer->id);

        $response->assertOk()
            ->assertJsonCount(1, 'data.produk')
            ->assertJsonPath('data.produk.0.slug', 'pisang-kepok')
            ->assertJsonPath('data.jumlah_produk', 1);

        $this->assertStringNotContainsString('0812-5555-4444', $response->getContent());
    }

    public function test_page_can_be_opened_by_slug(): void
    {
        Page::query()->create([
            'slug' => 'profil-desa',
            'judul' => 'Profil Desa',
            'isi' => '<p>Desa Banjar Agung</p>',
        ]);

        $this->getJson('/api/pages/profil-desa')
            ->assertOk()
            ->assertJsonPath('data.judul', 'Profil Desa')
            ->assertJsonPath('data.isi', '<p>Desa Banjar Agung</p>');
    }

    public function test_unknown_page_returns_not_found(): void
    {
        $this->getJson('/api/pages/tidak-ada')
            ->assertNotFound()
            ->assertJsonPath('message', 'Data yang diminta tidak ditemukan.');
    }

    public function test_public_settings_expose_village_and_whatsapp_info(): void
    {
        SiteSetting::query()->create([
            'nama_desa' => 'Desa Banjar Agung',
            'tagline' => 'Katalog hasil pertanian warga',
            'nomor_whatsapp' => '6281234567890',
            'template_pesan' => 'Halo Admin',
            'logo' => null,
            'media_sosial' => ['facebook' => null],
        ]);

        $this->getJson('/api/settings/public')
            ->assertOk()
            ->assertJsonPath('data.nama_desa', 'Desa Banjar Agung')
            ->assertJsonPath('data.nomor_whatsapp', '6281234567890')
            ->assertJsonPath('data.logo', null)
            ->assertJsonPath('data.media_sosial.facebook', null);
    }

    public function test_public_settings_returns_not_found_when_missing(): void
    {
        $this->getJson('/api/settings/public')
            ->assertNotFound()
            ->assertJsonPath('message', 'Pengaturan situs belum tersedia.');
    }
}
