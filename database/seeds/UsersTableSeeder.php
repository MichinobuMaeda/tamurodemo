<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\User;
use App\Group;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create the primary user.
        $user = User::create([
            'name'      => 'Primary user',
            'email'     => env('APP_PRIMARY_USER_EMAIL'),
            'password'  => Hash::make(env('APP_PRIMARY_USER_PASSWORD')),
            'timezone'  => env('APP_DEFAULT_TIMEZONE', 'UTC'),
        ]);

        // The primary user is a system administrator.
        foreach (Group::whereHas('roles', function ($query) {
            $query->where('name', 'sysadmin');
        })->get() as $group) {
            $user->groups()->attach($group);
        }

        // The primary user is a manager of the primary group.
        foreach (Group::whereHas('roles', function ($query) {
            $query->where('name', 'primary');
        })->get() as $group) {
            $user->groupsManaging()->attach($group);
        }
    }
}
