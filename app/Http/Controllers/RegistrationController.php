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
    public function __construct(OAuthService $rs)
    {
        $this->middleware('guest');
        $this->rs = $rs;
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
        $ret = $this->rs->register($user, $token, $provider_name, $provider_token);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }
}
