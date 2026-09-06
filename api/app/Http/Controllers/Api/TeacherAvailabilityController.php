<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvailabilitySlot;
use Illuminate\Http\Request;

class TeacherAvailabilityController extends Controller
{
    // GET /api/teacher/availability - mes créneaux
    public function index(Request $request)
    {
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher, 403);

        return response()->json($teacher->availability);
    }

    // POST /api/teacher/availability
    public function store(Request $request)
    {
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher, 403);

        $data = $request->validate([
            'weekday' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $slot = $teacher->availability()->create(array_merge($data, ['is_active' => true]));

        return response()->json($slot, 201);
    }

    // PATCH /api/teacher/availability/{slot}
    public function update(Request $request, AvailabilitySlot $slot)
    {
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher && $slot->teacher_profile_id === $teacher->id, 403);

        $data = $request->validate(['is_active' => 'sometimes|boolean']);
        $slot->update($data);

        return response()->json($slot->fresh());
    }

    // DELETE /api/teacher/availability/{slot}
    public function destroy(Request $request, AvailabilitySlot $slot)
    {
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher && $slot->teacher_profile_id === $teacher->id, 403);

        $slot->delete();

        return response()->json(null, 204);
    }
}
