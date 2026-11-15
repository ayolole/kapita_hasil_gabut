<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminContentTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_admin_can_view_settings(): void
    {
        $this->createSettings();

        $this->actingAs($this->admin)
            ->getJson('/api/admin/settings')
            ->assertOk()
            ->assertJsonPath('data.nama_desa', 'Desa Banjar Agung')
            ->assertJsonPath('data.nomor_whatsapp', '6281234567890');
    }

    public function test_settings_returns_not_found_when_missing(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/admin/settings')
            ->assertNotFound();
    }

    public function test_admin_can_update_settings(): void
    {
        $this->createSettings();

        $this->actingAs($this->admin)
            ->putJson('/api/admin/settings', [
                'nama_desa' => 'Desa Banjar Agung Baru',
                'tagline' => 'Tagline baru',
                'nomor_whatsapp' => '0812-9999-8888',
                'template_pesan' => 'Halo admin, kode {kode_ref}',
                'media_sosial' => [
                    'facebook' => 'https://facebook.com/desa',
                    'instagram' => '',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Pengaturan situs berhasil disimpan.')
            ->assertJsonPath('data.nama_desa', 'Desa Banjar Agung Baru')
            ->assertJsonPath('data.media_sosial.facebook', 'https://facebook.com/desa')
            ->assertJsonMissingPath('data.media_sosial.instagram');

        $this->assertDatabaseHas('activity_logs', ['aksi' => 'ubah', 'subject_type' => SiteSetting::class]);
    }

    public function test_admin_can_upload_and_remove_the_village_logo(): void
    {
        Storage::fake('public');

        $this->createSettings();

        $this->actingAs($this->admin)
            ->post('/api/admin/settings', [
                '_method' => 'PUT',
                'nama_desa' => 'Desa Banjar Agung',
                'nomor_whatsapp' => '6281234567890',
                'template_pesan' => 'Halo admin',
                'logo' => UploadedFile::fake()->image('logo.png', 800, 800),
            ], ['Accept' => 'application/json'])
            ->assertOk();

        $settings = SiteSetting::query()->firstOrFail();
        $this->assertNotNull($settings->logo);
        Storage::disk('public')->assertExists($settings->logo);

        $logoPath = $settings->logo;

        $this->actingAs($this->admin)
            ->putJson('/api/admin/settings', [
                'nama_desa' => 'Desa Banjar Agung',
                'nomor_whatsapp' => '6281234567890',
                'template_pesan' => 'Halo admin',
                'hapus_logo' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.logo', null);

        Storage::disk('public')->assertMissing($logoPath);
    }

    public function test_settings_validation_rejects_invalid_whatsapp_number(): void
    {
        $this->createSettings();

        $this->actingAs($this->admin)
            ->putJson('/api/admin/settings', [
                'nama_desa' => 'Desa Banjar Agung',
                'nomor_whatsapp' => 'bukan-nomor',
                'template_pesan' => 'Halo',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('nomor_whatsapp');
    }

    public function test_admin_can_manage_pages(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/pages', [
                'judul' => 'Potensi Desa',
                'isi' => '<p>Potensi pertanian desa.</p>',
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'potensi-desa');

        $page = Page::query()->firstOrFail();

        $this->actingAs($this->admin)
            ->getJson('/api/admin/pages')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($this->admin)
            ->putJson('/api/admin/pages/'.$page->id, [
                'judul' => 'Potensi Pertanian Desa',
                'isi' => '<p>Diperbarui.</p>',
            ])
            ->assertOk()
            ->assertJsonPath('data.judul', 'Potensi Pertanian Desa')
            ->assertJsonPath('data.slug', 'potensi-desa');

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/pages/'.$page->id)
            ->assertOk()
            ->assertJsonPath('message', 'Halaman berhasil dihapus.');

        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
        $this->assertDatabaseHas('activity_logs', ['aksi' => 'hapus', 'subject_id' => $page->id]);
    }

    public function test_page_slug_must_be_unique(): void
    {
        Page::query()->create(['slug' => 'profil-desa', 'judul' => 'Profil Desa', 'isi' => 'Isi']);

        $this->actingAs($this->admin)
            ->postJson('/api/admin/pages', [
                'slug' => 'profil-desa',
                'judul' => 'Profil Desa Baru',
                'isi' => 'Isi baru',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('slug');
    }

    private function createSettings(): SiteSetting
    {
        return SiteSetting::query()->create([
            'nama_desa' => 'Desa Banjar Agung',
            'tagline' => 'Katalog hasil pertanian warga',
            'nomor_whatsapp' => '6281234567890',
            'template_pesan' => 'Halo Admin, kode {kode_ref}',
            'logo' => null,
            'media_sosial' => null,
        ]);
    }
}
