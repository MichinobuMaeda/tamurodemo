<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get owners of the group.
     */
    public function groupsOwned()
    {
        return $this->belongsToMany(
            'App\Models\Group', 'group_owners', 'user_id', 'group_id');
    }

    /**
     * Get members that belongs to the group.
     */
    public function groups()
    {
        return $this->belongsToMany(
            'App\Models\Group', 'members', 'user_id', 'group_id');
    }
}
