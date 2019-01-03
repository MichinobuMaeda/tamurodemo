<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            'users' => $this->svc->list($orderBy, $orderDir),
            'loginMethods' => $this->svc->listLoginMethods(),
            'orderBy' => $orderBy,
            'orderDir' => $orderDir,
        ]);
    }
}
