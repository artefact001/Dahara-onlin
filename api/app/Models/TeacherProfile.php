<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    protected $fillable = [
        'user_id', 'slug', 'subjects', 'tags', 'city', 'price_fcfa',
        'session_minutes', 'rating', 'reviews_count', 'languages',
        'levels', 'bio', 'photo_path', 'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'subjects' => 'array',
            'tags' => 'array',
            'languages' => 'array',
            'levels' => 'array',
            'rating' => 'decimal:1',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function availabilitySlots()
    {
        return $this->hasMany(AvailabilitySlot::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verifie');
    }
}
