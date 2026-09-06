<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointsLedgerEntry extends Model
{
    public $timestamps = false;
    protected $table = 'points_ledger';

    protected $fillable = ['user_id', 'amount', 'reason', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }
}
