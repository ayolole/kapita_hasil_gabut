<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\SiteSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->createSettings();
    }

    public function test_lead_is_stored_with_reference_and_whatsapp_draft(): void
    {
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
            ->assertJsonPath('data.kebutuhan', '2 kg untuk acara keluarga')
            ->assertJsonPath('data.status.value', 'baru')
            ->assertJsonPath('data.produk.slug', 'pisang-kepok')
            ->assertJsonPath('whatsapp.nomor', '6281234567890');

        $pesan = (string) $response->json('whatsapp.pesan');

        $this->assertStringContainsString('LD-000001', $pesan);
        $this->assertStringContainsString('Pisang Kepok', $pesan);
        $this->assertStringContainsString('2 kg untuk acara keluarga', $pesan);
        $this->assertStringContainsString('Budi Santoso', $pesan);
        $this->assertStringContainsString('Antar sore hari', $pesan);
        $this->assertStringStartsWith(
            'https://wa.me/6281234567890?text=',
            (string) $response->json('whatsapp.url'),
        );

        $this->assertDatabaseHas('leads', [
            'product_id' => $product->id,
            'nama_pembeli' => 'Budi Santoso',
            'kebutuhan' => '2 kg untuk acara keluarga',
            'status' => 'baru',
        ]);
    }

    public function test_empty_note_is_replaced_with_dash(): void
    {
        Product::factory()->create([
            'slug' => 'pisang-kepok',
            'satuan' => 'kg',
        ]);

        $response = $this->postJson('/api/leads', [
            'product_slug' => 'pisang-kepok',
            'nama_pembeli' => 'Sari',
            'kebutuhan' => '1 ikat',
        ]);

        $response->assertCreated();

        $this->assertStringContainsString('Catatan: -', (string) $response->json('whatsapp.pesan'));
    }

    public function test_references_increment_for_each_lead(): void
    {
        Product::factory()->create(['slug' => 'pisang-kepok']);

        $first = $this->postJson('/api/leads', [
            'product_slug' => 'pisang-kepok',
            'nama_pembeli' => 'Budi',
            'kebutuhan' => '2 kg',
        ])->assertCreated()->json('data.kode_ref');

        $second = $this->postJson('/api/leads', [
            'product_slug' => 'pisang-kepok',
            'nama_pembeli' => 'Sari',
            'kebutuhan' => '3 kg',
        ])->assertCreated()->json('data.kode_ref');

        $this->assertSame('LD-000001', $first);
        $this->assertSame('LD-000002', $second);
    }

    public function test_lead_requires_product_need_and_buyer_name(): void
    {
        $this->postJson('/api/leads', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['product_slug', 'nama_pembeli', 'kebutuhan']);
    }

    public function test_quantity_is_optional_and_defaults_to_one(): void
    {
        Product::factory()->create(['slug' => 'pisang-kepok']);

        $this->postJson('/api/leads', [
            'product_slug' => 'pisang-kepok',
            'nama_pembeli' => 'Budi',
            'kebutuhan' => '2 kg',
        ])->assertCreated();

        $this->assertDatabaseHas('leads', ['jumlah' => 1]);
    }

    public function test_lead_rejects_inactive_product(): void
    {
        Product::factory()->tidakAktif()->create(['slug' => 'semangka-inul']);

        $this->postJson('/api/leads', [
            'product_slug' => 'semangka-inul',
            'nama_pembeli' => 'Budi',
            'kebutuhan' => '1 buah',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('product_slug');
    }

    public function test_lead_endpoint_is_rate_limited(): void
    {
        Product::factory()->create(['slug' => 'pisang-kepok']);

        for ($attempt = 1; $attempt <= 10; $attempt++) {
            $this->postJson('/api/leads', [
                'product_slug' => 'pisang-kepok',
                'nama_pembeli' => 'Budi',
                'kebutuhan' => '2 kg',
            ])->assertCreated();
        }

        $this->postJson('/api/leads', [
            'product_slug' => 'pisang-kepok',
            'nama_pembeli' => 'Budi',
            'kebutuhan' => '2 kg',
        ])
            ->assertTooManyRequests()
            ->assertJsonStructure(['message']);
    }

    private function createSettings(): SiteSetting
    {
        return SiteSetting::query()->create([
            'nama_desa' => 'Desa Banjar Agung',
            'tagline' => 'Tagline desa',
            'nomor_whatsapp' => '0812-3456-7890',
            'template_pesan' => implode("\n", [
                'Halo Admin,',
                'Kode: {kode_ref}',
                'Produk: {nama_produk}',
                'Kebutuhan: {kebutuhan}',
                'Nama: {nama_pembeli}',
                'Catatan: {catatan}',
            ]),
            'logo' => null,
            'media_sosial' => null,
        ]);
    }
}
