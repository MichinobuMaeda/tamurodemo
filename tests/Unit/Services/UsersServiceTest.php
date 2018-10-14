<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Unit\UnitTestHelper;
use App\Services\UsersService;
use App\PasswordReset;

class UsersServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Set up for each test.
     */
    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
    }

    /**
     * The test of method list().
     *
     * @return void
     */
    public function testList()
    {
        $us = new UsersService();

        $this->user01->name = 'user 01';
        $this->user01->save();

        Auth::login($this->user06);
        $ret = $us->list()->toArray();
        $this->assertEquals(9, count($ret));
        $this->assertEquals($this->user00->id, $ret[0]['id']);
        $this->assertEquals($this->user01->id, $ret[8]['id']);

        $ret = $us->list('name', 'desc')->toArray();
        $this->assertEquals(9, count($ret));
        $this->assertEquals($this->user01->id, $ret[0]['id']);
        $this->assertEquals($this->user00->id, $ret[8]['id']);

        $ret = $us->list('id')->toArray();
        $this->assertEquals(9, count($ret));
        $this->assertEquals($this->user00->id, $ret[0]['id']);
        $this->assertEquals($this->user08->id, $ret[8]['id']);

        Auth::login($this->user01);
        $ret = $us->list()->toArray();
        $this->assertEquals(2, count($ret));
        $this->assertEquals($this->user04->id, $ret[0]['id']);
        $this->assertEquals($this->user01->id, $ret[1]['id']);

        $ret = $us->list('name', 'desc')->toArray();
        $this->assertEquals(2, count($ret));
        $this->assertEquals($this->user01->id, $ret[0]['id']);
        $this->assertEquals($this->user04->id, $ret[1]['id']);

        $ret = $us->list('id')->toArray();
        $this->assertEquals(2, count($ret));
        $this->assertEquals($this->user01->id, $ret[0]['id']);
        $this->assertEquals($this->user04->id, $ret[1]['id']);

        Auth::login($this->user02);
        $ret = $us->list()->toArray();
        $this->assertEquals(0, count($ret));
    }

    /**
     * The test of method invite().
     *
     * @return void
     */
    public function testInvite()
    {
        $us = new UsersService();

        PasswordReset::create([
            'email' => $this->user01->email,
            'token' => Hash::make('dummy'),
            'created_at' => new DateTime(),
        ]);
        $us->invite($this->user01, 'email');

        $prs = PasswordReset::where('email', $this->user01->email)->get();
        $this->assertEquals(1, $prs->count());
        $this->assertEquals($this->user01->email, $prs[0]->email);
        $this->assertStringStartsWith(substr(Hash::make('dummy'), 0, 2), $prs[0]->token);
        $this->assertTrue((new DateTime()) < $prs[0]->created_at);
    }
}
