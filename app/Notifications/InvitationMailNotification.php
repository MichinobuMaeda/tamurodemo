<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Mail;

class InvitationMailNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($user)
    {
        $this->user = $user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
            ->subject(config('app.name').' '.Lang::getFromJson('Setup login method'))
            ->line(Lang::getFromJson('Please setup your login method.'))
            ->action(Lang::getFromJson('Setup login method'), url(config('app.url').route('users.invitations', [ 'user' => $notifiable->id, 'token' => $notifiable->invitation_token ], false)))
            ->line(Lang::getFromJson('If you have any questions, please contact us.'))
            ->line(env('MAIL_FROM_ADDRESS'))
            ->line('')
            ->line(Lang::getFromJson('Regards,'));
        $mail->viewData = [
            'greeting' => Lang::getFromJson('Hello!').' '.$notifiable->name.Lang::getFromJson('-san'),
            'salutation' => config('app.name'),
        ];
        return $mail;
    }
}
