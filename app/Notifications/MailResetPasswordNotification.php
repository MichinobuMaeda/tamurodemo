<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Mail;

class MailResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($token)
    {
        $this->token = $token;
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
            ->subject(config('app.name').' '.Lang::getFromJson('Reset Password Notification'))
            ->line(Lang::getFromJson('You are receiving this email because we received a password reset request for your account.'))
            ->action(Lang::getFromJson('Reset Password'), url(config('app.url').route('password.reset', $this->token, false)))
            ->line(Lang::getFromJson('If you did not request a password reset, no further action is required.'))
            ->line('')
            ->line(Lang::getFromJson('Regards,'));
        $mail->viewData = [
            'greeting' => Lang::getFromJson('Hello!'),
            'salutation' => config('app.name'),
        ];
        return $mail;
      }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
