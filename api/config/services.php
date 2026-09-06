<?php

return [
    'jitsi' => [
        // Domaine de ton propre serveur Jitsi auto-hébergé, ex: https://visio.dahara-online.com
        'domain' => env('JITSI_DOMAIN', 'https://meet.jit.si'),
    ],

    'quran' => [
        'api_base' => env('QURAN_API_BASE', 'https://api.alquran.cloud/v1'),
    ],

    // À compléter en Phase 3 une fois les comptes marchands créés
    'wave' => [
        'api_key' => env('WAVE_API_KEY'),
        'api_base' => env('WAVE_API_BASE', 'https://api.wave.com/v1'),
    ],
    'orange_money' => [
        'api_key' => env('ORANGE_MONEY_API_KEY'),
        'api_secret' => env('ORANGE_MONEY_API_SECRET'),
        'api_base' => env('ORANGE_MONEY_API_BASE'),
    ],
];
