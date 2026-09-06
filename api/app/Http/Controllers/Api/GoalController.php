<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use App\Services\GamificationService;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->goals);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => 'required|string|max:255',
            'period' => 'required|string',
            'target_value' => 'required|integer|min:1',
            'unit' => 'required|string',
        ]);

        $goal = $request->user()->goals()->create($data);

        return response()->json($goal, 201);
    }

    public function update(Request $request, Goal $goal, GamificationService $gamification)
    {
        abort_unless($goal->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'current_value' => 'sometimes|integer|min:0',
            'target_value' => 'sometimes|integer|min:1',
        ]);

        $wasCompleted = $goal->current_value >= $goal->target_value;
        $goal->update($data);

        if (! $wasCompleted && $goal->current_value >= $goal->target_value) {
            $gamification->awardPoints($request->user(), 15, "Objectif atteint : {$goal->label}");
        }

        return response()->json($goal->fresh());
    }

    public function destroy(Request $request, Goal $goal)
    {
        abort_unless($goal->user_id === $request->user()->id, 403);
        $goal->delete();

        return response()->json(null, 204);
    }
}
