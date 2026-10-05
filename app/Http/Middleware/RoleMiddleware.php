<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        if (!$request->user()->role) {
            return response()->json([
                'success' => false,
                'message' => 'User role not found.'
            ], 403);
        }

        if (!in_array($request->user()->role->name, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You do not have permission to perform this action.'
            ], 403);
        }

        return $next($request);
    }
}