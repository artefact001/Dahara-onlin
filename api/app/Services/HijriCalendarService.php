<?php

namespace App\Services;

use Illuminate\Support\Carbon;

/**
 * Conversion grégorien → hijri via l'algorithme tabulaire "koweïtien",
 * une approximation arithmétique standard (sans API externe). Elle peut
 * différer d'un jour par rapport à l'observation lunaire réelle annoncée par
 * les autorités religieuses locales — à afficher avec la mention "estimation".
 */
class HijriCalendarService
{
    private const HIJRI_MONTHS = [
        'Mouharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Joumada al-Oula',
        'Joumada al-Thania', 'Rajab', 'Chaabane', 'Ramadan', 'Chawwal', "Dhou al-Qi'da", 'Dhou al-Hijja',
    ];

    public function fromGregorian(Carbon $date): array
    {
        $jd = $this->gregorianToJulianDay($date);
        [$year, $month, $day] = $this->julianDayToHijri($jd);

        return [
            'year' => $year,
            'month' => $month,
            'month_name' => self::HIJRI_MONTHS[$month - 1],
            'day' => $day,
            'is_ramadan' => $month === 9,
            'ramadan_day' => $month === 9 ? $day : null,
        ];
    }

    private function gregorianToJulianDay(Carbon $date): int
    {
        $y = $date->year;
        $m = $date->month;
        $d = $date->day;

        $a = intdiv(14 - $m, 12);
        $y2 = $y + 4800 - $a;
        $m2 = $m + 12 * $a - 3;

        return $d + intdiv(153 * $m2 + 2, 5) + 365 * $y2 + intdiv($y2, 4) - intdiv($y2, 100) + intdiv($y2, 400) - 32045;
    }

    private function julianDayToHijri(int $jd): array
    {
        $jd = $jd - 1948440 + 10632;
        $n = intdiv($jd - 1, 10631);
        $jd = $jd - 10631 * $n + 354;
        $j = (intdiv(10985 - $jd, 5316)) * (intdiv(50 * $jd, 17719)) + (intdiv($jd, 5670)) * (intdiv(43 * $jd, 15238));
        $jd = $jd - (intdiv(30 - $j, 15)) * (intdiv(17719 * $j, 50)) - (intdiv($j, 16)) * (intdiv(15238 * $j, 43)) + 29;

        $month = intdiv(24 * $jd, 709);
        $day = $jd - intdiv(709 * $month, 24);
        $year = 30 * $n + $j - 30;

        return [$year, $month, $day];
    }
}
