<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\OAuthService;
use App\User;

class RegistrationController extends Controller
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
     * View invitation.
     *
     * @param Request $request
     * @param App\User $user
     * @param string $token
     * @param string $provider_name ( optional )
     * @return \Illuminate\Http\Response
     */
    public function viewInvitation(Request $request, $user, $token, $provider_name = null)
    {
        if ($user && ($user->invitation_token == $token)) {
            if ($provider_name ) {
                return view('auth.oauth.login_'.$provider_name, [
                    'user' => $user,
                    'token' => $token,
                ]);
            } else {
                return view('auth.invitation', [
                    'user' => $user,
                    'token' => $token,
                ]);
            }
        } else {
            return redirect()->route('home');
        }
    }

    /**
     * Register OAuth provider and secret.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        $user = User::find($request->input('user'));
        $token = $request->input('token');
        $provider_name = $request->input('provider_name');
        $provider_token = $request->input('provider_token');
        $ret = $this->svc->register($user, $token, $provider_name, $provider_token);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }
}
