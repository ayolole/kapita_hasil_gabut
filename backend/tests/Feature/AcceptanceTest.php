<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Farmer;
use App\Models\Lead;
use App\Models\Product;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Uji penerimaan Fase 6: skenario wajib yang harus selalu lulus.
 */
class AcceptanceTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_ORIGIN = 'http://localhost:5173';

    public function test_login_succeeds_with_correct_credentials(): void
    {
        $admin = User::factory()->create([
            'email' => 'admin@banjaragung.desa.id',
            'password' => 'Admin12345!',
        ]);

        $this->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->postJson('/api/login', [
                'email' => 'admin@banjaragung.desa.id',
                'password' => 'Admin12345!',
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Login berhasil.')
            ->assertJsonPath('data.id', $admin->id)
            ->assertJsonPath('data.email', 'admin@banjaragung.desa.id');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@banjaragung.desa.id',
            'password' => 'Admin12345!',
        ]);

        $this->withHeader('Origin', self::FRONTEND_ORIGIN)
            ->postJson('/api/login', [
                'email' => 'admin@banjaragung.desa.id',
                'password' => 'kata-sandi-salah',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertGuest('web');
    }

    public function test_admin_routes_return_401_without_authentication(): void
    {
        $this->getJson('/api/admin/me')
            ->assertUnauthorized()
            ->assertJsonPath(
                'message',
                'Sesi tidak valid atau sudah berakhir. Silakan login kembali.',
            );

        $this->getJson('/api/admin/products')->assertUnauthorized();
        $this->getJson('/api/admin/stats')->assertUnauthorized();
        $this->getJson('/api/admin/leads')->assertUnauthorized();
        $this->postJson('/api/admin/products', [])->assertUnauthorized();

        // Permintaan tanpa header Accept JSON tetap mendapat 401 JSON, bukan error 500.
        $this->get('/api/admin/leads')
            ->assertUnauthorized()
            ->assertJsonPath(
                'message',
                'Sesi tidak valid atau sudah berakhir. Silakan login kembali.',
            );
    }

    public function test_admin_can_create_update_and_delete_a_product(): void
    {
        $admin = User::factory()->create();
        $category = Category::factory()->create(['nama' => 'Buah']);
        $farmer = Farmer::factory()->create(['nama' => 'Pak Sukardi']);

        $product = $this->actingAs($admin)
            ->postJson('/api/admin/products', [
                'nama' => 'Pisang Kepok',
                'category_id' => $category->id,
                'farmer_id' => $farmer->id,
                'deskripsi' => 'Pisang matang pohon.',
                'satuan' => 'kg',
                'status_ketersediaan' => 'tersedia',
                'stok' => 20,
                'aktif' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('message', 'Produk berhasil ditambahkan.')
            ->assertJsonPath('data.nama', 'Pisang Kepok')
            ->assertJsonPath('data.slug', 'pisang-kepok')
            ->json('data');

        $this->assertDatabaseHas('products', [
            'id' => $product['id'],
            'nama' => 'Pisang Kepok',
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
        ]);

        $this->actingAs($admin)
            ->putJson('/api/admin/products/'.$product['id'], [
                'nama' => 'Pisang Kepok Super',
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Produk berhasil diperbarui.')
            ->assertJsonPath('data.nama', 'Pisang Kepok Super');

        $this->assertDatabaseHas('products', [
            'id' => $product['id'],
            'nama' => 'Pisang Kepok Super',
        ]);

        $this->actingAs($admin)
            ->deleteJson('/api/admin/products/'.$product['id'])
            ->assertOk()
            ->assertJsonPath('message', 'Produk berhasil dihapus.');

        $this->assertSoftDeleted('products', ['id' => $product['id']]);
        $this->assertDatabaseHas('activity_logs', [
            'aksi' => 'hapus',
            'subject_id' => $product['id'],
        ]);
    }

    public function test_price_fields_are_no_longer_accepted_or_exposed(): void
    {
        $admin = User::factory()->create();

        $product = $this->actingAs($admin)
            ->postJson('/api/admin/products', [
                'nama' => 'Produk Tanpa Harga',
                'category_id' => Category::factory()->create()->id,
                'farmer_id' => Farmer::factory()->create()->id,
                'satuan' => 'kg',
                'harga' => 8000,
            ])
            ->assertCreated()
            ->assertJsonMissingPath('data.harga')
            ->json('data');

        $this->assertNotNull($product['id']);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonMissingPath('data.0.harga');
    }

    public function test_invalid_file_upload_is_rejected(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($admin)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'foto' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('foto');

        $this->assertDatabaseCount('product_images', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_post_leads_creates_exactly_one_lead_with_reference_code(): void
    {
        SiteSetting::query()->create([
            'nama_desa' => 'Desa Banjar Agung',
            'tagline' => 'Tagline desa',
            'nomor_whatsapp' => '6281234567890',
            'template_pesan' => 'Halo Admin, kode {kode_ref} untuk {nama_produk} ({kebutuhan})',
            'logo' => null,
            'media_sosial' => null,
        ]);

        $product = Product::factory()->create([
            'nama' => 'Pisang Kepok',
            'slug' => 'pisang-kepok',
            'satuan' => 'kg',
            'aktif' => true,
        ]);

        $response = $this->postJson('/api/leads', [
            'product_slug' => 'pisang-kepok',
            'nama_pembeli' => 'Budi Santoso',
            'kebutuhan' => '2 kg untuk acara keluarga',
            'catatan' => 'Antar sore hari',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.kode_ref', 'LD-000001')
            ->assertJsonPath('data.nama_pembeli', 'Budi Santoso')
            ->assertJsonPath('data.produk.slug', 'pisang-kepok');

        $this->assertSame(1, Lead::query()->count());
        $this->assertDatabaseHas('leads', [
            'kode_ref' => 'LD-000001',
            'product_id' => $product->id,
            'nama_pembeli' => 'Budi Santoso',
            'kebutuhan' => '2 kg untuk acara keluarga',
            'status' => 'baru',
        ]);
    }

    public function test_internal_contact_is_never_exposed_in_public_api(): void
    {
        $farmer = Farmer::factory()->create([
            'nama' => 'Pak Slamet',
            'kontak_internal' => '0812-9999-8888',
        ]);

        Product::factory()->create([
            'slug' => 'pisang-kepok',
            'nama' => 'Pisang Kepok',
            'farmer_id' => $farmer->id,
        ]);

        $endpoints = [
            '/api/products',
            '/api/products/pisang-kepok',
            '/api/farmers',
            '/api/farmers/'.$farmer->id,
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint)->assertOk();

            $this->assertStringNotContainsString('kontak_internal', $response->getContent(), $endpoint);
            $this->assertStringNotContainsString('0812-9999-8888', $response->getContent(), $endpoint);
        }
    }
}
