<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_track_stores_visit_with_product(): void
    {
        $product = Product::factory()->create(['slug' => 'pisang-kepok']);

        $this->postJson('/api/track', [
            'path' => '/hasil-tani/pisang-kepok',
            'product_slug' => 'pisang-kepok',
        ])
            ->assertCreated()
            ->assertJsonPath('message', 'Kunjungan tercatat.');

        $this->assertDatabaseHas('page_views', [
            'path' => '/hasil-tani/pisang-kepok',
            'product_id' => $product->id,
        ]);
    }

    public function test_track_stores_visit_without_product(): void
    {
        $this->postJson('/api/track', ['path' => '/'])
            ->assertCreated();

        $this->assertDatabaseHas('page_views', [
            'path' => '/',
            'product_id' => null,
        ]);
    }

    public function test_track_requires_path(): void
    {
        $this->postJson('/api/track', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('path');
    }
}
