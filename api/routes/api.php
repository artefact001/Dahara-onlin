<?php

use App\Http\Controllers\Api\Admin\TeacherVerificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\PrayerReminderController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SurahProgressController;
use App\Http\Controllers\Api\TeacherApplicationController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

// --- Public ---
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/teachers', [TeacherController::class, 'index']);
Route::get('/teachers/{slug}', [TeacherController::class, 'show']);

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/teacher-applications', [TeacherApplicationController::class, 'store']);

// --- Authentifié (Sanctum) ---
Route::middleware('auth:sanctum')->group(function () {
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

    // --- Admin uniquement ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/teacher-applications', [TeacherVerificationController::class, 'pendingApplications']);
        Route::patch('/teacher-profiles/{teacherProfile}/verify', [TeacherVerificationController::class, 'verify']);
    });
});
