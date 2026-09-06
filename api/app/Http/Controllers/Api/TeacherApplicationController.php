<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeacherApplication;
use Illuminate\Http\Request;

class TeacherApplicationController extends Controller
{
    // POST /api/teacher-applications - public
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:50',
            'subjects' => 'nullable|array',
            'experience_years' => 'nullable|integer|min:0',
            'city' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $application = TeacherApplication::create($data);

        return response()->json(['message' => 'Candidature reçue.', 'id' => $application->id], 201);
    }
}
