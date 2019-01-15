<?php

namespace App\Services;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Notifications\InvitationMailNotification;
use App\Group;
use App\User;
use App\AuthProvider;

class UsersService
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
     * List accounts of which the user is the manager.
     * 
     * @param  string $orderBy default 'name'
     * @param  string $orderDir 'asc' (default) or 'desc'
     * @return Collection
     */
    public function list($orderBy='name', $orderDir='asc')
    {
        $user = Auth::user();
        if ($user->isManagerOfAll()) {
            return User::orderBy($orderBy, $orderDir)->get();
        }
        return User::join('members', 'users.id', '=', 'members.user_id')
            ->join('group_managers', 'members.group_id', '=', 'group_managers.group_id')
            ->where('group_managers.user_id', '=', $user->id)
            ->orderBy($orderBy, $orderDir)
            ->get();
    }

    /**
     * List login methods of each user.
     * 
     * @return array
     */
    public function listLoginMethods()
    {
        $ret = [];
        foreach (AuthProvider::all() as $item) {
            $ret[] = ''.$item->user_id."\t".$item->provider;
        }
        return $ret;
    }

    /**
     * List login methods of each user.
     * 
     * @param App\User $user
     * @return array
     */
    public function listUserLoginMethods($user)
    {
        $ret = [];
        foreach (AuthProvider::where('user_id', $user->id)->get() as $item) {
            $ret[] = $item->provider;
        }
        return $ret;
    }

    /**
     * Save user's profiles.
     * 
     * @param App\User $user
     * @param string $name
     * @param string $desc
     * @param string $timezone
     * @return null
     */
    public function saveProfile($user, $name, $desc, $timezone)
    {
        $user->name = $name;
        $user->desc = $desc;
        $user->timezone = $timezone ? $timezone : config('tamuro.default_timezone');
        $user->save();
        $user->refresh();
    }

    /**
     * Save user's managing Groups.
     * 
     * @param App\User $user
     * @param string $ids
     * @return null
     */
    public function saveManagingGroups($user, $ids)
    {
        foreach ($user->managingGroups()->get() as $item) {
            if (in_array($item->id, $ids)) {
                $key = array_search($item->id, $ids);
                if (false !== $key) {
                    unset($ids[$key]);
                }
            } else {
                $user->managingGroups()->detach($item->id);
                Log::debug('detach: '.$item->id);
            }
        }
        foreach ($ids as $id) {
            $user->managingGroups()->attach($id);
            Log::debug('attach: '.$id);
        }
    }

    /**
     * Save user's Groups.
     * 
     * @param App\User $user
     * @param string $ids
     * @return null
     */
    public function saveGroups($user, $ids)
    {
        foreach ($user->groups()->get() as $item) {
            if (in_array($item->id, $ids)) {
                $key = array_search($item->id, $ids);
                if (false !== $key) {
                    unset($ids[$key]);
                }
            } else {
                $user->groups()->detach($item->id);
            }
        }
        foreach ($ids as $id) {
            $user->groups()->attach($id);
        }
    }

    /**
     * Create user.
     * 
     * @param App\Group $group
     * @param integer $higher
     * @param string $name
     * @param string $desc
     * @param string $timezone
     * @return null
     */
    public function create($higher, $name, $desc, $timezone)
    {
        $group = Group::find($higher);
        $model = $group->members()->create([
            'name' => $name,
            'email' => '|'.User::unique(),
            'password' => Hash::make(User::unique()),
            'desc' => $desc,
            'timezone' => $timezone ? $timezone : config('tamuro.default_timezone'),
        ]);
        return $model;
    }

    /**
     * Save user's e-mail address.
     * 
     * @param App\User $user
     * @param string $email
     * @return null
     */
    public function saveLoginEmail($user, $email)
    {
        $user->email = $email;
        $user->save();
        $user->refresh();
    }

    /**
     * Save user's e-mail address.
     * 
     * @param App\User $user
     * @param string $password
     * @return null
     */
    public function saveLoginPassword($user, $password)
    {
        $user->password = Hash::make($password ? $password : User::unique());
        $user->save();
        $user->refresh();
    }
}
