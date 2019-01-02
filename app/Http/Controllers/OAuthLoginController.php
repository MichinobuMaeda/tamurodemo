<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\OAuthService;
use App\User;

class OAuthLoginController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(OAuthService $svc)
    {
        $this->middleware('guest');
        $this->svc = $svc;
    }

    /**
     * Login with OAuth provider.
     *
     * @param Request $request
     * @param App\User $user
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $provider_name = $request->input('provider_name');
        $provider_token = $request->input('provider_token');
        $ret = $this->svc->login($provider_name, $provider_token);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }
}
