<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuranBookmark;
use App\Models\QuranLastRead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Le texte du Coran n'est pas stocké en base : on le récupère (et on le met en cache)
 * depuis l'API publique et gratuite AlQuran Cloud (https://alquran.cloud/api),
 * qui ne nécessite pas de clé. Seuls les favoris et la reprise de lecture sont
 * propres à Dahara Online et stockés en base.
 *
 * ⚠️ Ces appels HTTP sortants n'ont pas pu être testés dans l'environnement de
 * génération (accès réseau restreint) — à vérifier une fois déployé.
 */
class QuranController extends Controller
{
    private function apiBase(): string
    {
        return config('services.quran.api_base', 'https://api.alquran.cloud/v1');
    }

    // GET /api/quran/surahs - liste des 114 sourates (numéro, nom arabe, nom traduit, nb versets)
    public function surahs()
    {
        $data = Cache::remember('quran:surahs', now()->addDays(30), function () {
            $response = Http::timeout(10)->get($this->apiBase().'/surah');

            return $response->successful() ? $response->json('data') : [];
        });

        return response()->json($data);
    }

    // GET /api/quran/surahs/{number}?translation=fr.hamidullah&reciter=ar.alafasy
    public function surah(Request $request, int $number)
    {
        abort_unless($number >= 1 && $number <= 114, 404);

        $translation = $request->query('translation', 'fr.hamidullah');
        $reciter = $request->query('reciter', 'ar.alafasy');

        $cacheKey = "quran:surah:{$number}:{$translation}:{$reciter}";

        $data = Cache::remember($cacheKey, now()->addDays(30), function () use ($number, $translation, $reciter) {
            $base = $this->apiBase();

            // On demande les 3 éditions d'un coup : texte arabe, traduction, audio
            $response = Http::timeout(10)->get("{$base}/surah/{$number}/editions/quran-uthmani,{$translation},{$reciter}");

            if (! $response->successful()) {
                return null;
            }

            [$arabic, $translated, $audio] = $response->json('data');

            $ayahs = collect($arabic['ayahs'])->map(function ($ayah, $i) use ($translated, $audio) {
                return [
                    'number' => $ayah['numberInSurah'],
                    'arabic' => $ayah['text'],
                    'translation' => $translated['ayahs'][$i]['text'] ?? null,
                    'audio_url' => $audio['ayahs'][$i]['audio'] ?? null,
                ];
            });

            return [
                'number' => $arabic['number'],
                'name' => $arabic['name'],
                'english_name' => $arabic['englishName'],
                'ayahs' => $ayahs,
            ];
        });

        abort_if($data === null, 502, "Impossible de récupérer la sourate depuis l'API Coran.");

        return response()->json($data);
    }

    // GET /api/quran/bookmarks (auth)
    public function bookmarks(Request $request)
    {
        return response()->json(
            QuranBookmark::where('user_id', $request->user()->id)->orderByDesc('created_at')->get()
        );
    }

    // POST /api/quran/bookmarks (auth)
    public function addBookmark(Request $request)
    {
        $data = $request->validate([
            'surah_number' => 'required|integer|min:1|max:114',
            'ayah_number' => 'required|integer|min:1',
            'note' => 'nullable|string|max:1000',
        ]);

        $bookmark = QuranBookmark::updateOrCreate(
            ['user_id' => $request->user()->id, 'surah_number' => $data['surah_number'], 'ayah_number' => $data['ayah_number']],
            ['note' => $data['note'] ?? null]
        );

        return response()->json($bookmark, 201);
    }

    // DELETE /api/quran/bookmarks/{bookmark} (auth)
    public function removeBookmark(Request $request, QuranBookmark $bookmark)
    {
        abort_unless($bookmark->user_id === $request->user()->id, 403);
        $bookmark->delete();

        return response()->json(null, 204);
    }

    // GET /api/quran/last-read (auth)
    public function lastRead(Request $request)
    {
        $lastRead = QuranLastRead::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['surah_number' => 1, 'ayah_number' => 1]
        );

        return response()->json($lastRead);
    }

    // PUT /api/quran/last-read (auth)
    public function updateLastRead(Request $request)
    {
        $data = $request->validate([
            'surah_number' => 'required|integer|min:1|max:114',
            'ayah_number' => 'required|integer|min:1',
        ]);

        $lastRead = QuranLastRead::updateOrCreate(['user_id' => $request->user()->id], $data);

        return response()->json($lastRead);
    }
}
