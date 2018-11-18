<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\AuthenticationService;
use App\User;

class AuthenticationController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(AuthenticationService $as)
    {
        $this->middleware('guest');
        $this->as = $as;
        $this->providers = [
            'google' => function ($id_token) {
                $client = new \Google_Client(['client_id' => env('GOOGLE_CLIENT_ID')]);
                $payload = $client->verifyIdToken($id_token);
                return $payload ? $payload['sub'] : null;
            },
        ];
    }

    /**
     * View invitation.
     *
     * @param Request $request
     * @param App\User $user
     * @param String $token
     * @return \Illuminate\Http\Response
     */
    public function viewInvitation(Request $request, $user, $token)
    {
        if ($user && ($user->invitation_token == $token)) {
            return view('invitation', [
                'user' => $user,
                'token' => $token,
            ]);
        } else {
            return redirect()->route('home');
        }
    }

    /**
     * Register OAuth provider and secret.
     *
     * @param Request $request
     * @param App\User $user
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request, $user)
    {
        $token = $request->input('token');
        $provider_name = $request->input('provider_name');
        $provider_token = $request->input('provider_token');
        $ret = $this->as->register($user, $token, $provider_name, $provider_token, $this->providers);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }

    /**
     * Login with OAuth provider.
     *
     * @param Request $request
     * @param App\User $user
     * @return \Illuminate\Http\Response
     */
    public function oAuthLogin(Request $request)
    {
        $provider_name = $request->input('provider_name');
        $provider_token = $request->input('provider_token');
        $ret = $this->as->loginWithOAuthProvider($provider_name, $provider_token, $this->providers);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }
}
