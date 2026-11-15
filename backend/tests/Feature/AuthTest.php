<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin Desa',
            'email' => 'admin@banjaragung.desa.id',
            'password' => 'Admin12345!',
        ]);

        $response = $this->stateful()->postJson('/api/login', [
            'email' => 'admin@banjaragung.desa.id',
            'password' => 'Admin12345!',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Login berhasil.')
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonStructure([
                'message',
                'data' => ['id', 'name', 'email', 'created_at'],
            ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@banjaragung.desa.id',
            'password' => 'Admin12345!',
        ]);

        $this->stateful()
            ->postJson('/api/login', [
                'email' => 'admin@banjaragung.desa.id',
                'password' => 'kata-sandi-salah',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_login_requires_email_and_password(): void
    {
        $this->stateful()
            ->postJson('/api/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_is_rate_limited_after_five_attempts(): void
    {
        User::factory()->create([
            'email' => 'admin@banjaragung.desa.id',
            'password' => 'Admin12345!',
        ]);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->stateful()
                ->postJson('/api/login', [
                    'email' => 'admin@banjaragung.desa.id',
                    'password' => 'kata-sandi-salah',
                ])
                ->assertUnprocessable();
        }

        $this->stateful()
            ->postJson('/api/login', [
                'email' => 'admin@banjaragung.desa.id',
                'password' => 'kata-sandi-salah',
            ])
            ->assertTooManyRequests()
            ->assertJsonStructure(['message']);
    }

    public function test_protected_admin_route_returns_401_without_session(): void
    {
        $this->getJson('/api/admin/me')
            ->assertUnauthorized()
            ->assertJsonPath(
                'message',
                'Sesi tidak valid atau sudah berakhir. Silakan login kembali.',
            );
    }

    public function test_authenticated_admin_can_get_their_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/admin/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_admin_can_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user);

        $this->stateful()
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logout berhasil.');

        $this->assertGuest('web');
    }

    private function stateful(): static
    {
        return $this->withHeader('Origin', 'http://localhost:5173');
    }
}
