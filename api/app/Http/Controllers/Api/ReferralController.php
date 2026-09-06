<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    // GET /api/referral/me
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => config('app.frontend_url').'/auth?parrain='.$user->referral_code,
            'referrals_count' => $user->referrals()->count(),
            'active_referrals_count' => $user->referrals()->whereHas('bookingsAsStudent', fn ($q) => $q->where('status', 'terminee'))->count(),
        ]);
    }
}
