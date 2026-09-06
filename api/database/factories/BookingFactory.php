<?php

namespace Database\Factories;

use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = \App\Models\Booking::class;

    public function definition(): array
    {
        return [
            'student_id' => User::factory(),
            'teacher_profile_id' => TeacherProfile::factory(),
            'subject' => 'Coran',
            'starts_at' => now()->addDay(),
            'duration_minutes' => 45,
            'price' => 5000,
            'status' => 'en_attente',
            'payment_status' => 'non_paye',
        ];
    }
}
