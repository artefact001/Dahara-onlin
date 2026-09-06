<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FamilyLink;
use App\Models\Goal;
use App\Models\SurahProgress;
use App\Models\User;
use App\Services\NewUserProvisioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class FamilyController extends Controller
{
    // GET /api/family/children - enfants du parent connecté
    public function index(Request $request)
    {
        $children = User::where('managed_by_id', $request->user()->id)
            ->orWhereIn('id', FamilyLink::where('parent_id', $request->user()->id)->pluck('child_id'))
            ->get(['id', 'full_name', 'city']);

        return response()->json($children);
    }

    // POST /api/family/children - créer un compte enfant géré (sans email propre)
    public function storeManagedChild(Request $request, NewUserProvisioner $provisioner)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'daily_minutes_goal' => 'nullable|integer|min:1',
        ]);

        // Email technique unique, l'enfant ne se connecte pas directement avec ce compte pour l'instant.
        $child = User::create([
            'full_name' => $data['full_name'],
            'email' => 'enfant-'.\Illuminate\Support\Str::random(10).'@managed.dahara-online.internal',
            'password' => Hash::make(\Illuminate\Support\Str::random(32)),
            'managed_by_id' => $request->user()->id,
            'daily_minutes_goal' => $data['daily_minutes_goal'] ?? 20,
        ]);

        $provisioner->provision($child, 'eleve');

        return response()->json($child, 201);
    }

    // POST /api/family/link - relier un compte élève existant (par email) comme enfant
    public function linkExisting(Request $request)
    {
        $data = $request->validate(['email' => 'required|email|exists:users,email']);

        $child = User::where('email', $data['email'])->firstOrFail();
        abort_if($child->id === $request->user()->id, 422, 'Vous ne pouvez pas vous lier à vous-même.');

        $link = FamilyLink::firstOrCreate(['parent_id' => $request->user()->id, 'child_id' => $child->id]);

        return response()->json($link, 201);
    }

    // GET /api/family/children/{child}/progress - suivi d'un enfant (lecture seule, parent uniquement)
    public function childProgress(Request $request, User $child)
    {
        abort_unless($child->isChildOf($request->user()), 403);

        return response()->json([
            'child' => $child->only(['id', 'full_name']),
            'goals' => Goal::where('user_id', $child->id)->get(),
            'surah_progress' => SurahProgress::where('user_id', $child->id)->get(),
            'streak' => $child->streak,
        ]);
    }
}
