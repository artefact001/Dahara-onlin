<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PathStep extends Model
{
    protected $fillable = ['path_id', 'user_id', 'title', 'detail', 'position', 'status', 'target_date'];

    protected function casts(): array
    {
        return ['target_date' => 'date'];
    }

    public function path()
    {
        return $this->belongsTo(LearningPath::class, 'path_id');
    }
}
