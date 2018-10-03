<?php

use Illuminate\Database\Seeder;

use App\User;

class LocalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user01 = User::create([
            'name'      => 'User 01',
            'email'     => 'user01@abc.def',
            'password'  => Hash::make('password01'),
            'timezone'  => null,
        ]);
        $user02 = User::create([
            'name'      => 'User 02',
            'email'     => 'user02@abc.def',
            'password'  => Hash::make('password02'),
            'timezone'  => 'Asia/Tokyo',
        ]);
        $user03 = User::create([
            'name'      => 'User 03',
            'email'     => 'user03@abc.def',
            'password'  => Hash::make('password03'),
            'timezone'  => 'Europe/London',
        ]);
    }
}
