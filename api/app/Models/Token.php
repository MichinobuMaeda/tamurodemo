<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    /**
     * Get the user that owns the token.
     */
    public function user()
    {
        return $this->belongsTo('App\Models\User');
    }
}
