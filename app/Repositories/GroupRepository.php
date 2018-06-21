<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use App\Models\Group;
use App\Models\User;

class GroupRepository
{
    /**
     * Get the group.
     *
     * @param string $group_id.
     * @return Group.
     */
    public function get($group_id)
    {
        return Group::where('group_id', $group_id);
    }

    /**
     * Create a sub group of the group.
     * 
     * @param string $group_id.
     * @param string $name.
     * @param string $note.
     * @param string $role.
     * @return Group.
     */
    public function createSubGroup($group_id, $name, $note, $role)
    {
        $group = $this->get($group_id);
        if (!$group)
        {
            return null;
        }
        DB::transaction(function () {
            $sub = new Group;
            $sub->name = $name;
            $sub->note = $note;
            $sub->role = $role;
            $sub->save();
            $group->subGroups()->attach($sub);
        }, 5);
        return $this->get($group_id);
    }

    /**
     * Create a member of the group.
     * 
     * @param string $group_id.
     * @param string $name.
     * @param string $note.
     * @return Group.
     */
    public function createMember($group_id, $name, $note)
    {
        $group = $this->get($group_id);
        if (!$group)
        {
            return null;
        }
        DB::transaction(function () {
            $user = new User;
            $user->name = $name;
            $user->note = $note;
            $user->save();
            $group->subGroups()->attach($user);
        }, 5);
        return $this->get($group_id);
    }
}
