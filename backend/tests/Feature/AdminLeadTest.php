<?php

namespace Tests\Feature;

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminLeadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_admin_can_list_and_filter_leads(): void
    {
        $product = Product::factory()->create(['nama' => 'Pisang Kepok']);

        Lead::factory()->create([
            'product_id' => $product->id,
            'nama_pembeli' => 'Budi',
            'status' => LeadStatus::Baru,
        ]);
        Lead::factory()->create([
            'product_id' => $product->id,
            'nama_pembeli' => 'Sari',
            'status' => LeadStatus::Selesai,
        ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/leads')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'kode_ref',
                    'jumlah',
                    'nama_pembeli',
                    'kebutuhan',
                    'status' => ['value', 'label'],
                    'catatan_admin',
                    'produk' => ['id', 'nama', 'slug', 'satuan'],
                    'dibuat_pada',
                ]],
                'meta',
            ]);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/leads?status=selesai')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nama_pembeli', 'Sari');

        $this->actingAs($this->admin)
            ->getJson('/api/admin/leads?search=budi')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_view_a_lead(): void
    {
        $lead = Lead::factory()->create(['nama_pembeli' => 'Budi']);

        $this->actingAs($this->admin)
            ->getJson('/api/admin/leads/'.$lead->id)
            ->assertOk()
            ->assertJsonPath('data.kode_ref', $lead->kode_ref)
            ->assertJsonPath('data.nama_pembeli', 'Budi');
    }

    public function test_admin_can_update_lead_status_and_note(): void
    {
        $lead = Lead::factory()->create(['status' => LeadStatus::Baru]);

        $this->actingAs($this->admin)
            ->patchJson('/api/admin/leads/'.$lead->id, [
                'status' => 'dihubungi',
                'catatan_admin' => 'Sudah dihubungi via WhatsApp.',
            ])
            ->assertOk()
            ->assertJsonPath('message', 'Lead berhasil diperbarui.')
            ->assertJsonPath('data.status.value', 'dihubungi')
            ->assertJsonPath('data.catatan_admin', 'Sudah dihubungi via WhatsApp.');

        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'status' => 'dihubungi',
            'catatan_admin' => 'Sudah dihubungi via WhatsApp.',
        ]);
        $this->assertDatabaseHas('activity_logs', ['aksi' => 'ubah', 'subject_id' => $lead->id]);
    }

    public function test_lead_update_rejects_unknown_status(): void
    {
        $lead = Lead::factory()->create();

        $this->actingAs($this->admin)
            ->patchJson('/api/admin/leads/'.$lead->id, ['status' => 'ngawur'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_admin_can_export_leads_as_csv(): void
    {
        $product = Product::factory()->create([
            'nama' => 'Pisang Kepok',
            'satuan' => 'kg',
        ]);

        $lead = Lead::factory()->create([
            'product_id' => $product->id,
            'nama_pembeli' => 'Budi Santoso',
            'status' => LeadStatus::Baru,
            'catatan' => 'Antar sore',
        ]);

        $response = $this->actingAs($this->admin)->get('/api/admin/leads/export');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('attachment', (string) $response->headers->get('content-disposition'));

        $content = $response->streamedContent();

        $this->assertStringContainsString('Kode Referensi', $content);
        $this->assertStringContainsString($lead->kode_ref, $content);
        $this->assertStringContainsString('Budi Santoso', $content);
        $this->assertStringContainsString('Pisang Kepok', $content);
        $this->assertStringContainsString('Antar sore', $content);
    }

    public function test_csv_export_respects_status_filter(): void
    {
        Lead::factory()->create(['nama_pembeli' => 'Lead Baru', 'status' => LeadStatus::Baru]);
        Lead::factory()->create(['nama_pembeli' => 'Lead Selesai', 'status' => LeadStatus::Selesai]);

        $content = $this->actingAs($this->admin)
            ->get('/api/admin/leads/export?status=selesai')
            ->assertOk()
            ->streamedContent();

        $this->assertStringContainsString('Lead Selesai', $content);
        $this->assertStringNotContainsString('Lead Baru', $content);
    }
}
