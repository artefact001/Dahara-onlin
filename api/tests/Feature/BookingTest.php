<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_a_booking(): void
    {
        $teacher = TeacherProfile::factory()->create();

        $this->postJson('/api/bookings', [
            'teacher_profile_id' => $teacher->id,
            'subject' => 'Coran',
            'starts_at' => now()->addDay()->toDateTimeString(),
        ])->assertStatus(401);
    }

    public function test_a_students_very_first_booking_is_a_free_trial(): void
    {
        $student = User::factory()->create();
        $teacher = TeacherProfile::factory()->create(['hourly_price' => 6000]);

        $response = $this->actingAs($student)->postJson('/api/bookings', [
            'teacher_profile_id' => $teacher->id,
            'subject' => 'Coran',
            'starts_at' => now()->addDay()->toDateTimeString(),
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('bookings', ['student_id' => $student->id, 'is_trial' => true, 'price' => 0]);
    }

    public function test_a_students_second_booking_is_paid_normally(): void
    {
        $student = User::factory()->create();
        $teacher = TeacherProfile::factory()->create(['hourly_price' => 6000]);

        Booking::factory()->create(['student_id' => $student->id, 'teacher_profile_id' => $teacher->id]);

        $response = $this->actingAs($student)->postJson('/api/bookings', [
            'teacher_profile_id' => $teacher->id,
            'subject' => 'Coran',
            'starts_at' => now()->addDays(2)->toDateTimeString(),
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('bookings', ['id' => $response->json('id'), 'is_trial' => false, 'price' => 6000]);
    }

    public function test_only_the_teacher_can_confirm_a_booking(): void
    {
        $booking = Booking::factory()->create();

        $this->actingAs($booking->student)->patchJson("/api/bookings/{$booking->id}", ['status' => 'confirmee'])
            ->assertStatus(403);
    }

    public function test_student_can_cancel_their_own_booking(): void
    {
        $booking = Booking::factory()->create();

        $this->actingAs($booking->student)->patchJson("/api/bookings/{$booking->id}", ['status' => 'annulee'])
            ->assertOk()
            ->assertJsonFragment(['status' => 'annulee']);
    }
}
