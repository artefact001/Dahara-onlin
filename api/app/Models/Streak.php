<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Streak extends Model
{
    protected $table = 'streaks';
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = ['user_id', 'current_streak', 'longest_streak', 'last_activity_date'];

    protected function casts(): array
    {
        return ['last_activity_date' => 'date'];
    }
}
