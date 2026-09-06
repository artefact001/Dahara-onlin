<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\PathStep;
use Illuminate\Http\Request;

class LearningPathController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->learningPaths()->with('steps')->get()
        );
    }

    public function updateStep(Request $request, PathStep $step)
    {
        abort_unless($step->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'status' => 'sometimes|in:a_faire,en_cours,termine',
            'target_date' => 'nullable|date',
        ]);

        $step->update($data);

        return response()->json($step->fresh());
    }
}
