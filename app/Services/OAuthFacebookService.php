<?php

namespace App\Services;

use Facebook\Facebook;
use Illuminate\Support\Facades\Log;

class OAuthFacebookService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->conf = config('tamuro.oauth_facebook');
    }

    /**
     * Validate provider token and get account id.
     * 
     * @param string $access_token
     * @return string
     */
    public function validate($access_token)
    {
        try {
            $fb = new Facebook([
                'app_id' => $this->conf['app_id'],
                'app_secret' => $this->conf['app_secret'],
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
    }
}
