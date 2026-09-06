<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherProfileFactory extends Factory
{
    protected $model = \App\Models\TeacherProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->teacher(),
            'slug' => fake()->unique()->slug(),
            'full_name' => fake()->name(),
            'headline' => fake()->sentence(4),
            'bio' => fake()->paragraph(),
            'city' => 'Dakar',
            'subjects' => ['Coran', 'Tajwid'],
            'languages' => ['Wolof', 'Français'],
            'hourly_price' => 5000,
            'session_minutes' => 45,
            'rating' => 5.0,
            'status' => 'valide',
        ];
    }
}
