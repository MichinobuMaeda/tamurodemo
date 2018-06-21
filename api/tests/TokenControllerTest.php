<?php

use Illuminate\Auth\GenericUser;
use Laravel\Lumen\Testing\DatabaseMigrations;
use App\Models\Group;

require_once __DIR__.'/TestHelper.php';

class TokenControllerTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * The test of GET tokens.
     *
     * @return void
     */
    public function testShowToken()
    {
        run_test_seed0();
        $groups = Group::whereIn('role', ['admin', 'top'])->get();
        $this->json('GET', '/tokens', [], TEMP_TOKEN)
            ->seeJson(['error' => 'Forbidden']);
        $this->actingAs(new GenericUser([
            'id' => 1,
            'name' => 'System Administrator',
            'memberOf' => $groups,
            'managerOf' => $groups
        ]));
        $this->json('GET', '/tokens', [], TEMP_TOKEN)
            ->seeJson(['id' => 1]);
    }

    /**
     * The test of POST tokens.
     *
     * @return void
     */
    public function testCreateToken()
    {
        run_test_seed0();
        $this->json('PUT', '/users/1/certs/password', [
            'key' => 'key00001',
            'secret' => 'pass0001'
        ], TEMP_TOKEN)->seeJson([
            'provider' => 'password',
            'key' => 'key00001',
        ]);
        $this->seeInDatabase('certs', [
            'user_id' => 1,
            'provider' => 'password',
            'key' => 'key00001',
            'secret' => hash_password('key00001', 'pass0001')
        ]);
        $this->json('POST', '/tokens', [
            'provider' => 'password',
            'key' => 'key00001',
            'secret' => 'pass0001'
        ])->seeJson([
            'data' => [],
            'id' => 1,
            'provider' => 'password',
            'group_id' => 1,
            'group_id' => 2
        ]);
    }
}
