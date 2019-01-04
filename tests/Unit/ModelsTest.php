<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use App\Group;
use App\GroupRole;
use App\User;

class ModelsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The test of method setTimezone().
     *
     * @return void
     */
    public function testGroupAndUser()
    {
        $group1 = Group::create([
            'name'      => 'Group 1',
        ]);
        $this->assertEquals(0, count($group1->roles));
        $this->assertEquals(0, count($group1->superGroups));
        $this->assertEquals(0, count($group1->subGroups));
        $this->assertEquals(0, count($group1->members));
        $this->assertEquals(0, count($group1->managers));

        $group2 = Group::create([
            'name'      => 'Group 2',
        ]);
        $this->assertEquals(0, count($group2->roles));
        $this->assertEquals(0, count($group2->superGroups));
        $this->assertEquals(0, count($group2->subGroups));
        $this->assertEquals(0, count($group2->members));
        $this->assertEquals(0, count($group2->managers));

        $group3 = Group::create([
            'name'      => 'Group 3',
        ]);
        $this->assertEquals(0, count($group3->roles));
        $this->assertEquals(0, count($group3->superGroups));
        $this->assertEquals(0, count($group3->subGroups));
        $this->assertEquals(0, count($group3->members));
        $this->assertEquals(0, count($group3->managers));

        $user1 = User::create([
            'name'      => 'User 1',
            'email'     => 'user1@abc.def',
            'password'  => 'password1',
            'timezone'  => null
        ]);
        $this->assertEquals(0, count($user1->groups));
        $this->assertEquals(0, count($user1->groupsManaging));

        $user2 = User::create([
            'name'      => 'User 2',
            'email'     => 'user2@abc.def',
            'password'  => 'password2',
            'timezone'  => 'Asia/Tokyo'
        ]);
        $this->assertEquals(0, count($user2->groups));
        $this->assertEquals(0, count($user2->groupsManaging));

        $user3 = User::create([
            'name'      => 'User 3',
            'email'     => 'user3@abc.def',
            'password'  => 'password3',
            'timezone'  => 'Europe/London'
        ]);
        $this->assertEquals(0, count($user3->groups));
        $this->assertEquals(0, count($user3->groupsManaging));

        $unique = [];
        foreach (range(0, 99) as $i) {
            $unique[] = User::unique();
        }
        foreach ($unique as $item) {
            $this->assertEquals(256 / 8 * 2, strlen($item));
        }
        for ($i = 1; $i < count($unique); ++$i) {
            for ($j = $i; $j < count($unique); ++$j) {
                $this->assertNotEquals($unique[$i-1], $unique[$j]);
            }
        }

        // Test relationships.

        $role1 = $group1->roles()->save(new GroupRole(['name' => 'primary']));
        $role2 = $group1->roles()->save(new GroupRole(['name' => 'Role 2']));
        $role3 = $group2->roles()->save(new GroupRole(['name' => 'sysadmin']));

        $group1->load('roles');
        $group2->load('roles');
        $group3->load('roles');

        $this->assertEquals(2, count($group1->roles));
        $this->assertEquals(1, count($group2->roles));
        $this->assertEquals(0, count($group3->roles));

        $names = [$group1->roles[0]->name, $group1->roles[1]->name];
        sort($names);
        $this->assertEquals([$role2->name, $role1->name], $names);
        $this->assertEquals($role3->name, $group2->roles[0]->name);

        $group1->subGroups()->attach($group2);
        $group3->superGroups()->attach($group2);

        $group1->load('subGroups');
        $group2->load('subGroups');
        $group2->load('superGroups');
        $group3->load('superGroups');

        $this->assertEquals(0, count($group1->superGroups));
        $this->assertEquals(1, count($group1->subGroups));
        $this->assertEquals(1, count($group2->superGroups));
        $this->assertEquals(1, count($group2->subGroups));
        $this->assertEquals(1, count($group3->superGroups));
        $this->assertEquals(0, count($group3->subGroups));

        $this->assertEquals($group2->id, $group1->subGroups[0]->id);
        $this->assertEquals($group1->id, $group2->superGroups[0]->id);
        $this->assertEquals($group3->id, $group2->subGroups[0]->id);
        $this->assertEquals($group2->id, $group3->superGroups[0]->id);

        $group1->managers()->attach($user1);
        $group2->members()->attach($user1);
        $group3->members()->attach($user2);
        $group3->members()->attach($user3);
        $group3->managers()->attach($user2);
        
        $group1->load('managers');
        $group2->load('members');
        $group3->load('managers');
        $group3->load('members');
        $user1->load('groups');
        $user1->load('groupsManaging');
        $user2->load('groups');
        $user2->load('groupsManaging');
        $user3->load('groups');

        $this->assertEquals(1, count($group1->managers));
        $this->assertEquals(0, count($group1->members));
        $this->assertEquals(0, count($group2->managers));
        $this->assertEquals(1, count($group2->members));
        $this->assertEquals(1, count($group3->managers));
        $this->assertEquals(2, count($group3->members));
        $this->assertEquals(1, count($user1->groups));
        $this->assertEquals(1, count($user1->groupsManaging));
        $this->assertEquals(1, count($user2->groups));
        $this->assertEquals(1, count($user2->groupsManaging));
        $this->assertEquals(1, count($user3->groups));
        $this->assertEquals(0, count($user3->groupsManaging));

        $this->assertEquals($user1->id, $group1->managers[0]->id);
        $this->assertEquals($user1->id, $group2->members[0]->id);
        $this->assertEquals($user2->id, $group3->members[0]->id);
        $this->assertEquals($group1->id, $user1->groupsManaging[0]->id);
        $this->assertEquals($group2->id, $user1->groups[0]->id);
        $this->assertEquals($group3->id, $user2->groupsManaging[0]->id);
        $this->assertEquals($group3->id, $user2->groups[0]->id);
        $this->assertEquals($group3->id, $user3->groups[0]->id);

        // Is the user a manager of primary group?

        $this->assertTrue($user1->isManagerOfAll());
        $this->assertFalse($user2->isManagerOfAll());

        // Is the user a system administrator?

        $this->assertTrue($user1->isSysAdmin());
        $this->assertFalse($user2->isSysAdmin());

        // Is the user a manager of the object?
        $this->assertTrue($user1->isManagerOf($group1));
        $this->assertTrue($user1->isManagerOf($group2));
        $this->assertTrue($user1->isManagerOf($group3));
        $this->assertTrue($user1->isManagerOf($user1));
        $this->assertTrue($user1->isManagerOf($user2));
        $this->assertTrue($user1->isManagerOf($user3));

        $this->assertFalse($user2->isManagerOf($group1));
        $this->assertFalse($user2->isManagerOf($group2));
        $this->assertTrue($user2->isManagerOf($group3));
        $this->assertFalse($user2->isManagerOf($user1));
        $this->assertTrue($user2->isManagerOf($user2));
        $this->assertTrue($user2->isManagerOf($user3));

        $this->assertFalse($user3->isManagerOf($group1));
        $this->assertFalse($user3->isManagerOf($group2));
        $this->assertFalse($user3->isManagerOf($group3));
        $this->assertFalse($user3->isManagerOf($user1));
        $this->assertFalse($user3->isManagerOf($user2));
        $this->assertFalse($user3->isManagerOf($user3));
    }
}
