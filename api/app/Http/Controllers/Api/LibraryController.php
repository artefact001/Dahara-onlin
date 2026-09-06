<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookFavorite;
use App\Models\ReadingProgress;
use Illuminate\Http\Request;

class LibraryController extends Controller
{
    // GET /api/library/books?category=&language=
    public function index(Request $request)
    {
        $query = Book::query();

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($language = $request->query('language')) {
            $query->where('language', $language);
        }

        // On ne renvoie pas les chapitres complets dans la liste (potentiellement volumineux)
        return response()->json(
            $query->select('id', 'slug', 'title', 'author', 'category', 'language', 'description', 'cover_path')->get()
        );
    }

    // GET /api/library/books/{slug}
    public function show(string $slug)
    {
        return response()->json(Book::where('slug', $slug)->firstOrFail());
    }

    // GET /api/library/favorites (auth)
    public function favorites(Request $request)
    {
        $bookIds = BookFavorite::where('user_id', $request->user()->id)->pluck('book_id');

        return response()->json(Book::whereIn('id', $bookIds)->get());
    }

    // POST /api/library/books/{book}/favorite (auth) - toggle
    public function toggleFavorite(Request $request, Book $book)
    {
        $existing = BookFavorite::where('user_id', $request->user()->id)->where('book_id', $book->id)->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['favorited' => false]);
        }

        BookFavorite::create(['user_id' => $request->user()->id, 'book_id' => $book->id]);

        return response()->json(['favorited' => true]);
    }

    // GET /api/library/progress (auth) - reprise de lecture sur tous les livres commencés
    public function progressIndex(Request $request)
    {
        return response()->json(
            ReadingProgress::where('user_id', $request->user()->id)->with('book:id,slug,title,cover_path')->get()
        );
    }

    // PUT /api/library/books/{book}/progress (auth)
    public function updateProgress(Request $request, Book $book)
    {
        $data = $request->validate([
            'chapter_index' => 'required|integer|min:0',
            'percent' => 'required|integer|min:0|max:100',
        ]);

        $progress = ReadingProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'book_id' => $book->id],
            array_merge($data, ['last_read_at' => now()])
        );

        return response()->json($progress);
    }
}
