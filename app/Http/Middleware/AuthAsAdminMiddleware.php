<?php

namespace App\Http\Middleware;

use Closure;

use App\Http\ResponseFormatter as Resp;

class AuthAsAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param string $user_id
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        $is_admin = false;
        foreach ($user->memberOf as $group)
        {
            if ($group->role == 'admin')
            {
                $is_admin = true;
                break;
            }
        }
    
        return $is_admin ? $next($request) : Resp::forbidden_403();
    }
}
