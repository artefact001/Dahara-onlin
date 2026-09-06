<?php

namespace Database\Seeders;

use App\Models\AvailabilitySlot;
use App\Models\TeacherProfile;
use Illuminate\Database\Seeder;

// Reprend les professeurs de démonstration définis côté Lovable/Supabase
// (supabase/migrations/20260906215502_...sql) pour garder les mêmes données de démo.
class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            [
                'slug' => 'serigne-abdou-sane',
                'full_name' => 'Serigne Abdou Sane',
                'headline' => 'Maître de récitation et de tajwid',
                'bio' => "Vingt ans d'enseignement au dahra de Guédiawaye. Spécialiste du tajwid et de la mémorisation progressive pour les enfants comme pour les adultes.",
                'city' => 'Dakar',
                'subjects' => ['Coran', 'Tajwid', 'Mémorisation'],
                'languages' => ['Wolof', 'Français', 'العربية'],
                'hourly_price' => 6000,
                'rating' => 4.9,
                'status' => 'valide',
            ],
            [
                'slug' => 'oustaza-aicha-diallo',
                'full_name' => 'Oustaza Aïcha Diallo',
                'headline' => 'Langue arabe et sciences islamiques',
                'bio' => "Diplômée en langue arabe, elle accompagne les débutantes et débutants avec douceur et méthode, de l'alphabet à la lecture fluide.",
                'city' => 'Thiès',
                'subjects' => ['Langue arabe', 'Fiqh', 'Coran'],
                'languages' => ['Français', 'العربية'],
                'hourly_price' => 5000,
                'rating' => 4.8,
                'status' => 'valide',
            ],
            [
                'slug' => 'oustaz-moussa-ba',
                'full_name' => 'Oustaz Moussa Ba',
                'headline' => 'Sira et éducation spirituelle',
                'bio' => "Enseignant passionné de l'histoire du Prophète et de l'éthique musulmane, il rend chaque séance vivante et concrète.",
                'city' => 'Saint-Louis',
                'subjects' => ['Sira', 'Fiqh', 'Tajwid'],
                'languages' => ['Wolof', 'Français'],
                'hourly_price' => 4500,
                'rating' => 4.7,
                'status' => 'valide',
            ],
        ];

        foreach ($teachers as $t) {
            $profile = TeacherProfile::create($t);

            foreach ([1, 2, 3, 4, 6] as $weekday) {
                AvailabilitySlot::create([
                    'teacher_profile_id' => $profile->id,
                    'weekday' => $weekday,
                    'start_time' => '17:00:00',
                    'end_time' => '20:00:00',
                    'is_active' => true,
                ]);
            }
        }
    }
}
