<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class OAuthGoogleService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->conf = config('tamuro.oauth_google');
    }

    /**
     * Validate provider token and get account id.
     * 
     * @param string $id_token
     * @return string
     */
    public function validate($id_token)
    {
        $client = new \Google_Client(['client_id' => $this->conf['client_id']]);
        $payload = $client->verifyIdToken($id_token);
        return $payload ? $payload['sub'] : null;
    }
}
