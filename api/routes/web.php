<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

// The route to authenticate.
$router->post(
    'tokens',
    'TokenController@create'
);

// Routes require authenticate.
$router->group(['middleware' => 'auth'], function () use ($router) {

    // Routes require the role of system administrator.
    $router->group(['middleware' => 'admin'], function () use ($router) {

        $router->get(
            'tokens',
            'TokenController@show'
        );
    
    });

    // Routes require the role of user manager.
    $router->group(['middleware' => 'userManager'], function () use ($router) {

        $router->put(
            'users/{user_id:[0-9]+}/certs/{provider}',
            'CertController@set'
        );
        
    });

    // Routes require the role of group manager.
    $router->group(['middleware' => 'groupManger'], function () use ($router) {

    });
});
