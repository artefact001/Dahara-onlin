<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MemorizationSession;
use App\Models\SurahProgress;
use App\Services\GamificationService;
use Illuminate\Http\Request;

class SurahProgressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->surahProgress);
    }

    public function update(Request $request, SurahProgress $surahProgress)
    {
        abort_unless($surahProgress->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'memorized_verses' => 'sometimes|integer|min:0',
        ]);

        $surahProgress->update(array_merge($data, ['last_reviewed_at' => now()]));

        return response()->json($surahProgress->fresh());
    }

    public function logSession(Request $request, GamificationService $gamification)
    {
        $data = $request->validate([
            'surah_number' => 'nullable|integer',
            'verses' => 'required|integer|min:0',
            'minutes' => 'required|integer|min:0',
        ]);

        $session = MemorizationSession::create(array_merge($data, [
            'user_id' => $request->user()->id,
            'session_date' => now()->toDateString(),
        ]));

        $gamification->recordActivity($request->user());
        $gamification->awardPoints($request->user(), 10, 'Session de mémorisation');

        return response()->json($session, 201);
    }
}
