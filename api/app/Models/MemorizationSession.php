<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemorizationSession extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'session_date', 'surah_number', 'verses', 'minutes'];

    protected function casts(): array
    {
        return ['session_date' => 'date', 'created_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
