<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\UsersService;
use App\Services\AuthenticationService;
use App\User;

class UsersController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(UsersService $us, AuthenticationService $is)
    {
        $this->middleware('auth');
        $this->us = $us;
        $this->is = $is;
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
        $sendBy= $request->input('sendBy');
        $this->is->invite($user, $sendBy);
        return redirect()->route('users.showInvited', [
            'user' => $user->id,
            'sendBy' => $sendBy
        ]);
    }

    /**
     * Show invited.
     *
     * @param Request $request
     * @param App\User $user
     * @param string $sendBy
     * @return \Illuminate\Http\Response
     */
    public function showInvited(Request $request, $user, $sendBy)
    {
        return view('users_invite', [
            'user' => $user,
            'sendBy' => $sendBy,
        ]);
    }
}
