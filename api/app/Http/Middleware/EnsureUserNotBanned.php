<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserNotBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isBanned()) {
            abort(403, 'Ce compte a été suspendu.');
        }

        return $next($request);
    }
}
