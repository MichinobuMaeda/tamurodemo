<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\UsersService;
use App\Services\OAuthService;
use App\Services\PageHistoryService;
use App\User;

class PreferencesController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param UsersService
     * @param OAuthService
     * @return void
     */
    public function __construct(UsersService $svc, OAuthService $oauth)
    {
        $this->middleware('auth');
        $this->svc = $svc;
        $this->oauth = $oauth;
    }

    /**
     * Show "Preference: Login" page.
     * 
     * @param Request $request
     * @return Response
     */
    public function showEditLoginForm(Request $request)
    {
        return view('preferences_login', [
            'loginMethods' => $this->svc->listUserLoginMethods(Auth::user()),
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

    /**
     * Show "Preference: <OAuth provider name>" page.
     * 
     * @param Request $request
     * @param string $provider
     * @return Response
     */
    public function showOAuthProviders(Request $request, $provider)
    {
        return view('auth.oauth.login_'.$provider);
    }

    /**
     * Set the logged-in user's OAuth provider.
     * 
     * @param Request $request
     * @param string $provider
     * @return Response
     */
    public function setLoginProvider(Request $request, $provider)
    {
        $provider_token = $request->input('provider_token');
        $ret = $this->oauth->set(Auth::user(), $provider, $provider_token);
        return response($ret ? 'ok' : 'ng', 200)->header('Content-Type', 'text/plain');
    }

    /**
     * Reset the logged-in user's OAuth provider.
     * 
     * @param Request $request
     * @param string $provider
     * @return Response
     */
    public function resetLoginProvider(Request $request, $provider)
    {
        $this->oauth->reset(Auth::user(), $provider);
        return redirect()->route('preferences.login');
    }
}
