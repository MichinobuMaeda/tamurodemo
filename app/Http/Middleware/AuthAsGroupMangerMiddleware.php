<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;
use App\Http\ResponseFormatter as Resp;

class AuthAsGroupMangerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        // workaround: $request->route() of lumen return array not Route.
        $route = $request->route();
        $group_id = (int)(end($route)['group_id']);
        $user = $request->user();

        $is_owner = false;

        foreach ($user->managerOf as $group)
        {
            if ($group->id == $group_id )
            {
                $is_owner = true;
                break;
            }
        }

        return $is_owner ? $next($request) : Resp::forbidden_403();
    }
}
