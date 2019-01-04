<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\UsersService;
use App\User;

class UsersController extends Controller
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
     * Show "Preference: Login" page.
     * 
     * @param Request $request
     * @return Response
     */
    public function showPreferenceLogin(Request $request)
    {
        return view('login_edit', [
            'loginMethods' => $this->svc->listUserLoginMethods(Auth::user()->id)
        ]);
    }

    /**
     * Save the logged-in user's e-mail address.
     * 
     * @param Request $request
     * @return Response
     */
    public function savePreferenceLoginEmail(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'nullable|email',
        ]);
        $this->svc->savePreferenceLoginEmail($request->input('email'));
        return redirect()->route('get.preferences.login');
    }

    /**
     * Save the logged-in user's password.
     * 
     * @param Request $request
     * @return Response
     */
    public function savePreferenceLoginPassword(Request $request)
    {
        $validatedData = $request->validate([
            'password' => ['nullable', 'confirmed', 'min:8', new \App\Rules\Password()],
        ]);
        $this->svc->savePreferenceLoginPassword($request->input('password'));
        return redirect()->route('get.preferences.login');
    }
}
