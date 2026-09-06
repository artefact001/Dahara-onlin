<?php

return [
    'name' => env('APP_NAME', 'Dahara Online API'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),
    'timezone' => 'Africa/Dakar',
    'locale' => 'fr',
    'fallback_locale' => 'en',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'maintenance' => ['driver' => 'file'],
    'providers' => [],
    'aliases' => [],
];
