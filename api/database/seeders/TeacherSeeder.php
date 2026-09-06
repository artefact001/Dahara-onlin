<?php

namespace Database\Seeders;

use App\Models\AvailabilitySlot;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Models\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// Reprend les 3 professeurs de démonstration actuellement codés en dur
// dans src/lib/site-data.ts côté frontend, pour les faire vivre en base réelle.
class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            [
                'full_name' => 'Ustadh Abdou',
                'email' => 'abdou@dahara-online.com',
                'slug' => 'ustadh-abdou',
                'subjects' => ['Arabe', 'Coran', 'Tajwid'],
                'city' => 'Dakar',
                'price_fcfa' => 5000,
                'session_minutes' => 45,
                'rating' => 4.9,
                'reviews_count' => 128,
                'languages' => ['Wolof', 'Français', 'العربية'],
                'levels' => ['Débutant', 'Intermédiaire'],
                'bio' => "Formé au dahra de Ndiassane puis diplômé en langue arabe, Ustadh Abdou accompagne enfants et adultes vers une lecture fluide du Coran, avec beaucoup de patience et une méthode progressive.",
                'days' => [1, 3, 6], // Lun, Mer, Sam
            ],
            [
                'full_name' => 'Mme Aïcha Sarr',
                'email' => 'aicha@dahara-online.com',
                'slug' => 'aicha-sarr',
                'subjects' => ['Coran', 'Tajwid'],
                'city' => 'Saint-Louis',
                'price_fcfa' => 4000,
                'session_minutes' => 40,
                'rating' => 5.0,
                'reviews_count' => 94,
                'languages' => ['Wolof', 'العربية'],
                'levels' => ['Débutant', 'Enfant'],
                'bio' => "Spécialiste du tajwid pour les femmes et les enfants, Aïcha Sarr propose des séances courtes et régulières, centrées sur la prononciation et la mémorisation par petites unités.",
                'days' => [2, 4], // Mar, Jeu
            ],
            [
                'full_name' => 'Ustadh Moussa',
                'email' => 'moussa@dahara-online.com',
                'slug' => 'moussa-diop',
                'subjects' => ['Arabe', 'Hadith', 'Fiqh'],
                'city' => 'Dakar',
                'price_fcfa' => 6000,
                'session_minutes' => 50,
                'rating' => 4.8,
                'reviews_count' => 76,
                'languages' => ['Wolof', 'Français', 'العربية'],
                'levels' => ['Intermédiaire', 'Avancé'],
                'bio' => 'Enseignant en sciences islamiques, Ustadh Moussa aide les élèves avancés à approfondir le fiqh et le hadith avec une pédagogie exigeante et bienveillante.',
                'days' => [1, 5],
            ],
        ];

        foreach ($teachers as $t) {
            $user = User::create([
                'full_name' => $t['full_name'],
                'email' => $t['email'],
                'password' => Hash::make('changeme-'.str()->random(8)),
                'city' => $t['city'],
                'is_teacher' => true,
                'bio' => $t['bio'],
                'languages' => $t['languages'],
            ]);

            UserRole::create(['user_id' => $user->id, 'role' => 'professeur']);

            $profile = TeacherProfile::create([
                'user_id' => $user->id,
                'slug' => $t['slug'],
                'subjects' => $t['subjects'],
                'tags' => $t['subjects'],
                'city' => $t['city'],
                'price_fcfa' => $t['price_fcfa'],
                'session_minutes' => $t['session_minutes'],
                'rating' => $t['rating'],
                'reviews_count' => $t['reviews_count'],
                'languages' => $t['languages'],
                'levels' => $t['levels'],
                'bio' => $t['bio'],
                'verification_status' => 'verifie',
            ]);

            foreach ($t['days'] as $day) {
                AvailabilitySlot::create([
                    'teacher_profile_id' => $profile->id,
                    'day_of_week' => $day,
                    'start_time' => '18:00:00',
                    'is_active' => true,
                ]);
            }
        }
    }
}
