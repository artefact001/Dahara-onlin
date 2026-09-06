<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherApplication;
use App\Models\TeacherProfile;
use Illuminate\Http\Request;

class TeacherVerificationController extends Controller
{
    // GET /api/admin/teacher-applications
    public function pendingApplications()
    {
        return response()->json(
            TeacherApplication::where('status', 'en_attente')->latest()->get()
        );
    }

    // PATCH /api/admin/teacher-profiles/{teacherProfile}/verify
    public function verify(Request $request, TeacherProfile $teacherProfile)
    {
        $data = $request->validate([
            'verification_status' => 'required|in:verifie,refuse',
        ]);

        $teacherProfile->update($data);

        return response()->json($teacherProfile->fresh());
    }
}
