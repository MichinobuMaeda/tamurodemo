<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;
use App\Http\ResponseFormatter as Resp;

class AuthAsUserManagerMiddleware
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
        $user_id = (int)(end($route)['user_id']);
        $user = $request->user();

        if (($user->id == $user_id))
        {
            return $next($request);
        }

        $groups = [];

        foreach ($user->managerOf as $group)
        {
            if (($group->role == 'top') || ($group->role == 'base'))
            {
                $groups[] = $group->id;
            }
        }

        return DB::table('members')
            ->where('user_id', $user_id)
            ->whereIn('group_id', $groups)
            ->exists() ? $next($request) : Resp::forbidden_403();
    }
}
