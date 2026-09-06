<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class GamificationController extends Controller
{
    // GET /api/gamification/me - points, série, badges de l'utilisateur connecté
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'points' => $user->points,
            'streak' => $user->streak,
            'badges' => $user->badges()->with('badge')->get(),
        ]);
    }

    // GET /api/gamification/leaderboard - top 20 par points
    public function leaderboard()
    {
        return response()->json(
            User::orderByDesc('points')->limit(20)->get(['id', 'full_name', 'points'])
        );
    }
}
