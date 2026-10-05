<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventImage;
use Illuminate\Http\Request;

class EventImageController extends Controller
{
    public function index(string $eventId)
    {
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found.'
            ], 404);
        }

        $images = EventImage::where('event_id', $eventId)->get();

        return response()->json([
            'success' => true,
            'message' => 'Event images retrieved successfully.',
            'data' => $images
        ], 200);
    }

    public function store(Request $request, string $eventId)
    {
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found.'
            ], 404);
        }

        $validated = $request->validate([
            'image' => 'required|string|max:255',
        ]);

        $image = EventImage::create([
            'event_id' => $eventId,
            'image' => $validated['image'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event image added successfully.',
            'data' => $image
        ], 201);
    }

    public function show(string $eventId, string $id)
    {
        $image = EventImage::where('event_id', $eventId)
            ->where('id', $id)
            ->first();

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Event image not found.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Event image retrieved successfully.',
            'data' => $image
        ], 200);
    }

    public function destroy(string $eventId, string $id)
    {
        $image = EventImage::where('event_id', $eventId)
            ->where('id', $id)
            ->first();

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Event image not found.'
            ], 404);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event image deleted successfully.'
        ], 200);
    }
}