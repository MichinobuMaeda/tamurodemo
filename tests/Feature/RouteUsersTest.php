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

        $response = $this->get(route('users.list'));
        $response->assertSessionMissing('users_list.orderBy');
        $response->assertSessionMissing('users_list.orderDir');

        $response = $this->get(route('users.list.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertSessionHas([
            'users_list.orderBy' => 'email',
            'users_list.orderDir' => 'desc',
        ]);

        Auth::logout();

        $response = $this->get(route('users.list'));
        $response->assertRedirect(route('login'));

        $response = $this->get(route('users.list.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertRedirect(route('login'));
    }

    /**
     * The test of method invite().
     *
     * @return void
     */
    public function testInvite()
    {
        Auth::login($this->user00);

        $response = $this->post(route('users.invite', [
            'user' => $this->user00->id,
        ]), [
            'provider' => 'email',
        ]);
        $response->assertRedirect(route('users.showInvitation', [
            'user' => $this->user00->id,
            'provider' => 'email',
        ]));

        Auth::login($this->user01);

        $response = $this->post(route('users.invite', [
            'user' => $this->user04->id,
        ]), [
            'provider' => 'email',
        ]);
        $response->assertRedirect(route('users.showInvitation', [
            'user' => $this->user04->id,
            'provider' => 'email',
        ]));

        $response = $this->post(route('users.invite', [
            'user' => $this->user08->id,
        ]), [
            'provider' => 'email',
        ]);
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        Auth::logout();

        $response = $this->post(route('users.invite', [
            'user' => $this->user00->id,
        ]), [
            'provider' => 'email',
        ]);
        $response->assertRedirect(route('login'));
    }

    /**
     * The test of method showInvitation().
     *
     * @return void
     */
    public function testShowInvitation()
    {
        Auth::login($this->user00);

        $response = $this->get(route('users.showInvitation', [
            'user' => $this->user00->id,
            'provider' => 'email',
        ]));
        $response->assertViewIs('users_invite_email');
        $response->assertViewHas('user', User::where('name', 'Primary user')->first());

        Auth::login($this->user01);

        $response = $this->get(route('users.showInvitation', [
            'user' => $this->user04->id,
            'provider' => 'email',
        ]));
        $response->assertViewIs('users_invite_email');
        $response->assertViewHas('user', User::where('name', 'user 04')->first());

        $response = $this->get(route('users.showInvitation', [
            'user' => $this->user08->id,
            'provider' => 'email',
        ]));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        Auth::logout();

        $response = $this->get(route('users.showInvitation', [
            'user' => $this->user00->id,
            'provider' => 'email',
        ]));
        $response->assertRedirect(route('login'));
    }
}
