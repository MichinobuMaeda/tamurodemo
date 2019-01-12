<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\User;
use App\Group;

class UserSeeder extends Seeder
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
            'email'     => config('tamuro.primary_user_email'),
            'password'  => Hash::make(config('tamuro.primary_user_password')),
            'timezone'  => config('tamuro.default_timezone'),
        ]);

        // The primary user is a manager of the primary group.
        $pri = Group::whereHas('roles', function ($query) {
            $query->where('name', 'primary');
        })->orderBy('id', 'asc')->first();
        $user->groupsManaging()->attach($pri);

        // The primary user is a system administrator.
        $adm = Group::whereHas('roles', function ($query) {
            $query->where('name', 'sysadmin');
        })->orderBy('id', 'asc')->first();
        $user->groups()->attach($adm);
    }
}
