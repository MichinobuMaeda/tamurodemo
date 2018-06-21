<?php

use Laravel\Lumen\Testing\DatabaseMigrations;

require_once __DIR__.'/../database/seeds/DatabaseSeeder.php';

class DatabaseSeederTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * The test of DatabaseSeeder@run.
     *
     * @return void
     */
    public function testRun()
    { 
        (new DatabaseSeeder())->run();
        $this->seeInDatabase('groups', [
            'id' => 1,
            'name' => 'Top group',
            'role' => 'top',
            'ver' => 1
        ]);
        $this->seeInDatabase('groups', [
            'id' => 2,
            'name' => 'System admins',
            'role' => 'admin',
            'ver' => 1
        ]);
        $this->seeInDatabase('sub_groups', [
            'group_id' => 1,
            'sub_group_id' => 2
        ]);
        $this->seeInDatabase('users', [
            'id' => 1,
            'name' => 'Primary user',
            'ver' => 1
        ]);
        $this->seeInDatabase('members', [
            'group_id' => 2,
            'user_id' => 1
        ]);
        $this->seeInDatabase('group_owners', [
            'group_id' => 1,
            'user_id' => 1
        ]);
        $this->seeInDatabase('tokens', [
            'id' => 1,
            'user_id' => 1,
            'provider' => 'temp',
            'signature' => env('SETUP_TOKEN')
        ]);
    }
}
