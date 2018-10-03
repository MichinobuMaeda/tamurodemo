<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(GroupsTableSeeder::class);
        $this->call(UsersTableSeeder::class);

        // for local test.
        if (App::environment('local')) {
            $this->call(LocalSeeder::class);
        }
    }
}
