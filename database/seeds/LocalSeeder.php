<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\User;
use App\Group;

class LocalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // pri                  <--(manager) user00, user06
        // +---adm
        // |       user00
        // |       user05
        // +---group01          <--(manager) user01
        // |   |   user01
        // |   |   user04
        // |   +---group03      <--(manager) user03
        // |           user03
        // |           user08
        // +---group02
        //         user02
        //         user07

        $pri = Group::whereHas('roles', function ($query) {
            $query->where('name', 'primary');
        })->orderBy('id', 'asc')->first();

        $adm = Group::whereHas('roles', function ($query) {
            $query->where('name', 'sysadmin');
        })->orderBy('id', 'asc')->first();

        $user00 = User::find(1);
        $user00->password = Hash::make('Password00');
        $user00->save();

        $group01 = Group::create([
            'name' => 'group 01',
        ]);

        $group02 = Group::create([
            'name' => 'group 02',
        ]);

        $group03 = Group::create([
            'name' => 'group 03',
        ]);

        $user01 = User::create([
            'name'      => 'User 01',
            'email'     => 'user01@abc.def',
            'password'  => Hash::make('Password01'),
            'timezone'  => null,
        ]);

        $user02 = User::create([
            'name'      => 'User 02',
            'email'     => 'user02@abc.def',
            'password'  => Hash::make('Password02'),
            'timezone'  => 'Asia/Tokyo',
        ]);

        $user03 = User::create([
            'name'      => 'User 03',
            'email'     => 'user03@abc.def',
            'password'  => Hash::make('Password03'),
            'timezone'  => 'Europe/London',
        ]);

        $user04 = User::create([
            'name'      => 'User 04',
            'email'     => 'user04@abc.def',
            'password'  => Hash::make('Password04'),
            'timezone'  => null,
        ]);

        $user05 = User::create([
            'name'      => 'User 05',
            'email'     => 'user05@abc.def',
            'password'  => Hash::make('Password05'),
            'timezone'  => null,
        ]);

        $user06 = User::create([
            'name'      => 'User 06',
            'email'     => null,
            'password'  => Hash::make('Password06'),
            'timezone'  => null,
        ]);

        $user07 = User::create([
            'name'      => 'User 07',
            'email'     => 'user07@abc.def',
            'password'  => Hash::make($this->unique()),
            'timezone'  => null,
        ]);

        $user08 = User::create([
            'name'      => 'User 08',
            'email'     => null,
            'password'  => Hash::make($this->unique()),
            'timezone'  => null,
        ]);

        $pri->subGroups()->attach($group01);
        $pri->subGroups()->attach($group02);
        $group01->subGroups()->attach($group03);

        $adm->members()->attach($user05);
        $group01->members()->attach($user01);
        $group01->members()->attach($user04);
        $group02->members()->attach($user02);
        $group02->members()->attach($user07);
        $group03->members()->attach($user03);
        $group03->members()->attach($user08);

        $user06->groupsManaging()->attach($pri);
        $user01->groupsManaging()->attach($group01);
        $user03->groupsManaging()->attach($group03);
    }

    private function unique()
    {
        return hash('sha256', str_random(16).env('APP_KEY').(new DateTime())->format('Y-m-d\TH:i:s.u'));
    }
}
