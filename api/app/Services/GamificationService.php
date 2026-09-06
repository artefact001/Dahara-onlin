<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\PointsLedgerEntry;
use App\Models\Streak;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Support\Carbon;

class GamificationService
{
    /**
     * Ajoute des points à l'utilisateur et journalise la raison.
     */
    public function awardPoints(User $user, int $amount, string $reason): void
    {
        PointsLedgerEntry::create(['user_id' => $user->id, 'amount' => $amount, 'reason' => $reason, 'created_at' => now()]);
        $user->increment('points', $amount);
    }

    /**
     * À appeler à chaque action "d'apprentissage" du jour (lecture, cours, quiz...)
     * Met à jour la série (streak) de l'utilisateur.
     */
    public function recordActivity(User $user): Streak
    {
        $today = Carbon::today();
        $streak = Streak::firstOrCreate(['user_id' => $user->id], ['current_streak' => 0, 'longest_streak' => 0]);

        if ($streak->last_activity_date?->isSameDay($today)) {
            return $streak; // déjà comptabilisé aujourd'hui
        }

        if ($streak->last_activity_date?->isSameDay($today->copy()->subDay())) {
            $streak->current_streak += 1; // continuité
        } else {
            $streak->current_streak = 1; // rupture de série, on repart à 1
        }

        $streak->longest_streak = max($streak->longest_streak, $streak->current_streak);
        $streak->last_activity_date = $today;
        $streak->save();

        $this->checkStreakBadges($user, $streak);

        return $streak;
    }

    public function awardBadge(User $user, string $code): void
    {
        $badge = Badge::where('code', $code)->first();
        if (! $badge) {
            return;
        }

        UserBadge::firstOrCreate(['user_id' => $user->id, 'badge_id' => $badge->id], ['earned_at' => now()]);
    }

    private function checkStreakBadges(User $user, Streak $streak): void
    {
        if ($streak->current_streak >= 7) {
            $this->awardBadge($user, 'streak_7_jours');
        }
        if ($streak->current_streak >= 30) {
            $this->awardBadge($user, 'streak_30_jours');
        }
    }
}
