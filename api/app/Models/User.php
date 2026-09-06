<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'phone',
        'city',
        'bio',
        'languages',
        'is_teacher',
        'daily_minutes_goal',
        'weekly_verses_goal',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'languages' => 'array',
            'is_teacher' => 'boolean',
        ];
    }

    public function roles()
    {
        return $this->hasMany(UserRole::class);
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->where('role', $role)->exists();
    }

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class);
    }

    public function learningPaths()
    {
        return $this->hasMany(LearningPath::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function prayerReminders()
    {
        return $this->hasMany(PrayerReminder::class);
    }

    public function surahProgress()
    {
        return $this->hasMany(SurahProgress::class);
    }

    public function memorizationSessions()
    {
        return $this->hasMany(MemorizationSession::class);
    }

    public function bookingsAsStudent()
    {
        return $this->hasMany(Booking::class, 'student_id');
    }
}
