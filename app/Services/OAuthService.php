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
            'google' => function ($id_token) {
                $client = new \Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
                $payload = $client->verifyIdToken($id_token);
                return $payload ? $payload['sub'] : null;
            },
            'facebook' => function ($access_token) {
                try {
                    $fb = new Facebook([
                        'app_id' => env('FACEBOOK_APP_ID'),
                        'app_secret' => env('FACEBOOK_APP_SECRET'),
                        'default_graph_version' => 'v2.10',
                    ]);
                    $response = $fb->get('/me', $access_token);
                    $me = $response->getGraphUser();
                    return $me->getId();
                } catch (\Exception $e) {
                    Log::warning(json_encode([
                        'service' => get_class($this).'#__construct',
                        'result' => null,
                        'provider' => 'facebook',
                        'message' => $e->getMessage(),
                    ]));
                    return null;
                }
            },
        ];
    }

    /**
     * @param App\User $user
     * @param string $token
     * @param string $provider_name
     * @param string $provider_token
     * @return boolean
     */
    public function register($user, $token, $provider_name, $provider_token)
    {
        if ((!$user) || (!$token) || (!$provider_name)) {
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
            '-'.env('APP_INVITATION_EXPIRE', 60).' minutes'
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
        $secret = $this->providers[$provider_name]($provider_token);
        Log::info(json_encode([
            'service' => get_class($this).'#register',
            'result' => !!$secret,
            'user_id' => $user->id,
            'token' => $token,
            'provider_name' => $provider_name,
            'provider_token' => substr($provider_token, 0, 10).'...',
        ]));
        if (!$secret) {
            return false;
        }
        $hashed = $this->hashProviderSecret($provider_name, $secret);
        AuthProvider::updateOrCreate(
            ['user_id' => $user->id, 'provider' => $provider_name],
            ['secret' => $hashed]
        );
        Auth::login($user);
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
            return false;
        }
        $secret = $this->providers[$provider_name]($provider_token);
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
        return hash('sha256', $provider_name.$secret.env('APP_KEY'));
    }
}
