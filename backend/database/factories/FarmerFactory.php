<?php

namespace Database\Factories;

use App\Models\Farmer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Farmer>
 */
class FarmerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => fake()->name(),
            'kelompok' => 'Kelompok Tani '.fake()->words(2, true),
            'foto' => null,
            'cerita' => fake()->paragraph(),
            'lokasi_lahan' => 'Dusun '.fake()->numberBetween(1, 6).', Desa Banjar Agung',
            'kontak_internal' => fake()->numerify('08##########'),
        ];
    }
}
