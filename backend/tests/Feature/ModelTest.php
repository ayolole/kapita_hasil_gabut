<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Farmer;
use App\Models\Lead;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_lead_reference_is_generated_in_expected_format(): void
    {
        $firstLead = Lead::factory()->create();
        $secondLead = Lead::factory()->create();

        $this->assertSame('LD-000001', $firstLead->kode_ref);
        $this->assertSame('LD-000002', $secondLead->kode_ref);
    }

    public function test_farmer_internal_contact_is_hidden_from_serialization(): void
    {
        $farmer = Farmer::factory()->create([
            'kontak_internal' => '0812-0000-0000',
        ]);

        $this->assertArrayNotHasKey('kontak_internal', $farmer->toArray());
    }

    public function test_product_relationships_are_configured(): void
    {
        $category = Category::factory()->create();
        $farmer = Farmer::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'farmer_id' => $farmer->id,
        ]);

        $this->assertTrue($product->category->is($category));
        $this->assertTrue($product->farmer->is($farmer));
        $this->assertCount(0, $product->images);
        $this->assertCount(0, $product->leads);
    }

    public function test_product_uses_soft_deletes(): void
    {
        $product = Product::factory()->create();

        $product->delete();

        $this->assertSoftDeleted($product);
        $this->assertNull(Product::query()->find($product->id));
        $this->assertNotNull(Product::withTrashed()->find($product->id));
    }
}
