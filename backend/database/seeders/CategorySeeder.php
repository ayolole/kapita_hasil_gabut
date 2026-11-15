<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['nama' => 'Sayur', 'slug' => 'sayur'],
            ['nama' => 'Buah', 'slug' => 'buah'],
            ['nama' => 'Umbi & Palawija', 'slug' => 'umbi-palawija'],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                ['nama' => $category['nama']],
            );
        }
    }
}
