<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SurahProgress extends Model
{
    protected $fillable = ['user_id', 'surah_number', 'surah_name', 'total_verses', 'memorized_verses', 'last_reviewed_at'];

    protected function casts(): array
    {
        return ['last_reviewed_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
