<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

// Reprend les 4 livres de démonstration définis côté Supabase.
class BookSeeder extends Seeder
{
    public function run(): void
    {
        Book::create([
            'slug' => 'les-quarante-hadiths',
            'title' => 'Les quarante hadiths',
            'author' => 'Imam An-Nawawi',
            'category' => 'Hadith',
            'language' => 'Français',
            'description' => 'Un recueil fondamental de quarante paroles prophétiques, expliquées simplement.',
            'chapters' => [
                ['title' => "L'intention", 'content' => "Les actes ne valent que par l'intention qui les habite. Chacun sera récompensé selon ce qu'il visait vraiment."],
                ['title' => "Les piliers de l'islam", 'content' => "L'islam repose sur cinq appuis : le témoignage de foi, la prière, l'aumône purificatrice, le jeûne du mois de Ramadan et le pèlerinage."],
                ['title' => 'La bonté envers autrui', 'content' => "Nul n'est pleinement croyant tant qu'il ne désire pas pour son frère ce qu'il désire pour lui-même."],
            ],
        ]);

        Book::create([
            'slug' => 'regles-du-tajwid',
            'title' => 'Les règles essentielles du tajwid',
            'author' => 'Cheikh Ibrahima Niang',
            'category' => 'Tajwid',
            'language' => 'Français',
            'description' => "Les bases de la belle récitation : points d'articulation, allongements et assimilations.",
            'chapters' => [
                ['title' => 'Pourquoi le tajwid', 'content' => "Le tajwid est l'art de donner à chaque lettre du Coran ce qui lui revient."],
                ['title' => "Les points d'articulation", 'content' => "La gorge produit le hamza et le hâ' ; le fond de la langue le qâf et le kâf."],
            ],
        ]);
    }
}
