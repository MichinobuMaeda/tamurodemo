<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\UsersService;
use App\User;

class PreferencesController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(UsersService $svc)
    {
        $this->middleware('auth');
        $this->svc = $svc;
    }

    /**
     * Show "Preference: Login" page.
     * 
     * @param Request $request
     * @return Response
     */
    public function showLogin(Request $request)
    {
        return view('preferences_login', [
            'loginMethods' => $this->svc->listUserLoginMethods(Auth::user())
        ]);
    }

    /**
     * Save the logged-in user's e-mail address.
     * 
     * @param Request $request
     * @return Response
     */
    public function saveLoginEmail(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'nullable|email',
        ]);
        $this->svc->saveLoginEmail(Auth::user(), $request->input('email'));
        return redirect()->route('preferences.login');
    }

    /**
     * Save the logged-in user's password.
     * 
     * @param Request $request
     * @return Response
     */
    public function saveLoginPassword(Request $request)
    {
        $validatedData = $request->validate([
            'password' => ['nullable', 'confirmed', 'min:8', new \App\Rules\Password()],
        ]);
        $this->svc->saveLoginPassword(Auth::user(), $request->input('password'));
        return redirect()->route('preferences.login');
    }
}
