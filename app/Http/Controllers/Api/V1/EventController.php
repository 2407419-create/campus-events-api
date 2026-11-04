
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display events.
     */
    public function index(Request $request)
    {
        $query = Event::with(['category', 'organizer']);

        // Organizers can only view their own events.
        if ($request->user()->role->name === 'Event Organizer') {
            $query->where('organizer_id', $request->user()->id);
        }

        // Search events by title or description.
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by category.
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Allow other roles to filter by organizer.
        // Organizer ownership is enforced above.
        if (
            $request->filled('organizer_id') &&
            $request->user()->role->name !== 'Event Organizer'
        ) {
            $query->where('organizer_id', $request->organizer_id);
        }

        // Filter by event date.
        if ($request->filled('date')) {
            $query->whereDate('event_date', $request->date);
        }

        $events = $query->orderBy('event_date', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Events retrieved successfully.',
            'data' => $events
        ], 200);
    }

    /**
     * Store a new event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'venue' => 'required|string|max:255',
            'event_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'maximum_capacity' => 'required|integer|min:1',
            'banner' => 'nullable|string|max:255',
            'registration_deadline' => 'nullable|date',
            'status' => 'nullable|in:Upcoming,Ongoing,Completed,Cancelled',
        ]);

        // Automatically assign the logged-in organizer.
        $validated['organizer_id'] = $request->user()->id;

        $event = Event::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully.',
            'data' => $event
        ], 201);
    }

    /**
     * Display a single event.
     */
    public function show(Event $event)
    {
        $event->load(['category', 'organizer']);

        return response()->json([
            'success' => true,
            'message' => 'Event retrieved successfully.',
            'data' => $event
        ], 200);
    }

    /**
     * Update an event.
     */
    public function update(Request $request, Event $event)
    {
        // Organizers can only update their own events.
        if (
            $request->user()->role->name === 'Event Organizer' &&
            (int) $event->organizer_id !== (int) $request->user()->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only update your own events.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'venue' => 'sometimes|required|string|max:255',
            'event_date' => 'sometimes|required|date',
            'start_time' => 'sometimes|required',
            'end_time' => 'sometimes|required|after:start_time',
            'maximum_capacity' => 'sometimes|required|integer|min:1',
            'banner' => 'nullable|string|max:255',
            'registration_deadline' => 'nullable|date',
            'status' => 'nullable|in:Upcoming,Ongoing,Completed,Cancelled',
        ]);

        $event->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully.',
            'data' => $event
        ], 200);
    }

    /**
     * Display upcoming events.
     */
    public function upcoming()
    {
        $events = Event::with(['category', 'organizer'])
            ->whereDate('event_date', '>=', now()->toDateString())
            ->where('status', 'Upcoming')
            ->orderBy('event_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Upcoming events retrieved successfully.',
            'data' => $events
        ], 200);
    }

    /**
     * Display past events.
     */
    public function past()
    {
        $events = Event::with(['category', 'organizer'])
            ->whereDate('event_date', '<', now()->toDateString())
            ->orderBy('event_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Past events retrieved successfully.',
            'data' => $events
        ], 200);
    }

    /**
     * Delete an event.
     */
    public function destroy(Request $request, Event $event)
    {
        // Organizers can only delete their own events.
        if (
            $request->user()->role->name === 'Event Organizer' &&
            (int) $event->organizer_id !== (int) $request->user()->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only delete your own events.'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully.'
        ], 200);
    }
}
