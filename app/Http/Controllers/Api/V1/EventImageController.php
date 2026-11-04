<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class EventImageController extends Controller
{
    /**
     * Display all images belonging to an event.
     */
    public function index($eventId)
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

    /**
     * Upload an image for an event.
     */
    public function store(Request $request, $eventId)
    {
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found.'
            ], 404);
        }

        // Check event ownership for organizers.
        $user = $request->user();

        if (
            $user->role &&
            $user->role->name === 'Event Organizer' &&
            (int) $event->organizer_id !== (int) $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to upload images for this event.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'caption' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $path = $request->file('image')->store('event-images', 'public');

        $eventImage = EventImage::create([
            'event_id' => $event->id,
            'image_path' => $path,
            'caption' => $request->caption
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event image uploaded successfully.',
            'data' => $eventImage
        ], 201);
    }

    /**
     * Display a specific event image.
     */
    public function show($eventId, $id)
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

    /**
     * Delete an event image.
     */
    public function destroy(Request $request, $eventId, $id)
    {
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Event not found.'
            ], 404);
        }

        // Check event ownership for organizers.
        $user = $request->user();

        if (
            $user->role &&
            $user->role->name === 'Event Organizer' &&
            (int) $event->organizer_id !== (int) $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete images for this event.'
            ], 403);
        }

        $image = EventImage::where('event_id', $eventId)
            ->where('id', $id)
            ->first();

        if (!$image) {
            return response()->json([
                'success' => false,
                'message' => 'Event image not found.'
            ], 404);
        }

        // Delete the physical image file.
        if ($image->image_path) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event image deleted successfully.'
        ], 200);
    }
}