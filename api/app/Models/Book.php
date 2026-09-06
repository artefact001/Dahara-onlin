<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = ['slug', 'title', 'author', 'category', 'language', 'description', 'cover_path', 'chapters'];

    protected function casts(): array
    {
        return ['chapters' => 'array'];
    }

    public function favorites()
    {
        return $this->hasMany(BookFavorite::class);
    }
}
