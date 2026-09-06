<?php

namespace Database\Seeders;

use App\Models\Badge;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            ['code' => 'premier_cours', 'label' => 'Premier cours', 'description' => 'A terminé sa première séance.', 'icon' => 'graduation-cap'],
            ['code' => 'streak_7_jours', 'label' => '7 jours de suite', 'description' => 'Une semaine complète de régularité.', 'icon' => 'flame'],
            ['code' => 'streak_30_jours', 'label' => '30 jours consécutifs', 'description' => 'Un mois entier sans interruption.', 'icon' => 'flame'],
            ['code' => 'dix_hadiths', 'label' => '10 hadiths appris', 'description' => 'Dix hadiths mémorisés.', 'icon' => 'book-open'],
            ['code' => 'premier_livre_termine', 'label' => 'Premier livre terminé', 'description' => 'A terminé la lecture d\'un livre complet.', 'icon' => 'book'],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['code' => $badge['code']], $badge);
        }
    }
}
