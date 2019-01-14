<?php

namespace App\Services;

use App\Group;
use App\User;

class GroupsService
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
     * Save group's profiles.
     * 
     * @param App\Group $group
     * @param string $name
     * @param string $desc
     * @return null
     */
    public function saveProfile($group, $name, $desc)
    {
        $group->name = $name;
        $group->desc = $desc;
        $group->save();
    }

    /**
     * Create group.
     * 
     * @param App\Group $group
     * @param integer $upper
     * @param string $name
     * @param string $desc
     * @return null
     */
    public function create($upper, $name, $desc)
    {
        $group = Group::find($upper);
        $model = $group->subGroups()->create([
            'name' => $name,
            'desc' => $desc,
        ]);
        return $model;
    }
}
