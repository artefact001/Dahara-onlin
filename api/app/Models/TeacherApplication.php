<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherApplication extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'subjects', 'experience_years', 'city', 'message', 'status'];

    protected function casts(): array
    {
        return ['subjects' => 'array'];
    }
}
