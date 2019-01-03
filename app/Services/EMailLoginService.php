<?php

namespace App\Services;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Log;
use App\Notifications\EMailLoginMailNotification;
use App\User;

class EMailLoginService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Send login URL by e-mail.
     * 
     * @param String email
     * @return boolean
     */
    public function send($email)
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            Log::info(json_encode([
                'service' => get_class($this).'#send',
                'result' => false,
                'user_id' => null,
                'email' => $email,
                'message' => 'the email address is not registered',
            ]));
            return false;
        }
        $token = hash('sha512', env('APP_KEY').((new DateTime())->format('Y-m-dTH:i:s.u')).$user->id);
        $user->invitation_token = $token;
        $user->invited_at = new DateTime();
        $user->save();
        $user->notify(new EMailLoginMailNotification($user));
        return true;
    }

    /**
     * Send login URL by e-mail.
     * 
     * @param App\User $user
     * @param String $token
     * @return boolean
     */
    public function login($user, $token)
    {
        if (!$user) {
            Log::info(json_encode([
                'service' => get_class($this).'#login',
                'result' => false,
                'user_id' => null,
                'token' => $token,
                'message' => 'Unknown user',
            ]));
            return false;
        }
        if (!$token) {
            Log::info(json_encode([
                'service' => get_class($this).'#login',
                'result' => false,
                'user_id' => $user->id,
                'token' => $token,
                'message' => 'empty token',
            ]));
            return false;
        }
        if ($user->invitation_token != $token) {
            Log::info(json_encode([
                'service' => get_class($this).'#login',
                'result' => false,
                'user_id' => $user->id,
                'token' => $token,
                'message' => 'invalid token',
            ]));
            return false;
        }
        if ($user->invited_at < (new DateTime())->modify(
            '-'.env('APP_PASSWORD_RESET_EXPIRE', 10).' minutes'
        )) {
            Log::info(json_encode([
                'service' => get_class($this).'#login',
                'result' => false,
                'user_id' => $user->id,
                'token' => $token,
                'message' => 'token expired',
            ]));
            return false;
        }
        Auth::login($user);
        Log::info(json_encode([
            'service' => get_class($this).'#login',
            'result' => true,
            'user_id' => $user->id,
            'token' => $token,
            'message' => 'login complete',
        ]));
        return true;
    }
}
