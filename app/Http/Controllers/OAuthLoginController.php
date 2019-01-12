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
     * Show page of login with OAuth provider.
     *
     * @param Request $request
     * @param string $provider
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $provider)
    {
        return view('auth.oauth.login_'.$provider);
    }

    /**
     * Login with OAuth provider.
     *
     * @param Request $request
     * @param string $provider
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request, $provider)
    {
        $provider_token = $request->input('provider_token');
        $ret = $this->svc->login($provider, $provider_token);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }
}
