<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReengagementReminder extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('On ne vous a pas vu récemment sur Dahara Online 🌙')
            ->greeting('Salam '.$notifiable->full_name.',')
            ->line("Vous avez pris un peu de retard sur votre programme, mais rien n'est perdu.")
            ->line('Reprenez en douceur : quelques minutes suffisent pour relancer votre série.')
            ->action('Reprendre mon apprentissage', config('app.frontend_url', config('app.url')).'/mon-dahara');
    }
}
