<?php

namespace App\Services;

use App\Group;

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
}
