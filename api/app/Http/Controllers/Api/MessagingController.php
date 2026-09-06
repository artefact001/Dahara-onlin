<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\Request;

class MessagingController extends Controller
{
    // GET /api/conversations - liste des conversations de l'utilisateur, triées par activité
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with(['userOne:id,full_name', 'userTwo:id,full_name'])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (Conversation $c) use ($userId) {
                $other = $c->user_one_id === $userId ? $c->userTwo : $c->userOne;
                $unread = $c->messages()->whereNull('read_at')->where('sender_id', '!=', $userId)->count();

                return [
                    'id' => $c->id,
                    'with' => $other,
                    'last_message_at' => $c->last_message_at,
                    'unread_count' => $unread,
                ];
            });

        return response()->json($conversations);
    }

    // POST /api/conversations - démarrer (ou récupérer) une conversation avec un autre utilisateur
    public function start(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id|different:'.$request->user()->id,
            'booking_id' => 'nullable|exists:bookings,id',
        ]);

        [$one, $two] = [$request->user()->id, (int) $data['user_id']];
        if ($one > $two) {
            [$one, $two] = [$two, $one];
        }

        $conversation = Conversation::firstOrCreate(
            ['user_one_id' => $one, 'user_two_id' => $two],
            ['booking_id' => $data['booking_id'] ?? null]
        );

        return response()->json($conversation, 201);
    }

    // GET /api/conversations/{conversation}/messages
    public function messages(Request $request, Conversation $conversation)
    {
        $this->authorizeParticipant($request, $conversation);

        // Marque comme lus les messages reçus
        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['read_at' => now()]);

        return response()->json($conversation->messages()->with('sender:id,full_name')->get());
    }

    // POST /api/conversations/{conversation}/messages
    public function send(Request $request, Conversation $conversation)
    {
        $this->authorizeParticipant($request, $conversation);

        $data = $request->validate(['body' => 'required|string|max:5000']);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        $recipient = $conversation->otherUser($request->user()->id);
        $recipient->notify(new NewMessageNotification($message));

        return response()->json($message->load('sender:id,full_name'), 201);
    }

    private function authorizeParticipant(Request $request, Conversation $conversation): void
    {
        $userId = $request->user()->id;
        abort_unless(in_array($userId, [$conversation->user_one_id, $conversation->user_two_id]), 403);
    }
}
