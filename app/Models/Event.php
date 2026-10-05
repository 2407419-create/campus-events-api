<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'category_id',
        'venue',
        'event_date',
        'start_time',
        'end_time',
        'organizer_id',
        'maximum_capacity',
        'banner',
        'registration_deadline',
        'status',
    ];

    /**
     * An event belongs to a category.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * An event belongs to an organizer.
     */
    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    /**
     * An event can have many registrations.
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    /**
     * An event can have many images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(EventImage::class);
    }
}