<?php

namespace App\Notifications;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(private Message $message)
    {
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouveau message sur Dahara Online')
            ->line($this->message->sender->full_name.' vous a envoyé un message :')
            ->line('"'.\Illuminate\Support\Str::limit($this->message->body, 200).'"')
            ->action('Voir la conversation', config('app.frontend_url', config('app.url')).'/mon-dahara/messages');
    }

    public function toArray($notifiable): array
    {
        return [
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'preview' => \Illuminate\Support\Str::limit($this->message->body, 100),
        ];
    }
}
