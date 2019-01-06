<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Services\PageHistoryService;

class PageController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Go back to the previous page .
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function back(Request $request)
    {
        $svc = new PageHistoryService($request->session());
        $url = $svc->back();
        return redirect()->away($url);
    }

    /**
     * Go forward to the next page .
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function forward(Request $request)
    {
        $svc = new PageHistoryService($request->session());
        $url = $svc->forward();
        return redirect()->away($url);
    }
}
