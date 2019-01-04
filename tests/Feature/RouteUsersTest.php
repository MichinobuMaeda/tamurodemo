<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;

use App\User;

class RouteUsersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
        $this->user00 = User::where('name', 'Primary user')->first();
    }

    /**
     * The test of method list().
     *
     * @return void
     */
    public function testList()
    {
        Auth::login($this->user00);

        $response = $this->get(route('list.users'));
        $response->assertSessionMissing('users_list.orderBy');
        $response->assertSessionMissing('users_list.orderDir');

        $response = $this->get(route('list.users.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertSessionHas([
            'users_list.orderBy' => 'email',
            'users_list.orderDir' => 'desc',
        ]);

        Auth::logout();

        $response = $this->get(route('list.users'));
        $response->assertRedirect(route('list.logins'));

        $response = $this->get(route('list.users.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertRedirect(route('list.logins'));
    }
}
