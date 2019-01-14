<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class GroupRole extends Model
{
    public const PRIMARY = 'primary';
    public const SYSADMIN = 'sysadmin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    protected $primaryKey = ['name', 'group_id'];
    public $incrementing = false;
}
