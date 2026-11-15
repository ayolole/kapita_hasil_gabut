<?php

namespace Database\Factories;

use App\Enums\ProductAvailability;
use App\Models\Category;
use App\Models\Farmer;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nama = fake()->unique()->words(3, true);
        $status = fake()->randomElement(ProductAvailability::cases());

        return [
            'nama' => Str::title($nama),
            'slug' => Str::slug($nama),
            'category_id' => Category::factory(),
            'farmer_id' => Farmer::factory(),
            'deskripsi' => fake()->paragraph(),
            'spesifikasi' => fake()->sentence(),
            'satuan' => fake()->randomElement(['kg', 'ikat', 'buah']),
            'status_ketersediaan' => $status,
            'stok' => $status === ProductAvailability::Habis ? 0 : fake()->numberBetween(1, 200),
            'estimasi_panen' => $status === ProductAvailability::AkanPanen
                ? fake()->dateTimeBetween('now', '+2 months')
                : null,
            'aktif' => true,
        ];
    }

    public function tidakAktif(): static
    {
        return $this->state(fn (array $attributes) => [
            'aktif' => false,
        ]);
    }
}
