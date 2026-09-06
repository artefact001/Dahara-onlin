<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuranBookmark extends Model
{
    protected $fillable = ['user_id', 'surah_number', 'ayah_number', 'note'];
}
