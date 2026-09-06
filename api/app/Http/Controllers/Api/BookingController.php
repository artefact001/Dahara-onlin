<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvailabilitySlot;
use App\Models\Booking;
use App\Models\TeacherProfile;
use App\Services\GamificationService;
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
                ->orderByDesc('starts_at')
                ->get();
        } else {
            $bookings = $user->bookingsAsStudent()
                ->with('teacherProfile:id,slug,full_name,photo_path')
                ->orderByDesc('starts_at')
                ->get();
        }

        return response()->json($bookings);
    }

    // POST /api/bookings
    public function store(Request $request)
    {
        $data = $request->validate([
            'teacher_profile_id' => 'required|exists:teacher_profiles,id',
            'teacher_availability_id' => 'nullable|exists:teacher_availability,id',
            'subject' => 'required|string|max:255',
            'starts_at' => 'required|date|after:now',
            'duration_minutes' => 'nullable|integer|min:15|max:180',
        ]);

        $teacher = TeacherProfile::findOrFail($data['teacher_profile_id']);

        if (! empty($data['teacher_availability_id'])) {
            $slot = AvailabilitySlot::where('id', $data['teacher_availability_id'])
                ->where('teacher_profile_id', $teacher->id)
                ->where('is_active', true)
                ->firstOrFail();

            $alreadyBooked = Booking::where('teacher_availability_id', $slot->id)
                ->whereDate('starts_at', $data['starts_at'])
                ->whereIn('status', ['en_attente', 'confirmee'])
                ->exists();

            abort_if($alreadyBooked, 409, 'Ce créneau est déjà réservé.');
        }

        $booking = Booking::create([
            'student_id' => $request->user()->id,
            'teacher_profile_id' => $teacher->id,
            'teacher_availability_id' => $data['teacher_availability_id'] ?? null,
            'subject' => $data['subject'],
            'starts_at' => $data['starts_at'],
            'duration_minutes' => $data['duration_minutes'] ?? $teacher->session_minutes,
            'price' => $teacher->hourly_price,
            'status' => 'en_attente',
            'payment_status' => 'non_paye',
        ]);

        return response()->json($booking->load('teacherProfile:id,slug,full_name'), 201);
    }

    // PATCH /api/bookings/{booking} - annulation ou confirmation
    public function update(Request $request, Booking $booking, GamificationService $gamification)
    {
        $user = $request->user();
        $isStudent = $booking->student_id === $user->id;
        $isTeacher = $user->teacherProfile && $booking->teacher_profile_id === $user->teacherProfile->id;

        abort_unless($isStudent || $isTeacher, 403);

        $data = $request->validate([
            'status' => 'required|in:confirmee,annulee,terminee',
        ]);

        if (in_array($data['status'], ['confirmee', 'terminee']) && ! $isTeacher) {
            abort(403, 'Seul le professeur peut confirmer ou terminer une séance.');
        }

        $booking->update($data);

        if ($data['status'] === 'terminee') {
            $student = $booking->student;
            $isFirstCompleted = Booking::where('student_id', $student->id)->where('status', 'terminee')->count() === 1;

            $gamification->awardPoints($student, 30, 'Cours terminé');
            $gamification->recordActivity($student);

            if ($isFirstCompleted) {
                $gamification->awardBadge($student, 'premier_cours');
            }
        }

        return response()->json($booking->fresh());
    }

    // GET /api/bookings/{booking}/room - URL de la salle Jitsi (auth, participants uniquement)
    public function room(Request $request, Booking $booking)
    {
        $user = $request->user();
        $isStudent = $booking->student_id === $user->id;
        $isTeacher = $user->teacherProfile && $booking->teacher_profile_id === $user->teacherProfile->id;

        abort_unless($isStudent || $isTeacher, 403);
        abort_unless($booking->status === 'confirmee', 409, 'La séance doit être confirmée avant de rejoindre la salle.');

        return response()->json(['room_name' => $booking->room_name, 'jitsi_url' => $booking->jitsi_url]);
    }
}
