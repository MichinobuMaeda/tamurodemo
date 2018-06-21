<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cert extends Model
{
    /**
     * Get the user that owns the cert.
     */
    public function user()
    {
        return $this->belongsTo('App\Models\User');
    }
}
