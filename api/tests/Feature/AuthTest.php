<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'full_name' => 'Fatou Diop',
            'email' => 'fatou@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()->assertJsonStructure(['user', 'token']);
        $this->assertDatabaseHas('users', ['email' => 'fatou@example.com']);
        // Le rôle par défaut et les données de départ (parcours, objectifs...) doivent être créés.
        $this->assertDatabaseHas('user_roles', ['role' => 'eleve']);
        $this->assertDatabaseCount('goals', 2);
    }

    public function test_registration_generates_a_unique_referral_code(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user->referral_code);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'a@example.com', 'password' => bcrypt('correct-password')]);

        $this->postJson('/api/auth/login', ['email' => 'a@example.com', 'password' => 'wrong'])
            ->assertStatus(401);
    }

    public function test_login_with_2fa_enabled_requires_a_challenge(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);
        $user->update(['two_factor_secret' => encrypt('SECRETSECRETSECRET'), 'two_factor_confirmed_at' => now()]);

        $response = $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'password123']);

        $response->assertOk()->assertJson(['requires_2fa' => true]);
        $response->assertJsonMissing(['token' => true]);
    }
}
