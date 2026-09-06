<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = ['teacher_profile_id', 'student_id', 'booking_id', 'title', 'instructions', 'due_at'];

    protected function casts(): array
    {
        return ['due_at' => 'datetime'];
    }

    public function teacherProfile()
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
