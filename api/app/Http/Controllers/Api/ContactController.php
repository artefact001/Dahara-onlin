<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    // POST /api/contact - public, pas d'authentification requise
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create($data);

        // TODO : brancher un Notification/Mailable ici pour prévenir l'équipe par email.

        return response()->json(['message' => 'Message envoyé avec succès.', 'id' => $message->id], 201);
    }
}
