<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'key',
        'locale',
        'message',
    ];

    protected $primaryKey = ['key', 'lang'];
    public $incrementing = false;
}
