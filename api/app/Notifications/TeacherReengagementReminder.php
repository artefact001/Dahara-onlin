<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherReengagementReminder extends Notification
{
    use Queueable;

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Vos élèves vous attendent sur Dahara Online')
            ->greeting('Salam '.$notifiable->full_name.',')
            ->line("Vous n'avez pas mis à jour votre agenda récemment.")
            ->line('Ouvrir de nouveaux créneaux augmente vos chances de recevoir des réservations.')
            ->action('Gérer mon agenda', config('app.frontend_url', config('app.url')).'/mon-dahara/professeur/agenda');
    }
}
