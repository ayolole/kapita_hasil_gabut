<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Farmer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCategoryFarmerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_admin_can_create_a_category_with_generated_slug(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/categories', ['nama' => 'Umbi & Palawija'])
            ->assertCreated()
            ->assertJsonPath('message', 'Kategori berhasil ditambahkan.')
            ->assertJsonPath('data.nama', 'Umbi & Palawija')
            ->assertJsonPath('data.slug', 'umbi-palawija');

        $this->assertDatabaseHas('categories', ['slug' => 'umbi-palawija']);
        $this->assertDatabaseHas('activity_logs', ['aksi' => 'tambah', 'subject_type' => Category::class]);
    }

    public function test_category_slug_must_be_unique(): void
    {
        Category::factory()->create(['slug' => 'sayur']);

        $this->actingAs($this->admin)
            ->postJson('/api/admin/categories', ['nama' => 'Sayur', 'slug' => 'sayur'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');
    }

    public function test_admin_can_update_a_category(): void
    {
        $category = Category::factory()->create(['nama' => 'Sayur', 'slug' => 'sayur']);

        $this->actingAs($this->admin)
            ->putJson('/api/admin/categories/'.$category->id, ['nama' => 'Sayuran'])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Sayuran')
            ->assertJsonPath('data.slug', 'sayur');

        $this->assertDatabaseHas('activity_logs', ['aksi' => 'ubah', 'subject_id' => $category->id]);
    }

    public function test_category_in_use_cannot_be_deleted(): void
    {
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/categories/'.$category->id)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('kategori');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_admin_can_delete_an_unused_category(): void
    {
        $category = Category::factory()->create(['nama' => 'Buah']);

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/categories/'.$category->id)
            ->assertOk()
            ->assertJsonPath('message', 'Kategori berhasil dihapus.');

        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        $this->assertDatabaseHas('activity_logs', ['aksi' => 'hapus', 'subject_id' => $category->id]);
    }

    public function test_category_list_includes_product_count(): void
    {
        $category = Category::factory()->create(['nama' => 'Sayur', 'slug' => 'sayur']);
        Product::factory()->count(2)->create(['category_id' => $category->id]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/categories')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'sayur')
            ->assertJsonPath('data.0.jumlah_produk', 2);
    }

    public function test_admin_can_create_a_farmer_with_internal_contact_and_photo(): void
    {
        Storage::fake('public');

        $response = $this->actingAs($this->admin)
            ->post('/api/admin/farmers', [
                'nama' => 'Pak Slamet',
                'kelompok' => 'Kelompok Tani Sido Makmur',
                'lokasi_lahan' => 'Dusun 3, Desa Banjar Agung',
                'kontak_internal' => '0812-3456-7890',
                'cerita' => 'Petani pisang sejak 1998.',
                'foto' => UploadedFile::fake()->image('petani.jpg', 1800, 1200),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('message', 'Petani berhasil ditambahkan.')
            ->assertJsonPath('data.nama', 'Pak Slamet')
            ->assertJsonPath('data.kontak_internal', '0812-3456-7890');

        $farmer = Farmer::query()->firstOrFail();

        $this->assertNotNull($farmer->foto);
        Storage::disk('public')->assertExists($farmer->foto);
        $this->assertStringStartsWith('farmers/', $farmer->foto);

        $this->assertDatabaseHas('activity_logs', ['aksi' => 'tambah', 'subject_type' => Farmer::class]);
    }

    public function test_farmer_list_is_paginated_and_searchable(): void
    {
        Farmer::factory()->create(['nama' => 'Pak Slamet']);
        Farmer::factory()->create(['nama' => 'Bu Siti']);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/farmers?search=slamet')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nama', 'Pak Slamet')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_farmer_detail_lists_all_products(): void
    {
        $farmer = Farmer::factory()->create(['kontak_internal' => '0812-0000-0000']);

        Product::factory()->create(['farmer_id' => $farmer->id, 'nama' => 'Pisang']);
        Product::factory()->tidakAktif()->create(['farmer_id' => $farmer->id, 'nama' => 'Semangka']);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/farmers/'.$farmer->id)
            ->assertOk()
            ->assertJsonCount(2, 'data.produk')
            ->assertJsonPath('data.kontak_internal', '0812-0000-0000');
    }

    public function test_admin_can_update_and_remove_farmer_photo(): void
    {
        Storage::fake('public');

        $farmer = Farmer::factory()->create([
            'nama' => 'Pak Slamet',
            'foto' => 'farmers/lama.jpg',
        ]);

        Storage::disk('public')->put('farmers/lama.jpg', 'foto-lama');

        $this->actingAs($this->admin)
            ->put('/api/admin/farmers/'.$farmer->id, [
                'nama' => 'Pak Slamet Riyadi',
                'hapus_foto' => true,
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.nama', 'Pak Slamet Riyadi')
            ->assertJsonPath('data.foto', null);

        Storage::disk('public')->assertMissing('farmers/lama.jpg');
    }

    public function test_farmer_with_products_cannot_be_deleted(): void
    {
        $farmer = Farmer::factory()->create();
        Product::factory()->create(['farmer_id' => $farmer->id]);

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/farmers/'.$farmer->id)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('petani');
    }

    public function test_admin_can_delete_an_unused_farmer(): void
    {
        $farmer = Farmer::factory()->create(['nama' => 'Pak Wagiman']);

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/farmers/'.$farmer->id)
            ->assertOk()
            ->assertJsonPath('message', 'Petani berhasil dihapus.');

        $this->assertDatabaseMissing('farmers', ['id' => $farmer->id]);
        $this->assertDatabaseHas('activity_logs', ['aksi' => 'hapus', 'subject_id' => $farmer->id]);
    }
}
