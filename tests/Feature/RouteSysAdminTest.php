<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
// use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;

use App\User;

class RouteSysAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
    }

    /**
     * The test of route: user.
     *
     * @return void
     */
    public function testMenu()
    {
        $response = $this->get(route('sysadmin'));
        $response->assertRedirect(route('list.logins'));

        Auth::login($this->user00);
        $response = $this->get(route('sysadmin'));
        $response->assertViewIs('sysadmin.menu');

        Auth::login($this->user05);
        $response = $this->get(route('sysadmin'));
        $response->assertViewIs('sysadmin.menu');

        Auth::login($this->user02);
        $response = $this->get(route('sysadmin'));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);
    }
}
