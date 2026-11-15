<?php

namespace Tests\Feature;

use App\Enums\LeadStatus;
use App\Enums\ProductAvailability;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Farmer;
use App\Models\Lead;
use App\Models\PageView;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_admin_can_view_catalog_statistics(): void
    {
        $category = Category::factory()->create();
        $farmer = Farmer::factory()->create();

        $tersedia = Product::factory()->create([
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
            'status_ketersediaan' => ProductAvailability::Tersedia,
        ]);
        Product::factory()->tidakAktif()->create([
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
            'status_ketersediaan' => ProductAvailability::Habis,
        ]);
        $deleted = Product::factory()->create([
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
        ]);
        $deleted->delete();

        Lead::factory()->create(['product_id' => $tersedia->id, 'status' => LeadStatus::Baru]);
        Lead::factory()->create(['product_id' => $tersedia->id, 'status' => LeadStatus::Selesai]);

        PageView::query()->create(['path' => '/']);
        PageView::query()->create([
            'path' => '/hasil-tani/'.$tersedia->slug,
            'product_id' => $tersedia->id,
        ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('data.produk.total', 3)
            ->assertJsonPath('data.produk.aktif', 1)
            ->assertJsonPath('data.produk.nonaktif', 1)
            ->assertJsonPath('data.produk.habis', 1)
            ->assertJsonPath('data.kategori', 1)
            ->assertJsonPath('data.petani', 1)
            ->assertJsonPath('data.leads.total', 2)
            ->assertJsonPath('data.leads.baru', 1)
            ->assertJsonPath('data.leads.selesai', 1)
            ->assertJsonPath('data.kunjungan.total', 2)
            ->assertJsonPath('data.kunjungan.bulan_ini', 2)
            ->assertJsonMissingPath('data.kunjungan.qr')
            ->assertJsonPath('data.produk_terpopuler.0.id', $tersedia->id)
            ->assertJsonPath('data.produk_terpopuler.0.jumlah_kunjungan', 1);
    }

    public function test_admin_can_filter_activity_logs(): void
    {
        ActivityLog::query()->create([
            'user_id' => $this->admin->id,
            'aksi' => 'tambah',
            'deskripsi' => 'Menambahkan produk Pisang.',
            'ip_address' => '127.0.0.1',
        ]);
        ActivityLog::query()->create([
            'user_id' => $this->admin->id,
            'aksi' => 'hapus',
            'deskripsi' => 'Menghapus kategori Buah.',
            'ip_address' => '127.0.0.1',
        ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/activity-logs')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'aksi',
                    'deskripsi',
                    'subjek',
                    'pengguna' => ['id', 'name'],
                    'ip_address',
                    'dibuat_pada',
                ]],
                'meta',
            ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/activity-logs?aksi=tambah')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.aksi', 'tambah');

        $this->actingAs($this->admin)
            ->getJson('/api/admin/activity-logs?search=kategori')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.aksi', 'hapus');

        $this->actingAs($this->admin)
            ->getJson('/api/admin/activity-logs?aksi=ngawur')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('aksi');
    }

    public function test_admin_can_view_a_single_activity_log(): void
    {
        $log = ActivityLog::query()->create([
            'user_id' => $this->admin->id,
            'aksi' => 'ubah',
            'deskripsi' => 'Mengubah produk Pisang.',
        ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/activity-logs/'.$log->id)
            ->assertOk()
            ->assertJsonPath('data.id', $log->id)
            ->assertJsonPath('data.pengguna.id', $this->admin->id);
    }

    public function test_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/admin/stats')->assertUnauthorized();
        $this->getJson('/api/admin/activity-logs')->assertUnauthorized();
    }
}
