<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeacherProfile;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    // GET /api/teachers?subject=Coran&city=Dakar&level=Débutant
    public function index(Request $request)
    {
        $query = TeacherProfile::valide()->with('user:id,full_name,email');

        if ($subject = $request->query('subject')) {
            $query->whereJsonContains('subjects', $subject);
        }

        if ($city = $request->query('city')) {
            $query->where('city', $city);
        }

        if ($level = $request->query('level')) {
            $query->whereJsonContains('levels', $level);
        }

        return response()->json($query->paginate(12));
    }

    // GET /api/teachers/{slug}
    public function show(string $slug)
    {
        $teacher = TeacherProfile::valide()
            ->with(['availability' => fn ($q) => $q->where('is_active', true)])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($teacher);
    }
}
