<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\EMailLoginService;
use App\User;

class EMailLoginController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(EMailLoginService $svc)
    {
        $this->middleware('guest');
        $this->svc = $svc;
    }

    /**
     * Send login token by e-mail.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request)
    {
        return view('login_email', ['sent' => !!$request->input('sent')]);
    }

    /**
     * Send login token by e-mail.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function send(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|email',
        ]);
        $this->svc->send($request->input('email'));
        return redirect()->route('login.email', ['sent' => 'true']);
    }

    /**
     * Login by token.
     *
     * @param Request $request
     * @param App\User $user
     * @param String $token
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request, User $user, $token)
    {
        $ret = $this->svc->login($user, $token);
        return redirect()->route('home');
    }
}
