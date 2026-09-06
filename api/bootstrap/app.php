<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\EnsureUserNotBanned;
use App\Http\Middleware\EnsureTwoFactorEnabled;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Limite générale anti-abus sur toute l'API (60 requêtes/minute par utilisateur ou IP).
        // Des limites plus strictes sont posées route par route pour login/register/contact.
        $middleware->throttleApi();

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'not_banned' => EnsureUserNotBanned::class,
            'require_2fa' => EnsureTwoFactorEnabled::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
