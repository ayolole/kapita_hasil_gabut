<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@banjaragung.desa.id')],
            [
                'name' => env('ADMIN_NAME', 'Admin Desa Banjar Agung'),
                'password' => env('ADMIN_PASSWORD', 'Admin12345!'),
            ],
        );
    }
}
