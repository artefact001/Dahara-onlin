<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // GET /api/teachers/{slug}/reviews - public
    public function forTeacher(string $slug)
    {
        $reviews = Review::whereHas('teacherProfile', fn ($q) => $q->where('slug', $slug))
            ->with('student:id,full_name')
            ->latest()
            ->get();

        return response()->json($reviews);
    }

    // POST /api/bookings/{booking}/review (auth, élève de la réservation uniquement)
    public function store(Request $request, Booking $booking)
    {
        abort_unless($booking->student_id === $request->user()->id, 403);
        abort_unless($booking->status === 'terminee', 409, 'Vous ne pouvez noter une séance qu\'une fois celle-ci terminée.');
        abort_if(Review::where('booking_id', $booking->id)->exists(), 409, 'Cette séance a déjà été notée.');

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review = Review::create([
            'booking_id' => $booking->id,
            'student_id' => $booking->student_id,
            'teacher_profile_id' => $booking->teacher_profile_id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
        ]);

        $this->recomputeTeacherRating($booking->teacher_profile_id);

        return response()->json($review, 201);
    }

    private function recomputeTeacherRating(int $teacherProfileId): void
    {
        $stats = Review::where('teacher_profile_id', $teacherProfileId)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();

        \App\Models\TeacherProfile::where('id', $teacherProfileId)->update([
            'rating' => round($stats->avg_rating ?? 5, 1),
            'reviews_count' => $stats->count ?? 0,
        ]);
    }
}
