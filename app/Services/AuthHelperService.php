<?php

namespace App\Services;

use DateTime;

class AuthHelperService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Generate initial password.
     * 
     * @return string
     */
    public function generateCredential($id='') {
        return hash('sha512', env('APP_KEY').((new DateTime())->format('Y-m-dTH:i:s.u')).$id);
    }
}
