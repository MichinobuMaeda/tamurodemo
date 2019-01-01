<?php

use Illuminate\Database\Seeder;
use App\Group;
use App\GroupRole;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create the primary group which is the super-group of all groups.
        $pri = Group::create([
            'name' => 'Primary group',
        ]);
        $pri->roles()->save(new GroupRole(['name' => 'primary']));

        // Create the group of system administrators.
        $adm = Group::create([
            'name' => 'System administrators',
        ]);
        $adm->roles()->save(new GroupRole(['name' => 'sysadmin']));

        // The group of system administrators is a sub-group of the primary group.
        $pri->subGroups()->attach($adm);
    }
}
