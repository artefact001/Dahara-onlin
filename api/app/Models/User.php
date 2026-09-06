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
        'managed_by_id',
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
        'points',
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
            'banned_at' => 'datetime',
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

    // --- Famille ---
    public function managedBy()
    {
        return $this->belongsTo(User::class, 'managed_by_id');
    }

    public function managedChildren()
    {
        return $this->hasMany(User::class, 'managed_by_id');
    }

    public function childLinks()
    {
        return $this->hasMany(FamilyLink::class, 'parent_id');
    }

    public function isChildOf(User $parent): bool
    {
        return $this->managed_by_id === $parent->id
            || FamilyLink::where('parent_id', $parent->id)->where('child_id', $this->id)->exists();
    }

    // --- Gamification ---
    public function streak()
    {
        return $this->hasOne(Streak::class);
    }

    public function badges()
    {
        return $this->hasMany(UserBadge::class);
    }

    // --- Messagerie ---
    public function conversations()
    {
        return Conversation::where('user_one_id', $this->id)->orWhere('user_two_id', $this->id);
    }

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }
}
