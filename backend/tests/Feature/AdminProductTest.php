<?php

namespace Tests\Feature;

use App\Enums\ProductAvailability;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Farmer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_admin_product_routes_require_authentication(): void
    {
        $this->getJson('/api/admin/products')->assertUnauthorized();
        $this->postJson('/api/admin/products', [])->assertUnauthorized();
    }

    public function test_admin_can_list_active_and_inactive_products(): void
    {
        Product::factory()->create(['nama' => 'Pisang Aktif', 'slug' => 'pisang-aktif']);
        Product::factory()->tidakAktif()->create(['nama' => 'Semangka Nonaktif', 'slug' => 'semangka-nonaktif']);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'nama',
                    'slug',
                    'satuan',
                    'status_ketersediaan' => ['value', 'label'],
                    'stok',
                    'aktif',
                    'jumlah_gambar',
                    'kategori' => ['id', 'nama', 'slug'],
                    'petani' => ['id', 'nama', 'kontak_internal'],
                ]],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_admin_product_list_can_be_filtered(): void
    {
        $sayur = Category::factory()->create(['nama' => 'Sayur', 'slug' => 'sayur']);

        Product::factory()->create([
            'nama' => 'Kangkung Segar',
            'slug' => 'kangkung-segar',
            'category_id' => $sayur->id,
            'status_ketersediaan' => ProductAvailability::Tersedia,
        ]);
        Product::factory()->tidakAktif()->create([
            'nama' => 'Bayam Hijau',
            'slug' => 'bayam-hijau',
            'category_id' => $sayur->id,
            'status_ketersediaan' => ProductAvailability::Habis,
        ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products?aktif=0')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'bayam-hijau');

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products?category=sayur&status=tersedia')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'kangkung-segar');

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products?search=kangkung')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_create_a_product_and_it_is_logged(): void
    {
        $category = Category::factory()->create();
        $farmer = Farmer::factory()->create();

        $response = $this->actingAs($this->admin)->postJson('/api/admin/products', [
            'nama' => 'Pisang Kepok',
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
            'deskripsi' => 'Pisang matang pohon.',
            'satuan' => 'kg',
            'status_ketersediaan' => 'tersedia',
            'stok' => 25,
            'aktif' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Produk berhasil ditambahkan.')
            ->assertJsonPath('data.nama', 'Pisang Kepok')
            ->assertJsonPath('data.slug', 'pisang-kepok');

        $this->assertDatabaseHas('products', [
            'nama' => 'Pisang Kepok',
            'slug' => 'pisang-kepok',
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'aksi' => 'tambah',
            'subject_type' => Product::class,
        ]);
    }

    public function test_product_slug_is_made_unique_automatically(): void
    {
        Product::factory()->create(['nama' => 'Pisang Kepok', 'slug' => 'pisang-kepok']);

        $this->actingAs($this->admin)->postJson('/api/admin/products', [
            'nama' => 'Pisang Kepok',
            'category_id' => Category::factory()->create()->id,
            'farmer_id' => Farmer::factory()->create()->id,
            'satuan' => 'kg',
        ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'pisang-kepok-2');
    }

    public function test_admin_product_creation_validates_required_fields(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/products', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nama', 'category_id', 'farmer_id', 'satuan']);
    }

    public function test_admin_can_update_a_product_and_it_is_logged(): void
    {
        $product = Product::factory()->create([
            'nama' => 'Pisang Lama',
            'slug' => 'pisang-lama',
        ]);

        $this->actingAs($this->admin)->putJson('/api/admin/products/'.$product->id, [
            'nama' => 'Pisang Baru',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Produk berhasil diperbarui.')
            ->assertJsonPath('data.nama', 'Pisang Baru')
            ->assertJsonPath('data.slug', 'pisang-lama');

        $this->assertDatabaseHas('activity_logs', [
            'aksi' => 'ubah',
            'subject_id' => $product->id,
            'subject_type' => Product::class,
        ]);
    }

    public function test_admin_can_soft_delete_and_restore_a_product(): void
    {
        $product = Product::factory()->create(['nama' => 'Pisang Kepok']);

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/products/'.$product->id)
            ->assertOk()
            ->assertJsonPath('message', 'Produk berhasil dihapus.');

        $this->assertSoftDeleted('products', ['id' => $product->id]);
        $this->assertDatabaseHas('activity_logs', ['aksi' => 'hapus', 'subject_id' => $product->id]);

        $this->getJson('/api/products/'.$product->slug)->assertNotFound();

        $this->actingAs($this->admin)
            ->postJson('/api/admin/products/'.$product->id.'/restore')
            ->assertOk()
            ->assertJsonPath('message', 'Produk berhasil dipulihkan.');

        $this->assertNotSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_deleted_products_can_be_listed_with_trashed_filter(): void
    {
        $product = Product::factory()->create();
        $product->delete();

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products?trashed=only')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $product->id);
    }

    public function test_admin_can_change_availability(): void
    {
        $product = Product::factory()->create([
            'status_ketersediaan' => ProductAvailability::Tersedia,
            'stok' => 20,
        ]);

        $this->actingAs($this->admin)->patchJson('/api/admin/products/'.$product->id.'/availability', [
            'status_ketersediaan' => 'habis',
        ])
            ->assertOk()
            ->assertJsonPath('data.status_ketersediaan.value', 'habis')
            ->assertJsonPath('data.stok', 0);

        $this->assertDatabaseHas('activity_logs', [
            'aksi' => 'ubah',
            'subject_id' => $product->id,
        ]);
    }

    public function test_price_change_endpoint_is_removed(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)
            ->patchJson('/api/admin/products/'.$product->id.'/price', ['harga' => 12000])
            ->assertNotFound();
    }

    public function test_price_history_endpoint_is_removed(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products/'.$product->id.'/price-histories')
            ->assertNotFound();
    }

    public function test_qr_code_endpoint_is_removed(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)
            ->getJson('/api/admin/products/'.$product->id.'/qr-code')
            ->assertNotFound();
    }

    public function test_activity_log_records_the_admin_and_ip_address(): void
    {
        Product::factory()->create();

        $this->actingAs($this->admin)->postJson('/api/admin/products', [
            'nama' => 'Jagung Manis',
            'category_id' => Category::factory()->create()->id,
            'farmer_id' => Farmer::factory()->create()->id,
            'satuan' => 'kg',
        ])->assertCreated();

        $log = ActivityLog::query()->where('aksi', 'tambah')->firstOrFail();

        $this->assertSame($this->admin->id, $log->user_id);
        $this->assertNotNull($log->ip_address);
        $this->assertStringContainsString('Jagung Manis', (string) $log->deskripsi);
    }
}
