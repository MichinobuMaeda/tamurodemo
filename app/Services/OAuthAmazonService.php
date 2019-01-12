<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class OAuthAmazonService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->conf = config('tamuro.oauth_amazon');
    }

    /**
     * Validate provider token and get account id.
     * 
     * @param string $params
     * @return string
     */
    public function validate($params)
    {
        // Get code and redirect_uri.
        $a = preg_split('/\t/', $params);
        $code = $a[0];
        $redirect_uri = $a[1];

        // Get access_token and id_token.
        $client = new \GuzzleHttp\Client();
        $response = $client->request(
            'POST',
            'https://api.amazon.com/auth/o2/token',
            [
                'form_params' => [
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'client_id' => $this->conf['client_id'],
                    'client_secret' => $this->conf['secret'],
                ],
            ]
        );
        if ($response->getStatusCode() != 200) {
            Log::warn(
                'https://api.amazon.com/auth/o2/token status: '.
                $response->getStatusCode()
            );
            return null;
        }
        $data = json_decode($response->getBody());
        $access_token = $data->access_token;
        
        // get user_id
        $response = $client->request(
            'GET',
            'https://api.amazon.com/user/profile',
            [
                'query' => ['access_token' => $access_token],
            ]
        );
        if ($response->getStatusCode() != 200) {
            Log::warn(
                'https://api.amazon.com/user/profile status: '.
                $response->getStatusCode()
            );
            return null;
        }
        $data = json_decode($response->getBody());
        return $data->user_id;
    }
}
