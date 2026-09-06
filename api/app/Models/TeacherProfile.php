<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    protected $fillable = [
        'user_id', 'slug', 'full_name', 'headline', 'bio', 'city', 'photo_path',
        'subjects', 'languages', 'levels', 'hourly_price', 'session_minutes',
        'rating', 'reviews_count', 'status',
    ];

    protected function casts(): array
    {
        return [
            'subjects' => 'array',
            'languages' => 'array',
            'levels' => 'array',
            'rating' => 'decimal:1',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availability()
    {
        return $this->hasMany(AvailabilitySlot::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeValide($query)
    {
        return $query->where('status', 'valide');
    }
}
