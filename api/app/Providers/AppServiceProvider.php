<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\IdRepository;
use App\Repositories\CertRepository;
use App\Repositories\TokenRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('Certs', function ($app) { return new CertRepository(); });
        $this->app->singleton('Tokens', function ($app) { return new TokenRepository(); });
    }
}
