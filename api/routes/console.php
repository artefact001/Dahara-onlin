<?php

use App\Console\Commands\SendReengagementReminders;
use Illuminate\Support\Facades\Schedule;

Schedule::command(SendReengagementReminders::class)->dailyAt('18:00');
