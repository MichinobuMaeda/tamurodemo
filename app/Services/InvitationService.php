<?php

namespace App\Services;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Notifications\InvitationMailNotification;
use App\User;
use App\AuthProvider;

class InvitationService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * @param App\User $user
     * @param string $sendBy
     * @return App\User
     */
    public function invite($user, $sendBy)
    {
        $token = hash('sha512', env('APP_KEY').((new DateTime())->format('Y-m-dTH:i:s.u')).$user->id);
        $user->invitation_token = $token;
        $user->invited_at = new DateTime();
        $user->save();
        if ($sendBy == 'email') {
            $user->notify(new InvitationMailNotification($user));
        }
    }
}
