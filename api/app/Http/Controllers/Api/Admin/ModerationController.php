<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    // GET /api/admin/reports?status=nouveau
    public function reports(Request $request)
    {
        $query = Report::with('reporter:id,full_name');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->latest()->get());
    }

    // PATCH /api/admin/reports/{report}
    public function updateReport(Request $request, Report $report)
    {
        $data = $request->validate(['status' => 'required|in:traite,rejete']);
        $report->update($data);

        return response()->json($report->fresh());
    }

    // PATCH /api/admin/users/{user}/ban
    public function banUser(Request $request, User $user)
    {
        $data = $request->validate(['reason' => 'required|string|max:500']);
        $user->update(['banned_at' => now(), 'ban_reason' => $data['reason']]);

        return response()->json($user->fresh());
    }

    // PATCH /api/admin/users/{user}/unban
    public function unbanUser(User $user)
    {
        $user->update(['banned_at' => null, 'ban_reason' => null]);

        return response()->json($user->fresh());
    }
}
