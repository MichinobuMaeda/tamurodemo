<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\SysAdminService;

class SysAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param SysAdminService
     * @return void
     */
    public function __construct(SysAdminService $svc)
    {
        $this->middleware('auth');
        $this->middleware('can:system.administrate');
        $this->svc = $svc;
    }

    /**
     * Show the system administrator's menu.
     * 
     * @param Request $request
     * @return Response
     */
    public function showMenu(Request $request)
    {
        return view('sysadmin.menu');
    }
}
