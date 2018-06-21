<?php

use Illuminate\Support\Facades\DB;
use App\Models\Group;
use App\Models\User;
use App\Models\Token;

require_once __DIR__.'/../database/seeds/DatabaseSeeder.php';

define('TEMP_TOKEN', [env('TOKEN_HEADER') => env('SETUP_TOKEN')]);

/**
 * Run DatabaseSeeder only.
 * 
 *  Group 1: (top) -- owner [1]
 *  +---Group 2: (admin)
 *          User 1: Primary user
 *              Token temp: env('SETUP_TOKEN')
 * 
 * @return void
 */
function run_test_seed0()
{
    (new DatabaseSeeder())->run();
}

/**
 * For basic test.
 *
 *  Group 1: (top) -- owner [User 1, User 2]
 *  +---Group 2: (admin)
 *  |       User 1: Primary user
 *  |       User 3
 *  +---Group 3 (base)
 *  |       User 2
 *  |       User 3
 *  +---Group 4
 * 
 * @return void
 */
function run_test_seed1()
{
    (new DatabaseSeeder())->run();

    DB::transaction(function () {
        Token::where('signature', env('SETUP_TOKEN'))->delete();

        $group1 = Group::where('id', 1)->first();

        $group2 = Group::where('id', 2)->first();

        $group3 = new Group();
        $group3->name = 'Group 3';
        $group3->role = 'base';
        $group3->save();
        $group1->subGroups()->attach($group3);

        $group4 = new Group();
        $group4->name = 'Group 4';
        $group4->save();
        $group1->subGroups()->attach($group4);

        $user2 = new User();
        $user2->name = 'User 2';
        $user2->save();
        $group1->owners()->attach($user2);
        $group3->members()->attach($user2);

        $user3 = new User();
        $user3->name = 'User 3';
        $user3->save();
        $group3->members()->attach($user3);
        $group2->members()->attach($user3);
    }, 5);
}

function hash_password($key, $secret)
{
    return hash(
        'sha256',
        sprintf("%s %s %x", $secret, env('APP_KEY'), $key)
    );
}

function hash_signature($user_id)
{
    $ts = microtime(TRUE);
    return hash(
        'sha256',
        sprintf("%f %s %x", $ts, env('APP_KEY'), $user_id)
    );
}
