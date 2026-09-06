<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\TeacherProfile;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // GET /api/bookings - réservations de l'utilisateur connecté (élève ou professeur)
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->teacherProfile) {
            $bookings = Booking::where('teacher_profile_id', $user->teacherProfile->id)
                ->with('student:id,full_name')
                ->orderByDesc('scheduled_at')
                ->get();
        } else {
            $bookings = $user->bookingsAsStudent()
                ->with('teacherProfile.user:id,full_name')
                ->orderByDesc('scheduled_at')
                ->get();
        }

        return response()->json($bookings);
    }

    // POST /api/bookings
    public function store(Request $request)
    {
        $data = $request->validate([
            'teacher_profile_id' => 'required|exists:teacher_profiles,id',
            'availability_slot_id' => 'nullable|exists:availability_slots,id',
            'subject' => 'required|string|max:255',
            'scheduled_at' => 'required|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:180',
        ]);

        $teacher = TeacherProfile::findOrFail($data['teacher_profile_id']);

        if (! empty($data['availability_slot_id'])) {
            $slot = AvailabilitySlot::where('id', $data['availability_slot_id'])
                ->where('teacher_profile_id', $teacher->id)
                ->where('is_active', true)
                ->firstOrFail();

            $alreadyBooked = Booking::where('availability_slot_id', $slot->id)
                ->whereDate('scheduled_at', $data['scheduled_at'])
                ->whereIn('status', ['en_attente', 'confirmee'])
                ->exists();

            abort_if($alreadyBooked, 409, 'Ce créneau est déjà réservé.');
        }

        $booking = Booking::create([
            'student_id' => $request->user()->id,
            'teacher_profile_id' => $teacher->id,
            'availability_slot_id' => $data['availability_slot_id'] ?? null,
            'subject' => $data['subject'],
            'scheduled_at' => $data['scheduled_at'],
            'duration_minutes' => $data['duration_minutes'] ?? $teacher->session_minutes,
            'price_fcfa' => $teacher->price_fcfa,
            'status' => 'en_attente',
            'payment_status' => 'non_paye',
        ]);

        return response()->json($booking->load('teacherProfile.user:id,full_name'), 201);
    }

    // PATCH /api/bookings/{booking} - annulation ou confirmation
    public function update(Request $request, Booking $booking)
    {
        $user = $request->user();
        $isStudent = $booking->student_id === $user->id;
        $isTeacher = $user->teacherProfile && $booking->teacher_profile_id === $user->teacherProfile->id;

        abort_unless($isStudent || $isTeacher, 403);

        $data = $request->validate([
            'status' => 'required|in:confirmee,annulee,terminee',
        ]);

        // Seul le professeur peut confirmer/terminer ; élève et professeur peuvent annuler.
        if (in_array($data['status'], ['confirmee', 'terminee']) && ! $isTeacher) {
            abort(403, 'Seul le professeur peut confirmer ou terminer une séance.');
        }

        $booking->update($data);

        return response()->json($booking->fresh());
    }
}
