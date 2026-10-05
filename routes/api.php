<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\EventImageController;
use App\Http\Controllers\Api\V1\EventRegistrationController;


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| Authenticated User
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


/*
|--------------------------------------------------------------------------
| API Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')
    ->middleware(['auth:sanctum', 'api.log'])
    ->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);

        Route::post('/categories', [CategoryController::class, 'store'])
            ->middleware('role:Administrator,Event Organizer');

        Route::put('/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('role:Administrator,Event Organizer');

        Route::patch('/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('role:Administrator,Event Organizer');

        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
            ->middleware('role:Administrator,Event Organizer');


        /*
        |--------------------------------------------------------------------------
        | Events
        |--------------------------------------------------------------------------
        */

        Route::get('/events/upcoming', [EventController::class, 'upcoming']);
        Route::get('/events/past', [EventController::class, 'past']);

        Route::get('/events', [EventController::class, 'index']);
        Route::get('/events/{event}', [EventController::class, 'show']);

        Route::post('/events', [EventController::class, 'store'])
            ->middleware('role:Administrator,Event Organizer');

        Route::put('/events/{event}', [EventController::class, 'update'])
            ->middleware('role:Administrator,Event Organizer');

        Route::delete('/events/{event}', [EventController::class, 'destroy'])
            ->middleware('role:Administrator,Event Organizer');


        /*
        |--------------------------------------------------------------------------
        | Event Images
        |--------------------------------------------------------------------------
        */

        Route::get('/events/{eventId}/images', [EventImageController::class, 'index']);

        Route::post('/events/{eventId}/images', [EventImageController::class, 'store'])
            ->middleware('role:Administrator,Event Organizer');

        Route::get('/events/{eventId}/images/{id}', [EventImageController::class, 'show']);

        Route::delete('/events/{eventId}/images/{id}', [EventImageController::class, 'destroy'])
            ->middleware('role:Administrator,Event Organizer');


        /*
        |--------------------------------------------------------------------------
        | Event Registrations
        |--------------------------------------------------------------------------
        */

        Route::get('/registrations', [EventRegistrationController::class, 'index']);
        Route::get('/registrations/{registration}', [EventRegistrationController::class, 'show']);

        Route::post('/registrations', [EventRegistrationController::class, 'store'])
            ->middleware('role:Student');

        Route::put('/registrations/{registration}', [EventRegistrationController::class, 'update'])
            ->middleware('role:Student');

        Route::delete('/registrations/{registration}', [EventRegistrationController::class, 'destroy'])
            ->middleware('role:Student');
    });