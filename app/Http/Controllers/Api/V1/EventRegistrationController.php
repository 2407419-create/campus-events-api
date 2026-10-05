<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use Illuminate\Http\Request;

class EventRegistrationController extends Controller
{
    /**
     * Display registrations.
     */
    public function index(Request $request)
    {
        $query = EventRegistration::with(['event', 'user']);

        // Students can only see their own registrations
        if ($request->user()->role->name === 'Student') {
            $query->where('user_id', $request->user()->id);
        }

        $registrations = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Registrations retrieved successfully.',
            'data' => $registrations
        ], 200);
    }

    /**
     * Register the logged-in student for an event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|exists:events,id',
        ]);

        $event = Event::find($validated['event_id']);

        // Check if the student is already registered
        $existingRegistration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'success' => false,
                'message' => 'User is already registered for this event.'
            ], 409);
        }

        // Check registration deadline
        if (
            $event->registration_deadline &&
            now()->greaterThan($event->registration_deadline)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Registration deadline has passed.'
            ], 422);
        }

        // Check event capacity
        $registeredCount = EventRegistration::where('event_id', $event->id)
            ->where('status', 'Registered')
            ->count();

        if ($registeredCount >= $event->maximum_capacity) {
            return response()->json([
                'success' => false,
                'message' => 'This event has reached maximum capacity.'
            ], 422);
        }

        // Automatically use the logged-in student's ID
        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $request->user()->id,
            'status' => 'Registered',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User registered for event successfully.',
            'data' => $registration
        ], 201);
    }

    /**
     * Display a single registration.
     */
    public function show(Request $request, string $id)
    {
        $registration = EventRegistration::with(['event', 'user'])
            ->find($id);

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found.'
            ], 404);
        }

        // Students can only view their own registration
        if (
            $request->user()->role->name === 'Student' &&
            $registration->user_id !== $request->user()->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only view your own registration.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration retrieved successfully.',
            'data' => $registration
        ], 200);
    }

    /**
     * Update a registration.
     */
    public function update(Request $request, string $id)
    {
        $registration = EventRegistration::find($id);

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found.'
            ], 404);
        }

        // Students can only update their own registration
        if ($registration->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only update your own registration.'
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:Registered,Cancelled',
        ]);

        $registration->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Registration updated successfully.',
            'data' => $registration
        ], 200);
    }

    /**
     * Delete a registration.
     */
    public function destroy(Request $request, string $id)
    {
        $registration = EventRegistration::find($id);

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found.'
            ], 404);
        }

        // Students can only delete their own registration
        if ($registration->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only delete your own registration.'
            ], 403);
        }

        $registration->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registration deleted successfully.'
        ], 200);
    }
}