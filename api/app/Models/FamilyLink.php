<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamilyLink extends Model
{
    protected $fillable = ['parent_id', 'child_id', 'relationship'];

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function child()
    {
        return $this->belongsTo(User::class, 'child_id');
    }
}
