<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ParentChildInactivityReminder extends Notification
{
    use Queueable;

    public function __construct(private User $child)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->child->full_name.' n\'a pas étudié récemment')
            ->greeting('Salam,')
            ->line($this->child->full_name." n'a pas repris son programme depuis quelques jours.")
            ->line('Un petit encouragement de votre part peut faire toute la différence.')
            ->action('Voir sa progression', config('app.frontend_url', config('app.url')).'/mon-dahara/famille');
    }
}
