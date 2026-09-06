<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    protected $fillable = ['user_id', 'label', 'period', 'target_value', 'current_value', 'unit'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
