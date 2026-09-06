<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'student_id', 'teacher_profile_id', 'availability_slot_id', 'subject',
        'scheduled_at', 'duration_minutes', 'price_fcfa', 'status', 'payment_status', 'notes',
    ];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime'];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function teacherProfile()
    {
        return $this->belongsTo(TeacherProfile::class);
    }
}
