<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;

class TeacherDashboardController extends Controller
{
    private function currentTeacherProfile(Request $request)
    {
        $profile = $request->user()->teacherProfile;
        abort_unless($profile, 403, "Cette section est réservée aux professeurs.");

        return $profile;
    }

    // GET /api/teacher/students - élèves distincts ayant réservé au moins une séance
    public function students(Request $request)
    {
        $teacher = $this->currentTeacherProfile($request);

        $studentIds = Booking::where('teacher_profile_id', $teacher->id)->distinct()->pluck('student_id');

        $students = User::whereIn('id', $studentIds)
            ->get(['id', 'full_name', 'email', 'city'])
            ->map(function (User $s) use ($teacher) {
                $s->sessions_count = Booking::where('teacher_profile_id', $teacher->id)
                    ->where('student_id', $s->id)->where('status', 'terminee')->count();
                $s->next_session_at = Booking::where('teacher_profile_id', $teacher->id)
                    ->where('student_id', $s->id)->where('status', 'confirmee')
                    ->where('starts_at', '>', now())->min('starts_at');

                return $s;
            });

        return response()->json($students);
    }

    // GET /api/teacher/planning?from=&to= - séances à venir/passées
    public function planning(Request $request)
    {
        $teacher = $this->currentTeacherProfile($request);

        $query = Booking::where('teacher_profile_id', $teacher->id)->with('student:id,full_name');

        if ($from = $request->query('from')) {
            $query->where('starts_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->where('starts_at', '<=', $to);
        }

        return response()->json($query->orderBy('starts_at')->get());
    }

    // GET /api/teacher/revenue - revenus (séances terminées), avec répartition mensuelle simple
    public function revenue(Request $request)
    {
        $teacher = $this->currentTeacherProfile($request);

        $completed = Booking::where('teacher_profile_id', $teacher->id)->where('status', 'terminee');

        $total = (clone $completed)->sum('price');
        $thisMonth = (clone $completed)->whereMonth('starts_at', now()->month)->whereYear('starts_at', now()->year)->sum('price');

        $byMonth = (clone $completed)
            ->selectRaw("DATE_FORMAT(starts_at, '%Y-%m') as month, SUM(price) as total")
            ->groupBy('month')->orderBy('month')->get();

        return response()->json([
            'total_lifetime' => $total,
            'this_month' => $thisMonth,
            'by_month' => $byMonth,
            'sessions_completed' => (clone $completed)->count(),
        ]);
    }
}
