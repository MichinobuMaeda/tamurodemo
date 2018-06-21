<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Boot the authentication services for the application.
     *
     * @return void
     */
    public function boot()
    {
        $this->app['auth']->viaRequest('api', function ($request) {

            // get the token.
            $signature = $request->header(env('TOKEN_HEADER'), null);
            Log::info('token: '.$signature);

            return $signature
                ? $this->app->make('Tokens')->touch($signature)
                : null;
        });
    }
}
