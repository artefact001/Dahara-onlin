<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HijriCalendarService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CalendarController extends Controller
{
    // GET /api/calendar/hijri?date=YYYY-MM-DD (par défaut aujourd'hui) - public
    public function hijri(Request $request, HijriCalendarService $hijri)
    {
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : Carbon::today();

        return response()->json(array_merge(
            ['gregorian_date' => $date->toDateString()],
            $hijri->fromGregorian($date)
        ));
    }

    // GET /api/calendar/ramadan-status - public
    // Se déclenche automatiquement selon le calendrier hijri, sans bascule manuelle.
    public function ramadanStatus(HijriCalendarService $hijri)
    {
        $today = $hijri->fromGregorian(Carbon::today());

        if (! $today['is_ramadan']) {
            return response()->json(['is_ramadan' => false]);
        }

        return response()->json([
            'is_ramadan' => true,
            'day' => $today['ramadan_day'],
            'hijri_year' => $today['year'],
            'suggested_program' => [
                ['duration_minutes' => 5, 'activity' => 'Lecture du Coran'],
                ['duration_minutes' => 5, 'activity' => 'Arabe'],
                ['duration_minutes' => 5, 'activity' => 'Hadith du jour'],
                ['duration_minutes' => 5, 'activity' => 'Révision'],
            ],
        ]);
    }
}
