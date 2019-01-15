<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use App\Group;
use App\GroupRole;
use App\User;
use App\AuthProvider;

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
        $this->assertEquals(0, count($group1->higherGroups));
        $this->assertEquals(0, count($group1->subgroups));
        $this->assertEquals(0, count($group1->members));
        $this->assertEquals(0, count($group1->managers));

        $group2 = Group::create([
            'name'      => 'Group 2',
        ]);
        $this->assertEquals(0, count($group2->roles));
        $this->assertEquals(0, count($group2->higherGroups));
        $this->assertEquals(0, count($group2->subgroups));
        $this->assertEquals(0, count($group2->members));
        $this->assertEquals(0, count($group2->managers));

        $group3 = Group::create([
            'name'      => 'Group 3',
        ]);
        $this->assertEquals(0, count($group3->roles));
        $this->assertEquals(0, count($group3->higherGroups));
        $this->assertEquals(0, count($group3->subgroups));
        $this->assertEquals(0, count($group3->members));
        $this->assertEquals(0, count($group3->managers));

        // Test soft-delete.
        $group3_id = $group3->id;
        $deleted = $group3->delete();
        $this->assertTrue($group3->trashed());
        $this->assertEquals($group3_id, $deleted);
        $group3 = Group::where('id', $group3_id)->first();
        $this->assertNull($group3);
        $group3 = Group::where('id', $group3_id)->withTrashed()->first();
        $this->assertNotNull($group3);
        $group3->restore();
        $group3 = Group::where('id', $group3_id)->first();
        $this->assertNotNull($group3);

        $user1 = User::create([
            'name'      => 'User 1',
            'email'     => 'user1@abc.def',
            'password'  => 'password1',
            'timezone'  => null
        ]);
        $this->assertEquals(0, count($user1->groups));
        $this->assertEquals(0, count($user1->managingGroups));

        $user2 = User::create([
            'name'      => 'User 2',
            'email'     => 'user2@abc.def',
            'password'  => 'password2',
            'timezone'  => 'Asia/Tokyo'
        ]);
        $this->assertEquals(0, count($user2->groups));
        $this->assertEquals(0, count($user2->managingGroups));

        $user3 = User::create([
            'name'      => 'User 3',
            'email'     => 'user3@abc.def',
            'password'  => 'password3',
            'timezone'  => 'Europe/London'
        ]);
        $this->assertEquals(0, count($user3->groups));
        $this->assertEquals(0, count($user3->managingGroups));

        // Test static methods.
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

        // Test soft-delete.
        $user3_id = $user3->id;
        $deleted = $user3->delete();
        $this->assertTrue($user3->trashed());
        $this->assertEquals($user3_id, $deleted);
        $user3 = User::where('id', $user3_id)->first();
        $this->assertNull($user3);
        $user3 = User::where('id', $user3_id)->withTrashed()->first();
        $this->assertNotNull($user3);
        $user3->restore();
        $user3 = User::where('id', $user3_id)->first();
        $this->assertNotNull($user3);

        // Test relationships.

        $role1 = $group1->roles()->save(new GroupRole(['name' => 'primary']));
        $role2 = $group1->roles()->save(new GroupRole(['name' => 'Role 2']));
        $role3 = $group2->roles()->save(new GroupRole(['name' => 'sysadmin']));

        $group1->load('roles');
        $group2->load('roles');
        $group3->load('roles');

        $this->assertTrue($group1->hasRole('primary'));
        $this->assertTrue($group1->hasRole('Role 2'));
        $this->assertFalse($group1->hasRole('sysadmin'));
        $this->assertFalse($group2->hasRole('primary'));
        $this->assertFalse($group2->hasRole('Role 2'));
        $this->assertTrue($group2->hasRole('sysadmin'));

        $this->assertTrue($group1->isPrimary());
        $this->assertFalse($group2->isPrimary());

        $this->assertFalse($group1->isSysAdmin());
        $this->assertTrue($group2->isSysAdmin());

        $this->assertEquals(2, count($group1->roles));
        $this->assertEquals(1, count($group2->roles));
        $this->assertEquals(0, count($group3->roles));

        $names = [$group1->roles[0]->name, $group1->roles[1]->name];
        sort($names);
        $this->assertEquals([$role2->name, $role1->name], $names);
        $this->assertEquals($role3->name, $group2->roles[0]->name);

        $group1->subgroups()->attach($group2);
        $group3->higherGroups()->attach($group2);

        $group1->load('subgroups');
        $group2->load('subgroups');
        $group2->load('higherGroups');
        $group3->load('higherGroups');

        $this->assertEquals(0, count($group1->higherGroups));
        $this->assertEquals(1, count($group1->subgroups));
        $this->assertEquals(1, count($group2->higherGroups));
        $this->assertEquals(1, count($group2->subgroups));
        $this->assertEquals(1, count($group3->higherGroups));
        $this->assertEquals(0, count($group3->subgroups));

        $this->assertEquals($group2->id, $group1->subgroups[0]->id);
        $this->assertEquals($group1->id, $group2->higherGroups[0]->id);
        $this->assertEquals($group3->id, $group2->subgroups[0]->id);
        $this->assertEquals($group2->id, $group3->higherGroups[0]->id);

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
        $user1->load('managingGroups');
        $user2->load('groups');
        $user2->load('managingGroups');
        $user3->load('groups');

        $this->assertEquals(1, count($group1->managers));
        $this->assertEquals(0, count($group1->members));
        $this->assertEquals(0, count($group2->managers));
        $this->assertEquals(1, count($group2->members));
        $this->assertEquals(1, count($group3->managers));
        $this->assertEquals(2, count($group3->members));
        $this->assertEquals(1, count($user1->groups));
        $this->assertEquals(1, count($user1->managingGroups));
        $this->assertEquals(1, count($user2->groups));
        $this->assertEquals(1, count($user2->managingGroups));
        $this->assertEquals(1, count($user3->groups));
        $this->assertEquals(0, count($user3->managingGroups));

        $this->assertEquals($user1->id, $group1->managers[0]->id);
        $this->assertEquals($user1->id, $group2->members[0]->id);
        $this->assertEquals($user2->id, $group3->members[0]->id);
        $this->assertEquals($group1->id, $user1->managingGroups[0]->id);
        $this->assertEquals($group2->id, $user1->groups[0]->id);
        $this->assertEquals($group3->id, $user2->managingGroups[0]->id);
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

        // AuthProvider
        $list1 = AuthProvider::where('user_id', $user1->id)->get();
        $this->assertCount(0, $list1);

        AuthProvider::create([
            'user_id' => $user1->id,
            'provider' => 'provider1',
            'secret' => 'secret1',
        ]);
        AuthProvider::create([
            'user_id' => $user1->id,
            'provider' => 'provider2',
            'secret' => 'secret2',
        ]);
        $list1 = AuthProvider::where('user_id', $user1->id)->get();
        $this->assertCount(2, $list1);
    }
}
