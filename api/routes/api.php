<?php

use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\ModerationController;
use App\Http\Controllers\Api\Admin\TeacherVerificationController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FamilyController;
use App\Http\Controllers\Api\GamificationController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\MessagingController;
use App\Http\Controllers\Api\PrayerReminderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\QuranController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SurahProgressController;
use App\Http\Controllers\Api\TeacherApplicationController;
use App\Http\Controllers\Api\TeacherAvailabilityController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TeacherDashboardController;
use Illuminate\Support\Facades\Route;

// --- Public ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/teachers', [TeacherController::class, 'index']);
Route::get('/teachers/{slug}', [TeacherController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/teacher-applications', [TeacherApplicationController::class, 'store']);

Route::get('/library/books', [LibraryController::class, 'index']);
Route::get('/library/books/{book:slug}', [LibraryController::class, 'show']);

Route::get('/quran/surahs', [QuranController::class, 'surahs']);
Route::get('/quran/surahs/{number}', [QuranController::class, 'surah']);

Route::get('/gamification/leaderboard', [GamificationController::class, 'leaderboard']);

// --- Authentifié (Sanctum, token Bearer) ---
Route::middleware(['auth:sanctum', 'not_banned'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/learning-paths', [LearningPathController::class, 'index']);
    Route::patch('/path-steps/{step}', [LearningPathController::class, 'updateStep']);

    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::patch('/goals/{goal}', [GoalController::class, 'update']);
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy']);

    Route::get('/prayer-reminders', [PrayerReminderController::class, 'index']);
    Route::patch('/prayer-reminders/{prayerReminder}', [PrayerReminderController::class, 'update']);

    Route::get('/surah-progress', [SurahProgressController::class, 'index']);
    Route::patch('/surah-progress/{surahProgress}', [SurahProgressController::class, 'update']);
    Route::post('/memorization-sessions', [SurahProgressController::class, 'logSession']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}', [BookingController::class, 'update']);
    Route::get('/bookings/{booking}/room', [BookingController::class, 'room']);

    Route::get('/library/favorites', [LibraryController::class, 'favorites']);
    Route::post('/library/books/{book}/favorite', [LibraryController::class, 'toggleFavorite']);
    Route::get('/library/progress', [LibraryController::class, 'progressIndex']);
    Route::put('/library/books/{book}/progress', [LibraryController::class, 'updateProgress']);

    Route::get('/quran/bookmarks', [QuranController::class, 'bookmarks']);
    Route::post('/quran/bookmarks', [QuranController::class, 'addBookmark']);
    Route::delete('/quran/bookmarks/{bookmark}', [QuranController::class, 'removeBookmark']);
    Route::get('/quran/last-read', [QuranController::class, 'lastRead']);
    Route::put('/quran/last-read', [QuranController::class, 'updateLastRead']);

    // --- Messagerie ---
    Route::get('/conversations', [MessagingController::class, 'index']);
    Route::post('/conversations', [MessagingController::class, 'start']);
    Route::get('/conversations/{conversation}/messages', [MessagingController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [MessagingController::class, 'send']);

    // --- Devoirs ---
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments', [AssignmentController::class, 'store']);
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit']);
    Route::patch('/assignment-submissions/{submission}/grade', [AssignmentController::class, 'grade']);
    Route::get('/assignment-submissions/{submission}/file', [AssignmentController::class, 'downloadFile']);

    // --- Espace professeur ---
    Route::get('/teacher/students', [TeacherDashboardController::class, 'students']);
    Route::get('/teacher/planning', [TeacherDashboardController::class, 'planning']);
    Route::get('/teacher/revenue', [TeacherDashboardController::class, 'revenue']);
    Route::get('/teacher/availability', [TeacherAvailabilityController::class, 'index']);
    Route::post('/teacher/availability', [TeacherAvailabilityController::class, 'store']);
    Route::patch('/teacher/availability/{slot}', [TeacherAvailabilityController::class, 'update']);
    Route::delete('/teacher/availability/{slot}', [TeacherAvailabilityController::class, 'destroy']);

    // --- Gamification ---
    Route::get('/gamification/me', [GamificationController::class, 'me']);

    // --- Comptes famille ---
    Route::get('/family/children', [FamilyController::class, 'index']);
    Route::post('/family/children', [FamilyController::class, 'storeManagedChild']);
    Route::post('/family/link', [FamilyController::class, 'linkExisting']);
    Route::get('/family/children/{child}/progress', [FamilyController::class, 'childProgress']);

    // --- Signalements ---
    Route::post('/reports', [ReportController::class, 'store']);

    // --- Admin uniquement ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminStatsController::class, 'index']);
        Route::get('/teacher-applications', [TeacherVerificationController::class, 'pendingApplications']);
        Route::patch('/teacher-profiles/{teacherProfile}/verify', [TeacherVerificationController::class, 'verify']);
        Route::get('/reports', [ModerationController::class, 'reports']);
        Route::patch('/reports/{report}', [ModerationController::class, 'updateReport']);
        Route::patch('/users/{user}/ban', [ModerationController::class, 'banUser']);
        Route::patch('/users/{user}/unban', [ModerationController::class, 'unbanUser']);
    });
});
