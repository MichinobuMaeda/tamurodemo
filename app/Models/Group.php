<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    /**
     * Get sub groups of the group.
     */
    public function subGroups()
    {
        return $this->belongsToMany(
            'App\Models\Group', 'sub_groups', 'group_id', 'sub_group_id');
    }

    /**
     * Get groups the group belongs to.
     */
    public function upperGroups()
    {
        return $this->belongsToMany(
            'App\Models\Group', 'sub_groups', 'sub_group_id', 'group_id');
    }

    /**
     * Get owners of the group.
     */
    public function owners()
    {
        return $this->belongsToMany(
            'App\Models\User', 'group_owners', 'group_id', 'user_id');
    }

    /**
     * Get members that belongs to the group.
     */
    public function members()
    {
        return $this->belongsToMany(
            'App\Models\User', 'members', 'group_id', 'user_id');
    }
}
