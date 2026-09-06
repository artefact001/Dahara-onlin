<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookFavorite extends Model
{
    protected $fillable = ['user_id', 'book_id'];
}
