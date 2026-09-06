<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssignmentController extends Controller
{
    // GET /api/assignments - devoirs de l'élève connecté, ou donnés par le professeur connecté
    public function index(Request $request)
    {
        $user = $request->user();

        $query = $user->teacherProfile
            ? Assignment::where('teacher_profile_id', $user->teacherProfile->id)
            : Assignment::where('student_id', $user->id);

        return response()->json(
            $query->with(['submissions', 'student:id,full_name'])->orderByDesc('due_at')->get()
        );
    }

    // POST /api/assignments - un professeur donne un devoir à un élève
    public function store(Request $request)
    {
        abort_unless($request->user()->teacherProfile, 403, 'Seul un professeur peut donner un devoir.');

        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'title' => 'required|string|max:255',
            'instructions' => 'nullable|string|max:5000',
            'due_at' => 'nullable|date',
        ]);

        $assignment = Assignment::create(array_merge($data, [
            'teacher_profile_id' => $request->user()->teacherProfile->id,
        ]));

        return response()->json($assignment, 201);
    }

    // POST /api/assignments/{assignment}/submit (auth, élève concerné)
    public function submit(Request $request, Assignment $assignment)
    {
        abort_unless($assignment->student_id === $request->user()->id, 403);

        $data = $request->validate([
            'type' => 'required|in:texte,audio',
            'content' => 'required_if:type,texte|nullable|string|max:20000',
            'file' => 'required_if:type,audio|nullable|file|mimes:mp3,wav,m4a,ogg|max:20480', // 20 Mo max
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            // Stockage local (disk "local") — à basculer vers S3/un CDN si le volume grandit.
            $filePath = $request->file('file')->store('assignments/'.$assignment->id, 'local');
        }

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $request->user()->id,
            'type' => $data['type'],
            'content' => $data['content'] ?? null,
            'file_path' => $filePath,
            'submitted_at' => now(),
        ]);

        return response()->json($submission, 201);
    }

    // PATCH /api/assignment-submissions/{submission}/grade (auth, professeur concerné)
    public function grade(Request $request, AssignmentSubmission $submission)
    {
        $teacherProfile = $request->user()->teacherProfile;
        abort_unless($teacherProfile && $submission->assignment->teacher_profile_id === $teacherProfile->id, 403);

        $data = $request->validate([
            'grade' => 'required|integer|min:0|max:20',
            'feedback' => 'nullable|string|max:5000',
        ]);

        $submission->update(array_merge($data, ['corrected_at' => now()]));

        return response()->json($submission->fresh());
    }

    // GET /api/assignment-submissions/{submission}/file (auth, élève ou professeur concerné)
    public function downloadFile(Request $request, AssignmentSubmission $submission)
    {
        $user = $request->user();
        $isStudent = $submission->student_id === $user->id;
        $isTeacher = $user->teacherProfile && $submission->assignment->teacher_profile_id === $user->teacherProfile->id;

        abort_unless($isStudent || $isTeacher, 403);
        abort_unless($submission->file_path, 404);

        return Storage::disk('local')->download($submission->file_path);
    }
}
