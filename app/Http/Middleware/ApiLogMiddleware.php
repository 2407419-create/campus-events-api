<?php

namespace App\Http\Middleware;

use App\Models\ApiLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiLogMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        ApiLog::create([
            'user_id' => $request->user()?->id,
            'method' => $request->method(),
            'endpoint' => $request->path(),
            'status_code' => $response->getStatusCode(),
            'ip_address' => $request->ip(),
        ]);

        return $response;
    }
}