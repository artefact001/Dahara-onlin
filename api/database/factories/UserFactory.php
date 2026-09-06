<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = \App\Models\User::class;

    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'referral_code' => strtoupper(Str::random(6)),
            'is_teacher' => false,
        ];
    }

    public function teacher(): static
    {
        return $this->state(fn () => ['is_teacher' => true]);
    }
}
