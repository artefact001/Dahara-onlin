<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\TeacherApplication;
use App\Models\User;

class AdminStatsController extends Controller
{
    // GET /api/admin/stats
    public function index()
    {
        $now = now();

        return response()->json([
            'users_total' => User::count(),
            'teachers_pending' => \App\Models\TeacherProfile::where('status', 'en_attente')->count(),
            'teacher_applications_pending' => TeacherApplication::where('status', 'en_attente')->count(),
            'contact_messages_new' => ContactMessage::where('status', 'nouveau')->count(),
            'bookings_this_week' => Booking::whereBetween('starts_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])->count(),
            'revenue_this_month' => Booking::where('status', 'terminee')
                ->whereMonth('starts_at', $now->month)->whereYear('starts_at', $now->year)->sum('price'),
            'reports_open' => \App\Models\Report::where('status', 'nouveau')->count(),
            'banned_users' => User::whereNotNull('banned_at')->count(),
        ]);
    }
}
