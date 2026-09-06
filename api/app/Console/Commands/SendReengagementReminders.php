<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\FamilyLink;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Notifications\ParentChildInactivityReminder;
use App\Notifications\ReengagementReminder;
use App\Notifications\TeacherReengagementReminder;
use Illuminate\Console\Command;

class SendReengagementReminders extends Command
{
    protected $signature = 'dahara:send-reengagement-reminders {--days=3 : Nombre de jours d\'inactivité avant relance}';
    protected $description = "Envoie des relances segmentées (élèves, professeurs, parents) sans culpabilisation, cf. cahier des charges.";

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $threshold = now()->subDays($days)->toDateString();

        $inactiveIds = User::whereDoesntHave('streak', function ($q) use ($threshold) {
            $q->where('last_activity_date', '>=', $threshold);
        })->pluck('id', 'id');

        $studentCount = 0;
        $teacherCount = 0;
        $parentCount = 0;

        // 1. Élèves autonomes (ni enfants gérés, ni professeurs) inactifs
        User::whereIn('id', $inactiveIds)
            ->whereNull('managed_by_id')
            ->where('is_teacher', false)
            ->chunk(100, function ($users) use (&$studentCount) {
                foreach ($users as $user) {
                    $user->notify(new ReengagementReminder());
                    $studentCount++;
                }
            });

        // 2. Professeurs sans nouvelle réservation récente (indépendamment de la "série" élève)
        TeacherProfile::whereHas('user')->with('user')->get()->each(function (TeacherProfile $teacher) use ($threshold, &$teacherCount) {
            $recentBooking = Booking::where('teacher_profile_id', $teacher->id)->where('created_at', '>=', $threshold)->exists();
            if (! $recentBooking && $teacher->user) {
                $teacher->user->notify(new TeacherReengagementReminder());
                $teacherCount++;
            }
        });

        // 3. Parents dont un enfant géré est inactif
        User::whereNotNull('managed_by_id')->whereIn('id', $inactiveIds)->get()
            ->each(function (User $child) use (&$parentCount) {
                $parent = $child->managedBy;
                if ($parent) {
                    $parent->notify(new ParentChildInactivityReminder($child));
                    $parentCount++;
                }
            });

        $this->info("Relances envoyées — élèves : {$studentCount}, professeurs : {$teacherCount}, parents : {$parentCount}");

        return self::SUCCESS;
    }
}
