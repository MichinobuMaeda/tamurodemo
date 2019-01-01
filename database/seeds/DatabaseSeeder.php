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
        $this->call(MessageSeeder::class);
        $this->call(GroupSeeder::class);
        $this->call(UserSeeder::class);

        // for local test.
        if (App::environment('local')) {
            $this->call(LocalSeeder::class);
        }
    }
}
