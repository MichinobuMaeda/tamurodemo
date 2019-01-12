<?php

namespace App\Services;

use DateTime;
use Illuminate\Support\Facades\Log;

class OAuthYahooJpService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->conf = config('tamuro.oauth_yahoo_jp');
    }

    /**
     * Validate provider token and get account id.
     * 
     * @param string $params
     * @return string
     */
    public function validate($params)
    {
        $conf = config('services.oauth_yahoo_jp');
        // Get code, nonce and redirect_uri.
        $a = preg_split('/\t/', $params);
        $code = $a[0];
        $nonce = $a[1];
        $redirect_uri = $a[2];

        // Get access_token and id_token.
        $client = new \GuzzleHttp\Client();
        $response = $client->request(
            'POST',
            'https://auth.login.yahoo.co.jp/yconnect/v2/token',
            [
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'client_id' => $this->conf['client_id'],
                    'client_secret' => $this->conf['secret'],
                    'code' => $code,
                    'redirect_uri' => $redirect_uri,
                ],
            ]
        );
        if ($response->getStatusCode() != 200) {
            Log::warn(
                'https://auth.login.yahoo.co.jp/yconnect/v2/token status: '.
                $response->getStatusCode());
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
            Log::warn(
                'https://auth.login.yahoo.co.jp/yconnect/v2/public-keys status: '.
                $response->getStatusCode()
            );
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
            Log::warn(
                'https://userinfo.yahooapis.jp/yconnect/v2/attribute status: '.
                $response->getStatusCode()
            );
            return null;
        }
        $data = json_decode($response->getBody());
        return $data->sub;
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

        if (!in_array($this->conf['client_id'], $payload->aud)) {
            Log::warn('Invalid aud.' . json_encode($payload));
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
}
