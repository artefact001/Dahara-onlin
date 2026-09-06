<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuranLastRead extends Model
{
    protected $table = 'quran_last_read';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    const CREATED_AT = null;

    protected $fillable = ['user_id', 'surah_number', 'ayah_number'];
}
