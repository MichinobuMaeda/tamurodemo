<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\InvitationService;
use App\User;

class InvitationController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(InvitationService $svc)
    {
        $this->middleware('auth');
        $this->svc = $svc;
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
        $this->svc->invite($user, $sendBy);
        return redirect()->route('get.invitation', [
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
    public function show(Request $request, $user, $sendBy)
    {
        return view('users_invite', [
            'user' => $user,
            'sendBy' => $sendBy,
        ]);
    }
}
