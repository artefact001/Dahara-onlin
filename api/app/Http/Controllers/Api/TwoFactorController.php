<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TotpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class TwoFactorController extends Controller
{
    // POST /api/two-factor/enable - génère un secret (pas encore actif tant que non confirmé)
    public function enable(Request $request, TotpService $totp)
    {
        $user = $request->user();
        abort_if($user->two_factor_confirmed_at, 409, 'La 2FA est déjà activée.');

        $secret = $totp->generateSecret();
        $user->update(['two_factor_secret' => Crypt::encryptString($secret)]);

        return response()->json([
            'secret' => $secret,
            'otpauth_uri' => $totp->getOtpAuthUri($secret, $user->email),
        ]);
    }

    // POST /api/two-factor/confirm - valide le premier code saisi et active réellement la 2FA
    public function confirm(Request $request, TotpService $totp)
    {
        $user = $request->user();
        abort_unless($user->two_factor_secret, 409, "Lance d'abord /two-factor/enable.");

        $data = $request->validate(['code' => 'required|string']);
        $secret = Crypt::decryptString($user->two_factor_secret);

        abort_unless($totp->verify($secret, $data['code']), 422, 'Code invalide.');

        $recoveryCodes = $totp->generateRecoveryCodes();

        $user->update([
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
        ]);

        // Les codes de récupération ne sont montrés qu'une seule fois, à cet instant précis.
        return response()->json(['recovery_codes' => $recoveryCodes]);
    }

    // POST /api/two-factor/disable
    public function disable(Request $request)
    {
        $request->user()->update([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ]);

        return response()->json(['message' => 'Authentification à deux facteurs désactivée.']);
    }
}
