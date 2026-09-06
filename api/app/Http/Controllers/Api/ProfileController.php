<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user()->load('roles', 'teacherProfile'));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'city' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'languages' => 'nullable|array',
            'daily_minutes_goal' => 'sometimes|integer|min:1',
            'weekly_verses_goal' => 'sometimes|integer|min:1',
        ]);

        $request->user()->update($data);

        return response()->json($request->user()->fresh());
    }
}
