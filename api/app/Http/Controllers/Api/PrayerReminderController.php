<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PrayerReminder;
use Illuminate\Http\Request;

class PrayerReminderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->prayerReminders);
    }

    public function update(Request $request, PrayerReminder $prayerReminder)
    {
        abort_unless($prayerReminder->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'enabled' => 'sometimes|boolean',
            'offset_minutes' => 'sometimes|integer|min:0|max:120',
        ]);

        $prayerReminder->update($data);

        return response()->json($prayerReminder->fresh());
    }
}
