<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrayerReminder extends Model
{
    protected $fillable = ['user_id', 'prayer', 'enabled', 'offset_minutes', 'city'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
