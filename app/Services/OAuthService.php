<?php

namespace App\Services;

use DateTime;
use Facebook\Facebook;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Notifications\InvitationMailNotification;
use App\User;
use App\AuthProvider;
use App\Services\OAuthGoogleService;
use App\Services\OAuthFacebookService;
use App\Services\OAuthYahooJpService;
use App\Services\OAuthAmazonService;

class OAuthService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->providers = [
            'google' => new OAuthGoogleService(),
            'facebook' => new OAuthFacebookService(),
            'yahoo_jp' => new OAuthYahooJpService(),
            'amazon' => new OAuthAmazonService(),
        ];
    }

    /**
     * Register user's OAuth provider.
     * 
     * @param App\User $user
     * @param string $token
     * @param string $provider_name
     * @param string $provider_token
     * @return Boolean
     */
    public function register($user, $token, $provider_name, $provider_token)
    {
        if ((!$user) || (!$token) || (!$provider_name) || (!$provider_token)) {
            Log::info(json_encode([
                'service' => get_class($this).'#register',
                'result' => false,
                'user_id' => ($user ? $user->id : null),
                'token' => $token,
                'provider_name' => $provider_name,
                'provider_token' => substr($provider_token, 0, 10).'...',
                'message' => 'missed required parameters',
            ]));
            return false;
        }
        if ($user->invitation_token != $token) {
            Log::info(json_encode([
                'service' => get_class($this).'#register',
                'result' => false,
                'user_id' => $user->id,
                'token' => $token,
                'message' => 'invalid token',
            ]));
            return false;
        }
        if ($user->invited_at < (new DateTime())->modify(
            '-'.config('tamuro.invitation_expire').' minutes'
        )) {
            Log::info(json_encode([
                'service' => get_class($this).'#register',
                'result' => false,
                'user_id' => $user->id,
                'token' => $token,
                'message' => 'token expired',
            ]));
            return false;
        }
        $ret = $this->set($user, $provider_name, $provider_token);
        if ($ret) {
            Auth::login($user);
        }
        return $ret;
    }

    /**
     * Set logged-in user's OAuth provider.
     * 
     * @param App\User $user
     * @param string $provider_name
     * @param string $provider_token
     * @return Boolean
     */
    public function set($user, $provider_name, $provider_token)
    {
        if ((!$user) || (!$provider_name) || (!$provider_token)) {
            Log::info(json_encode([
                'service' => get_class($this).'#set',
                'result' => false,
                'user_id' => ($user ? $user->id : null),
                'provider_name' => $provider_name,
                'provider_token' => substr($provider_token, 0, 10).'...',
                'message' => 'missed required parameters',
            ]));
            return false;
        }
        $secret = $this->providers[$provider_name]->validate($provider_token);
        Log::info(json_encode([
            'service' => get_class($this).'#set',
            'result' => !!$secret,
            'user_id' => $user->id,
            'provider_name' => $provider_name,
            'provider_token' => substr($provider_token, 0, 10).'...',
        ]));
        if (!$secret) {
            return false;
        }
        $hashed = $this->hashProviderSecret($provider_name, $secret);
        AuthProvider::updateOrCreate(
            [
                'user_id' => $user->id,
                'provider' => $provider_name,
            ],
            [
                'secret' => $hashed,
            ]
        );
        return true;
    }

    /**
     * Reset logged-in user's OAuth provider.
     * 
     * @param App\User $user
     * @param string $provider_name
     * @return Boolean
     */
    public function reset($user, $provider_name)
    {
        if ((!$user) || (!$provider_name)) {
            Log::info(json_encode([
                'service' => get_class($this).'#set',
                'result' => false,
                'user_id' => ($user ? $user->id : null),
                'provider_name' => $provider_name,
                'message' => 'missed required parameters',
            ]));
            return false;
        }
        AuthProvider::where('user_id', $user->id)
            ->where('provider', $provider_name)->delete();
        Log::info(json_encode([
            'service' => get_class($this).'#set',
            'result' => true,
            'user_id' => $user->id,
            'provider_name' => $provider_name,
        ]));
        return true;
    }

    /**
     * @param string $provider_name
     * @param string $provider_token
     * @return boolean
     */
    public function login($provider_name, $provider_token)
    {
        if ((!$provider_name) || (!$provider_token)) {
            Log::info(json_encode([
                'service' => get_class($this).'#login',
                'result' => false,
                'provider_name' => $provider_name,
                'provider_token' => substr($provider_token, 0, 10).'...',
                'message' => 'missed required parameters',
            ]));
            return false;
        }
        $secret = $this->providers[$provider_name]->validate($provider_token);
        Log::info(json_encode([
            'service' => get_class($this).'#login',
            'result' => !!$secret,
            'provider_name' => $provider_name,
            'provider_token' => substr($provider_token, 0, 10).'...',
        ]));
        if (!$secret) {
            return false;
        }
        $hashed = $this->hashProviderSecret($provider_name, $secret);
        $ap = AuthProvider::where('secret', '=', $hashed)->first();
        if (!$ap) {
            Log::info(json_encode([
                'service' => get_class($this).'#login',
                'result' => 'Unknown user',
                'provider_name' => $provider_name,
                'provider_token' => substr($provider_token, 0, 10).'...',
            ]));
            return false;
        }
        Auth::login(User::find($ap->user_id));
        return true;
    }

    /**
     * @param string $provider_name
     * @param string $provider_token
     * @return string
     */
    private function hashProviderSecret($provider_name, $secret)
    {
        return hash('sha256', $provider_name.$secret.config('app.key'));
    }
}
