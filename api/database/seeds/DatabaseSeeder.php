<?php

use Illuminate\Database\Seeder;
use App\Models\Group;
use App\Models\User;
use App\Models\Token;

require_once __DIR__.'/../../vendor/autoload.php';

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::transaction(function () {

            $top = new Group;
            $top->name = 'Top group';
            $top->role = 'top';
            $top->save();

            $admin = new Group;
            $admin->name = 'System admins';
            $admin->role = 'admin';
            $admin->save();

            $top->subGroups()->attach($admin);

            $prime = new User;
            $prime->name = 'Primary user';
            $prime->save();

            $top->owners()->attach($prime);
            $admin->members()->attach($prime);

            $token = new Token;
            $token->provider = 'temp';
            $token->signature = env('SETUP_TOKEN');
            $token->user()->associate($prime);
            $token->save();
        }, 5);
    }
}
