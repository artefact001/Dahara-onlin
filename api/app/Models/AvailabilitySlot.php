<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvailabilitySlot extends Model
{
    protected $fillable = ['teacher_profile_id', 'day_of_week', 'start_time', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function teacherProfile()
    {
        return $this->belongsTo(TeacherProfile::class);
    }
}
