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
        // Monitoring d'erreurs prêt à activer : si le package sentry/sentry-laravel
        // est installé ET que SENTRY_LARAVEL_DSN est renseignée, les exceptions non
        // interceptées sont envoyées à Sentry. Sans ça, ce bloc ne fait rien —
        // aucune dépendance obligatoire, aucun risque si tu n'utilises pas Sentry.
        if (env('SENTRY_LARAVEL_DSN') && class_exists(\Sentry\Laravel\Integration::class)) {
            \Sentry\Laravel\Integration::handles($exceptions);
        }
    })->create();
