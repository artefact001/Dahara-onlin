<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\LearningPath;
use App\Models\PathStep;
use App\Models\PrayerReminder;
use App\Models\SurahProgress;
use App\Models\User;
use App\Models\UserRole;

/**
 * Reproduit ce que faisait le trigger Postgres `handle_new_user` côté Supabase :
 * à l'inscription, on crée le rôle, les rappels de prière par défaut,
 * et (pour un élève) un parcours de départ + des objectifs + un suivi de sourates de base.
 */
class NewUserProvisioner
{
    public function provision(User $user, string $role = 'eleve'): void
    {
        UserRole::create(['user_id' => $user->id, 'role' => $role]);

        foreach (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as $prayer) {
            PrayerReminder::create([
                'user_id' => $user->id,
                'prayer' => $prayer,
                'enabled' => true,
                'offset_minutes' => 10,
            ]);
        }

        if ($role !== 'eleve') {
            return;
        }

        $path = LearningPath::create([
            'user_id' => $user->id,
            'title' => 'Mon parcours Dahara',
            'description' => 'Parcours progressif : lecture, tajwid et mémorisation.',
        ]);

        $steps = [
            ['title' => "Découverte de l'alphabet arabe", 'detail' => 'Reconnaître et prononcer les 28 lettres.', 'position' => 1, 'status' => 'en_cours'],
            ['title' => 'Lecture fluide avec voyelles', 'detail' => 'Lire des mots courts sans hésitation.', 'position' => 2, 'status' => 'a_faire'],
            ['title' => 'Bases du tajwid', 'detail' => "Règles de prolongation et points d'articulation.", 'position' => 3, 'status' => 'a_faire'],
            ['title' => 'Mémorisation du Juz 30', 'detail' => 'Sourates courtes, 2 par semaine.', 'position' => 4, 'status' => 'a_faire'],
        ];

        foreach ($steps as $step) {
            PathStep::create(array_merge($step, ['path_id' => $path->id, 'user_id' => $user->id]));
        }

        Goal::create(['user_id' => $user->id, 'label' => 'Versets mémorisés cette semaine', 'period' => 'hebdomadaire', 'target_value' => 20, 'current_value' => 0, 'unit' => 'versets']);
        Goal::create(['user_id' => $user->id, 'label' => 'Minutes de révision par jour', 'period' => 'quotidien', 'target_value' => 30, 'current_value' => 0, 'unit' => 'minutes']);

        $surahs = [
            [1, 'Al-Fâtiha', 7],
            [112, 'Al-Ikhlâs', 4],
            [67, 'Al-Mulk', 30],
            [78, "An-Naba'", 40],
        ];
        foreach ($surahs as [$number, $name, $verses]) {
            SurahProgress::create([
                'user_id' => $user->id,
                'surah_number' => $number,
                'surah_name' => $name,
                'total_verses' => $verses,
                'memorized_verses' => 0,
            ]);
        }
    }
}
