<?php

namespace Tests\Feature;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_review_a_booking_that_is_not_completed(): void
    {
        $booking = Booking::factory()->create(['status' => 'confirmee']);

        $this->actingAs($booking->student)->postJson("/api/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertStatus(409);
    }

    public function test_can_review_a_completed_booking_exactly_once(): void
    {
        $booking = Booking::factory()->create(['status' => 'terminee']);

        $this->actingAs($booking->student)
            ->postJson("/api/bookings/{$booking->id}/review", ['rating' => 5, 'comment' => 'Excellent'])
            ->assertCreated();

        // Deuxième tentative : refusée.
        $this->actingAs($booking->student)
            ->postJson("/api/bookings/{$booking->id}/review", ['rating' => 4])
            ->assertStatus(409);

        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_someone_else_cannot_review_another_students_booking(): void
    {
        $booking = Booking::factory()->create(['status' => 'terminee']);
        $someoneElse = \App\Models\User::factory()->create();

        $this->actingAs($someoneElse)->postJson("/api/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertStatus(403);
    }
}
