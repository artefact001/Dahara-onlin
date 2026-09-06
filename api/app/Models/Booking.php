<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'student_id', 'teacher_profile_id', 'teacher_availability_id', 'subject',
        'starts_at', 'duration_minutes', 'price', 'status', 'payment_status',
        'room_name', 'recording_url', 'notes',
    ];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            $booking->room_name ??= 'dahara-'.Str::uuid()->toString();
        });
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function teacherProfile()
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    /**
     * URL de la salle Jitsi auto-hébergée pour cette séance.
     * JITSI_DOMAIN doit pointer vers ton propre serveur Jitsi (voir .env).
     */
    public function getJitsiUrlAttribute(): string
    {
        return rtrim(config('services.jitsi.domain'), '/').'/'.$this->room_name;
    }
}
