<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['booking_id', 'student_id', 'teacher_profile_id', 'rating', 'comment'];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function teacherProfile()
    {
        return $this->belongsTo(TeacherProfile::class);
    }
}
