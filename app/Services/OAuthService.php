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
            'yahoo_jp' => function ($codeAndNonce) {
                // Get code and nonce.
                $a = preg_split('/\t/', $codeAndNonce);
                $code = $a[0];
                $nonce = $a[1];

                // Get access_token and id_token.
                $client = new \GuzzleHttp\Client();
                $response = $client->request(
                    'POST',
                    'https://auth.login.yahoo.co.jp/yconnect/v2/token',
                    [
                        'form_params' => [
                            'grant_type' => 'authorization_code',
                            'client_id' => env('YAHOO_JP_CLIENT_ID'),
                            'client_secret' => env('YAHOO_JP_SECRET'),
                            'code' => $code,
                            'redirect_uri' => env('YAHOO_JP_REDIRECT_URI'),
                        ],
                    ]
                );
                if ($response->getStatusCode() != 200) {
                    Log::warn('/yconnect/v2/token status: ' . $response->getStatusCode());
                    return null;
                }
                $data = json_decode($response->getBody());
                $access_token = $data->access_token;
                $id_token = $data->id_token;

                // Validate id_token
                $a = preg_split('/\./', $id_token);
                $header = json_decode($this->base64UrlDecode($a[0]));
                $payload = json_decode($this->base64UrlDecode($a[1]));

                $response = $client->request(
                    'GET',
                    'https://auth.login.yahoo.co.jp/yconnect/v2/public-keys'
                );
                if ($response->getStatusCode() != 200) {
                    Log::warn('/yconnect/v2/public-keys status: ' . $response->getStatusCode());
                    return null;
                }
                $data = json_decode($response->getBody(), TRUE);
                $public_key = $data[$header->kid];
                if (!$this->verifySignatureYahooJp($a[0], $a[1], $a[2], $public_key)) {
                    Log::warn('Invalid signature.');
                    return null;
                }
                if (!$this->verifyPayloadYahooJp($payload, $nonce, $_SERVER['REQUEST_TIME'])) {
                    return null;
                }

                $hash = hash('sha256', $access_token, true);
                $length = strlen($hash) / 2;
                $halfOfHash = substr($hash, 0, $length);
                if ($payload->at_hash != $this->base64UrlEncode($halfOfHash)) {
                    Log::warn('Invalid at_hash.');
                    return null;
                }
              
                // get sub ( user ID )
                $response = $client->request(
                    'GET',
                    'https://userinfo.yahooapis.jp/yconnect/v2/attribute',
                    [
                        'query' => ['access_token' => $access_token],
                    ]
                );
                if ($response->getStatusCode() != 200) {
                    Log::warn('/yconnect/v2/attribute status: ' . $response->getStatusCode());
                    return null;
                }
                $data = json_decode($response->getBody());
                return $data->sub;
            },
        ];
    }

    /**
     * Base64 URL Decode
     * @param string $data
     * @return String
     */
    public function base64UrlDecode($data)
    {
        $replaced = str_replace(array('-', '_'), array('+', '/'), $data);
        $lack = strlen($replaced) % 4;
        if ($lack > 0) {
            $replaced .= str_repeat("=", 4 - $lack);
        }
        return base64_decode($replaced);
    }

    /**
     * Base64 URL Encode
     * @param string $data
     * @return String
     */
    public function base64UrlEncode($data)
    {
        return preg_replace('/=*$/', '', strtr(base64_encode($data), '+/', '-_'));
    }

    /**
     * Validate signature of Yahoo! JAPAN.
     * @param string $header
     * @param string $payload
     * @param string $signature
     * @param string $publicKey
     * @return Boolean
     */
    public function verifySignatureYahooJp($header, $payload, $signature, $publicKey)
    {
        $data = $header . '.' . $payload;
        $decodedSignature = $this->base64UrlDecode($signature);
        $publicKeyId = openssl_pkey_get_public($publicKey);
        if (!$publicKeyId) {
            // failed to get public key resource
            return false;
        }
        $result = openssl_verify($data, $decodedSignature, $publicKeyId, 'RSA-SHA256');
        openssl_free_key($publicKeyId);
        if ($result !== 1) {
            // invalid signature
            return false;
        }
        return true;
    }

    public function verifyPayloadYahooJp($payload, $nonce, $unix_time) {

        if ($payload->iss != 'https://auth.login.yahoo.co.jp/yconnect/v2') {
            Log::warn('Invalid iss.');
            return false;
        }

        if (!in_array(env('YAHOO_JP_CLIENT_ID'), $payload->aud)) {
            Log::warn('Invalid aud.');
            return false;
        }

        if ($payload->nonce != $nonce) {
            Log::warn('Invalid nonce.');
            return false;
        }

        if ($payload->exp < $unix_time) {
            Log::warn('Invalid exp.');
            return false;
        }

        if ($payload->iat < ($unix_time - 600)) {
            Log::warn('Invalid iat.');
            return false;
        }

        return true;
    }

    /**
     * @param App\User $user
     * @param string $token
     * @param string $provider_name
     * @param string $provider_token
     * @return Boolean
     */
    public function register($user, $token, $provider_name, $provider_token)
    {
        if ((!$user) || (!$token) || (!$provider_name)) {
            Log::info(json_encode([
                'service' => get_class($this).'#register',
                'result' => false,
                'user_id' => ($user ? $user->id : null),
                'token' => $token,
                'provider_name' => $provider_name,
                'message' => 'missed parameter required',
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
