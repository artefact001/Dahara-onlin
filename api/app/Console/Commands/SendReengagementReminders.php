<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\ReengagementReminder;
use Illuminate\Console\Command;

class SendReengagementReminders extends Command
{
    protected $signature = 'dahara:send-reengagement-reminders {--days=3 : Nombre de jours d\'inactivité avant relance}';
    protected $description = "Envoie un e-mail de relance aux élèves inactifs depuis N jours (sans culpabilisation, cf. cahier des charges).";

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $threshold = now()->subDays($days)->toDateString();

        $inactiveUserIds = User::whereDoesntHave('streak', function ($q) use ($threshold) {
            $q->where('last_activity_date', '>=', $threshold);
        })->whereNull('managed_by_id')->pluck('id');

        $count = 0;
        User::whereIn('id', $inactiveUserIds)->chunk(100, function ($users) use (&$count) {
            foreach ($users as $user) {
                $user->notify(new ReengagementReminder());
                $count++;
            }
        });

        $this->info("Relances envoyées : {$count}");

        return self::SUCCESS;
    }
}
