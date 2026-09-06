<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignmentSubmission extends Model
{
    protected $fillable = ['assignment_id', 'student_id', 'type', 'content', 'file_path', 'submitted_at', 'grade', 'feedback', 'corrected_at'];

    protected function casts(): array
    {
        return ['submitted_at' => 'datetime', 'corrected_at' => 'datetime'];
    }

    public function assignment()
    {
        return $this->belongsTo(Assignment::class);
    }
}
