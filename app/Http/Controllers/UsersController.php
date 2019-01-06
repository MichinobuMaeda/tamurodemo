<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\UsersService;
use App\Services\OAuthService;
use App\Services\PageHistoryService;
use App\User;

class UsersController extends Controller
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
     * Show user list.
     *
     * @param Request $request
     * @param string $orderBy (optional) column name
     * @param string $orderDir (optional) 'asc' or 'desc'
     * @return Response
     */
    public function list(Request $request, $orderBy=null, $orderDir=null)
    {
        if ($orderBy) {
            session(['users_list.orderBy' => $orderBy]);
        }
        if ($orderDir) {
            session(['users_list.orderDir' => $orderDir]);
        }
        $orderBy = session('users_list.orderBy', 'name');
        $orderDir = session('users_list.orderDir', 'asc');

        return view('users_list', [
            'users' => $this->svc->list($orderBy, $orderDir),
            'loginMethods' => $this->svc->listLoginMethods(),
            'orderBy' => $orderBy,
            'orderDir' => $orderDir,
        ]);
    }

    /**
     * Show the user's login methods.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function showLogin(Request $request, $user)
    {
        if ($user->id == Auth::user()->id) {
            $svc = new PageHistoryService($request->session());
            $url = $svc->back();
                return redirect()->route('preferences.login');
        }
        return view('user_login', [
            'user' => $user,
            'loginMethods' => $this->svc->listUserLoginMethods($user),
        ]);
    }

    /**
     * Save the user's e-mail address.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function saveLoginEmail(Request $request, $user)
    {
        $validatedData = $request->validate([
            'email' => 'nullable|email',
        ]);
        $this->svc->saveLoginEmail($user, $request->input('email'));
        return redirect()->route('user.login', ['user' => $user->id]);
    }

    /**
     * Reset the user's OAuth provider.
     * 
     * @param Request $request
     * @param App\User $user
     * @param string $provider
     * @return Response
     */
    public function resetLoginProvider(Request $request, $user, $provider)
    {
        $this->oauth->reset($user, $provider);
        return redirect()->route('user.login', ['user' => $user->id]);
    }
}
