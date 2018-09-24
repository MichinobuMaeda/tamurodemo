<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

use App\Group;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'timezone', 'sysadmin',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * Get groups the user belongs to.
     * 
     * @return collection
     */
    public function groups()
    {
        return $this->belongsToMany('App\Group', 'members', 'user_id', 'group_id');
    }

    /**
     * Get groups the user manages.
     * 
     * @return collection
     */
    public function groupsManaging()
    {
        return $this->belongsToMany('App\Group', 'group_managers', 'user_id', 'group_id');
    }

    /**
     * Is the user a manager of primary group?
     * 
     * @return boolean
     */
    public function isManagerOfAll() {
        return !!count($this->groupsManaging()->whereHas('roles', function ($query) {
            $query->where('name', 'primary');
        })->get());
    }

    /**
     * Is the user a system administrator?
     * 
     * @return boolean
     */
    public function isSysAdmin() {
        return !!count($this->groups()->whereHas('roles', function ($query) {
            $query->where('name', 'sysadmin');
        })->get());
    }

    /**
     * Is the user a manager of the object?
     * 
     * @return boolean
     */
    public function isManagerOf($obj) {
        if ($this->isManagerOfAll()) {
            return true;
        }
        if ($obj instanceof Group) {
            foreach ($obj->managers as $manager) {
                if ($this->id == $manager->id) {
                    return true;
                }
            }
        } else if ($obj instanceof User) {
            foreach ($obj->groups as $group) {
                foreach ($group->managers as $manager) {
                    if ($this->id == $manager->id) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}
