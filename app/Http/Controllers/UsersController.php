<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UsersService;

class UsersController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(UsersService $us)
    {
        $this->middleware('auth');
        $this->us = $us;
    }

    /**
     * Show user list.
     *
     * @param Request $request
     * @param string $orderBy (optional) column name
     * @param string $orderDir (optional) 'asc' or 'desc'
     * @return \Illuminate\Http\Response
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
            'users' => $this->us->list($orderBy, $orderDir),
            'orderBy' => $orderBy,
            'orderDir' => $orderDir,
        ]);
    }

    /**
     * Invite user.
     *
     * @param Request $request
     * @param App\User $user
     * @return \Illuminate\Http\Response
     */
    public function invite(Request $request, $user)
    {
        $provider = $request->input('provider');
        $this->us->invite($user, $provider);
        return redirect()->route('users.showInvitation', [
            'user' => $user->id,
            'provider' => $provider
        ]);
    }

    /**
     * Show invitation.
     *
     * @param Request $request
     * @param App\User $user
     * @param string $provider
     * @return \Illuminate\Http\Response
     */
    public function showInvitation(Request $request, $user, $provider)
    {
        return view('users_invite_'.$provider, [
            'user' => $user,
        ]);
    }
}
