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
     * List groups.
     * 
     * @param  string $orderBy default 'name'
     * @param  string $orderDir 'asc' (default) or 'desc'
     * @param boolean $withTrashed
     * @return Collection
     */
    public function list($orderBy='name', $orderDir='asc', $withTrashed=false)
    {
        return $withTrashed
            ? Group::withTrashed()->orderBy($orderBy, $orderDir)->get()
            : Group::orderBy($orderBy, $orderDir)->get();
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
     * Save the group's higher groups.
     * 
     * @param App\Group $group
     * @param string $ids
     * @return null
     */
    public function saveHigherGroups($group, $ids)
    {
        foreach ($group->higherGroups()->get() as $item) {
            if (in_array($item->id, $ids)) {
                $key = array_search($item->id, $ids);
                if (false !== $key) {
                    unset($ids[$key]);
                }
            } else {
                $group->higherGroups()->detach($item->id);
            }
        }
        foreach ($ids as $id) {
            $group->higherGroups()->attach($id);
        }
    }

    /**
     * Save the group's subgroups.
     * 
     * @param App\Group $group
     * @param string $ids
     * @return null
     */
    public function saveSubgroups($group, $ids)
    {
        foreach ($group->subgroups()->get() as $item) {
            if (in_array($item->id, $ids)) {
                $key = array_search($item->id, $ids);
                if (false !== $key) {
                    unset($ids[$key]);
                }
            } else {
                $group->subgroups()->detach($item->id);
            }
        }
        foreach ($ids as $id) {
            $group->subgroups()->attach($id);
        }
    }

    /**
     * Save the group's managers.
     * 
     * @param App\Group $group
     * @param string $ids
     * @return null
     */
    public function saveManagers($group, $ids)
    {
        foreach ($group->managers()->get() as $item) {
            if (in_array($item->id, $ids)) {
                $key = array_search($item->id, $ids);
                if (false !== $key) {
                    unset($ids[$key]);
                }
            } else {
                $group->managers()->detach($item->id);
            }
        }
        foreach ($ids as $id) {
            $group->managers()->attach($id);
        }
    }

    /**
     * Save the group's members.
     * 
     * @param App\Group $group
     * @param string $ids
     * @return null
     */
    public function saveMembers($group, $ids)
    {
        foreach ($group->members()->get() as $item) {
            if (in_array($item->id, $ids)) {
                $key = array_search($item->id, $ids);
                if (false !== $key) {
                    unset($ids[$key]);
                }
            } else {
                $group->members()->detach($item->id);
            }
        }
        foreach ($ids as $id) {
            $group->members()->attach($id);
        }
    }

    /**
     * Create group.
     * 
     * @param App\Group $group
     * @param integer $higher
     * @param string $name
     * @param string $desc
     * @return null
     */
    public function create($higher, $name, $desc)
    {
        $group = Group::find($higher);
        $model = $group->subgroups()->create([
            'name' => $name,
            'desc' => $desc,
        ]);
        return $model;
    }
}
