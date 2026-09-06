<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NewUserProvisioner;
use App\Services\TotpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request, NewUserProvisioner $provisioner)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'city' => 'nullable|string|max:255',
            'role' => 'nullable|in:eleve,professeur',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = $request->input('role', 'eleve');
        $referrer = $request->filled('referral_code')
            ? User::where('referral_code', $request->input('referral_code'))->first()
            : null;

        $user = User::create([
            'full_name' => $request->input('full_name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'city' => $request->input('city'),
            'is_teacher' => $role === 'professeur',
            'referral_code' => $this->generateUniqueReferralCode(),
            'referred_by_id' => $referrer?->id,
        ]);

        $provisioner->provision($user, $role);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user->fresh(),
            'token' => $token,
        ], 201);
    }

    private function generateUniqueReferralCode(): string
    {
        do {
            $code = strtoupper(\Illuminate\Support\Str::random(6));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        $user = User::where('email', $request->input('email'))->firstOrFail();

        if ($user->two_factor_confirmed_at) {
            $challenge = Crypt::encryptString(json_encode([
                'user_id' => $user->id,
                'expires_at' => now()->addMinutes(5)->timestamp,
            ]));

            return response()->json(['requires_2fa' => true, 'challenge_token' => $challenge]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    // POST /api/auth/two-factor-challenge - deuxième étape si requires_2fa était true
    public function twoFactorChallenge(Request $request, TotpService $totp)
    {
        $data = $request->validate([
            'challenge_token' => 'required|string',
            'code' => 'required|string',
        ]);

        try {
            $payload = json_decode(Crypt::decryptString($data['challenge_token']), true);
        } catch (\Exception $e) {
            abort(422, 'Challenge invalide ou expiré.');
        }

        abort_if($payload['expires_at'] < now()->timestamp, 422, 'Challenge expiré, reconnectez-vous.');

        $user = User::findOrFail($payload['user_id']);
        $secret = Crypt::decryptString($user->two_factor_secret);

        $validCode = $totp->verify($secret, $data['code']);
        $validRecovery = false;

        if (! $validCode && $user->two_factor_recovery_codes) {
            $codes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true);
            if (in_array(strtoupper($data['code']), $codes, true)) {
                $validRecovery = true;
                // Un code de récupération est à usage unique.
                $user->update(['two_factor_recovery_codes' => Crypt::encryptString(json_encode(
                    array_values(array_diff($codes, [strtoupper($data['code'])]))
                ))]);
            }
        }

        abort_unless($validCode || $validRecovery, 422, 'Code invalide.');

        $token = $user->createToken('api')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('roles'));
    }
}
