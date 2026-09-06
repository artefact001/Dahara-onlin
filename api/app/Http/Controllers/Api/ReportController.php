<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // POST /api/reports - signaler un message, une réservation, un profil...
    public function store(Request $request)
    {
        $data = $request->validate([
            'reportable_type' => 'required|string|in:message,booking,teacher_profile',
            'reportable_id' => 'required|integer',
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string|max:2000',
        ]);

        $report = Report::create(array_merge($data, [
            'reporter_id' => $request->user()->id,
            'status' => 'nouveau',
        ]));

        return response()->json($report, 201);
    }
}
