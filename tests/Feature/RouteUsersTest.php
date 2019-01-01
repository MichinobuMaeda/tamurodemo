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
        $response->assertRedirect(route('login_select'));

        $response = $this->get(route('users.list.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertRedirect(route('login_select'));
    }

    /**
     * The test of method invite().
     *
     * @return void
     */
    public function testInvite()
    {
        Auth::login($this->user00);

        $response = $this->post(route('post.invitation', [
            'user' => $this->user00->id,
        ]), [
            'sendBy' => 'email',
        ]);
        $response->assertRedirect(route('get.invitation', [
            'user' => $this->user00->id,
            'sendBy' => 'email',
        ]));

        Auth::login($this->user01);

        $response = $this->post(route('post.invitation', [
            'user' => $this->user04->id,
        ]), [
            'sendBy' => 'email',
        ]);
        $response->assertRedirect(route('get.invitation', [
            'user' => $this->user04->id,
            'sendBy' => 'email',
        ]));

        $response = $this->post(route('post.invitation', [
            'user' => $this->user08->id,
        ]), [
            'sendBy' => 'email',
        ]);
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        Auth::logout();

        $response = $this->post(route('post.invitation', [
            'user' => $this->user00->id,
        ]), [
            'sendBy' => 'email',
        ]);
        $response->assertRedirect(route('login_select'));
    }

    /**
     * The test of method showInvited().
     *
     * @return void
     */
    public function testShowInvited()
    {
        Auth::login($this->user00);

        $response = $this->get(route('get.invitation', [
            'user' => $this->user00->id,
            'sendBy' => 'email',
        ]));
        $response->assertViewIs('users_invite');
        $response->assertViewHas('user', User::where('name', 'Primary user')->first());

        Auth::login($this->user01);

        $response = $this->get(route('get.invitation', [
            'user' => $this->user04->id,
            'sendBy' => 'email',
        ]));
        $response->assertViewIs('users_invite');
        $response->assertViewHas('user', User::where('name', 'user 04')->first());

        $response = $this->get(route('get.invitation', [
            'user' => $this->user08->id,
            'sendBy' => 'email',
        ]));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        Auth::logout();

        $response = $this->get(route('get.invitation', [
            'user' => $this->user00->id,
            'sendBy' => 'email',
        ]));
        $response->assertRedirect(route('login_select'));
    }
}
