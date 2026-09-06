<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rend la 2FA obligatoire pour certaines routes sensibles (admin notamment).
 * L'utilisateur voit une erreur explicite l'invitant à l'activer via
 * POST /api/two-factor/enable puis /confirm.
 */
class EnsureTwoFactorEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->two_factor_confirmed_at) {
            abort(403, "L'authentification à deux facteurs est obligatoire pour cette section. Active-la via /api/two-factor/enable.");
        }

        return $next($request);
    }
}
