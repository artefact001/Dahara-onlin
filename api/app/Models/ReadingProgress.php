<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingProgress extends Model
{
    protected $fillable = ['user_id', 'book_id', 'chapter_index', 'percent', 'last_read_at'];

    protected function casts(): array
    {
        return ['last_read_at' => 'datetime'];
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
