<?php

namespace Tests\Unit;

use DateTime;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Group;
use App\GroupRole;

class UnitTestHelper
{
    const HTTP_RESP_STT_FORBIDDEN = 403;
    /**
     * Create a new rule instance.
     *
     * @param  TestCase $test
     * @return void
     */
    public function __construct($test)
    {
        $this->test = $test;
    }

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function prepareGroupsAndUsers()
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

        DB::transaction(function () {

            // Create the primary group which is the super-group of all groups.
            $this->test->pri = Group::create([
                'name' => 'Primary group',
            ]);
            $this->test->pri->roles()->save(new GroupRole(['name' => 'primary']));

            // Create the group of system administrators.
            $this->test->adm = Group::create([
                'name' => 'System administrators',
            ]);
            $this->test->adm->roles()->save(new GroupRole(['name' => 'sysadmin']));

            // The group of system administrators is a sub-group of the primary group.
            $this->test->pri->subGroups()->attach($this->test->adm);

            // Create the primary user.
            $this->test->user00 = User::create([
                'name'      => 'Primary user',
                'email'     => env('APP_PRIMARY_USER_EMAIL'),
                'password'  => Hash::make('Password00'),
                'timezone'  => env('APP_DEFAULT_TIMEZONE', 'UTC'),
            ]);
    
            // The primary user is a manager of the primary group.
            $this->test->user00->groupsManaging()->attach($this->test->pri);

            // The primary user is a system administrator.
            $this->test->user00->groups()->attach($this->test->adm);

            $this->test->group01 = Group::create([
                'name' => 'group 01',
            ]);

            $this->test->group02 = Group::create([
                'name' => 'group 02',
            ]);

            $this->test->group03 = Group::create([
                'name' => 'group 03',
            ]);

            $this->test->user01 = User::create([
                'name'      => 'User 01',
                'email'     => 'user01@abc.def',
                'password'  => Hash::make('Password01'),
                'timezone'  => null,
            ]);

            $this->test->user02 = User::create([
                'name'      => 'User 02',
                'email'     => 'user02@abc.def',
                'password'  => Hash::make('Password02'),
                'timezone'  => 'Asia/Tokyo',
            ]);

            $this->test->user03 = User::create([
                'name'      => 'User 03',
                'email'     => 'user03@abc.def',
                'password'  => Hash::make('Password03'),
                'timezone'  => 'Europe/London',
            ]);

            $this->test->user04 = User::create([
                'name'      => 'User 04',
                'email'     => 'user04@abc.def',
                'password'  => Hash::make('Password04'),
                'timezone'  => null,
            ]);

            $this->test->user05 = User::create([
                'name'      => 'User 05',
                'email'     => 'user05@abc.def',
                'password'  => Hash::make('Password05'),
                'timezone'  => null,
            ]);

            $this->test->user06 = User::create([
                'name'      => 'User 06',
                'email'     => '|'.uniqid(),
                'password'  => Hash::make('Password06'),
                'timezone'  => null,
            ]);

            $this->test->user07 = User::create([
                'name'      => 'User 07',
                'email'     => 'user07@abc.def',
                'password'  => Hash::make(uniqid()),
                'timezone'  => null,
            ]);

            $this->test->user08 = User::create([
                'name'      => 'User 08',
                'email'     => '|'.uniqid(),
                'password'  => Hash::make(uniqid()),
                'timezone'  => null,
            ]);

            $this->test->pri->subGroups()->attach($this->test->group01);
            $this->test->pri->subGroups()->attach($this->test->group02);
            $this->test->group01->subGroups()->attach($this->test->group03);

            $this->test->adm->members()->attach($this->test->user05);
            $this->test->group01->members()->attach($this->test->user01);
            $this->test->group01->members()->attach($this->test->user04);
            $this->test->group02->members()->attach($this->test->user02);
            $this->test->group03->members()->attach($this->test->user07);
            $this->test->group03->members()->attach($this->test->user03);
            $this->test->group03->members()->attach($this->test->user08);

            $this->test->user06->groupsManaging()->attach($this->test->pri);
            $this->test->user01->groupsManaging()->attach($this->test->group01);
            $this->test->user03->groupsManaging()->attach($this->test->group03);
        });
    }
}
