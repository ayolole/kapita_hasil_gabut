<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminImageUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::factory()->create();
    }

    public function test_admin_can_upload_and_compress_a_product_photo(): void
    {
        $product = Product::factory()->create(['nama' => 'Pisang Kepok', 'slug' => 'pisang-kepok']);

        $this->actingAs($this->admin)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'foto' => UploadedFile::fake()->image('foto-pisang.jpg', 2000, 1200),
                'alt_text' => 'Pisang kepok segar',
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('message', 'Foto produk berhasil diunggah.')
            ->assertJsonPath('data.alt_text', 'Pisang kepok segar');

        $image = ProductImage::query()->firstOrFail();

        Storage::disk('public')->assertExists($image->path);
        $this->assertStringEndsWith('.jpg', $image->path);

        [$width, $height] = getimagesize(Storage::disk('public')->path($image->path));

        $this->assertSame(1600, $width);
        $this->assertSame(960, $height);

        $this->assertDatabaseHas('activity_logs', [
            'aksi' => 'tambah',
            'subject_id' => $product->id,
            'subject_type' => Product::class,
        ]);
    }

    public function test_uploaded_photo_keeps_small_images_unscaled(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'foto' => UploadedFile::fake()->image('kecil.png', 640, 480),
            ], ['Accept' => 'application/json'])
            ->assertCreated();

        $image = ProductImage::query()->firstOrFail();
        [$width, $height] = getimagesize(Storage::disk('public')->path($image->path));

        $this->assertSame(640, $width);
        $this->assertSame(480, $height);
    }

    public function test_upload_rejects_non_image_files(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)
            ->post('/api/admin/products/'.$product->id.'/images', [
                'foto' => UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('foto');

        $this->assertSame(0, ProductImage::query()->count());
    }

    public function test_upload_requires_a_photo(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)
            ->postJson('/api/admin/products/'.$product->id.'/images', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('foto');
    }

    public function test_admin_can_update_image_caption_and_order(): void
    {
        $product = Product::factory()->create();
        $image = $this->createImage($product, 'products/contoh.jpg');

        $this->actingAs($this->admin)
            ->patchJson('/api/admin/products/'.$product->id.'/images/'.$image->id, [
                'alt_text' => 'Foto baru',
                'urutan' => 3,
            ])
            ->assertOk()
            ->assertJsonPath('data.alt_text', 'Foto baru')
            ->assertJsonPath('data.urutan', 3);
    }

    public function test_admin_can_delete_an_image_and_the_file_is_removed(): void
    {
        $product = Product::factory()->create();
        $image = $this->createImage($product, 'products/hapus.jpg');

        Storage::disk('public')->put($image->path, 'isi-gambar');

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/products/'.$product->id.'/images/'.$image->id)
            ->assertOk()
            ->assertJsonPath('message', 'Foto produk berhasil dihapus.');

        $this->assertDatabaseMissing('product_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($image->path);

        $this->assertDatabaseHas('activity_logs', ['aksi' => 'hapus', 'subject_id' => $product->id]);
    }

    public function test_image_from_another_product_returns_not_found(): void
    {
        $productA = Product::factory()->create();
        $productB = Product::factory()->create();
        $image = $this->createImage($productB, 'products/lain.jpg');

        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/products/'.$productA->id.'/images/'.$image->id)
            ->assertNotFound();

        $this->assertDatabaseHas('product_images', ['id' => $image->id]);
    }

    private function createImage(Product $product, string $path): ProductImage
    {
        return ProductImage::query()->create([
            'product_id' => $product->id,
            'path' => $path,
            'alt_text' => 'Foto contoh',
            'urutan' => 1,
        ]);
    }
}
