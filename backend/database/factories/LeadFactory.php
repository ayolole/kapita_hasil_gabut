<?php

namespace Database\Factories;

use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'jumlah' => 1,
            'nama_pembeli' => fake()->name(),
            'kebutuhan' => fake()->sentence(),
            'catatan' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(LeadStatus::cases()),
            'catatan_admin' => null,
        ];
    }
}
