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
     * The test of route: users.
     *
     * @return void
     */
    public function testUsers()
    {
        Auth::login($this->user00);

        $response = $this->get(route('users'));
        $response->assertSessionMissing('users_list.orderBy');
        $response->assertSessionMissing('users_list.orderDir');

        $response = $this->get(route('users.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertSessionHas([
            'users_list.orderBy' => 'email',
            'users_list.orderDir' => 'desc',
        ]);

        Auth::logout();

        $response = $this->get(route('users'));
        $response->assertRedirect(route('list.logins'));

        $response = $this->get(route('users.orderBy', [
            'orderBy' => 'email',
            'orderDir' => 'desc'
        ]));
        $response->assertRedirect(route('list.logins'));
    }

    /**
     * The test of route: user.login.
     *
     * @return void
     */
    public function testUserLogin()
    {
        Auth::login($this->user01);

        $response = $this->get(route('user.login', [
            'user' => $this->user00->id,
        ]));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        $response = $this->get(route('user.login', [
            'user' => $this->user01->id,
        ]));
        $response->assertRedirect(route('preferences.login'));

        Auth::logout();
        Auth::login($this->user00);

        $response = $this->get(route('user.login', [
            'user' => $this->user00->id,
        ]));
        $response->assertRedirect(route('preferences.login'));

        $response = $this->get(route('user.login', [
            'user' => $this->user01->id,
        ]));
        $response->assertViewIs('user_login');
    }

    /**
     * The test of route: user.login.email.
     *
     * @return void
     */
    public function testUserLoginEmail()
    {
        Auth::login($this->user01);

        $response = $this->put(route('user.login.email', [
            'user' => $this->user00->id,
        ]), [
            'email' => 'abc@def.ghi',
        ]);
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        $response = $this->put(route('user.login.email', [
            'user' => $this->user01->id,
        ]), [
            'email' => 'abc@def.ghi',
        ]);
        $response->assertRedirect(route('user.login', [
            'user' => $this->user01->id,
        ]));

        Auth::logout();
        Auth::login($this->user00);

        $response = $this->put(route('user.login.email', [
            'user' => $this->user00->id,
        ]), [
            'email' => 'jkl@mno.pqr',
        ]);
        $response->assertRedirect(route('user.login', [
            'user' => $this->user00->id,
        ]));

        $response = $this->put(route('user.login.email', [
            'user' => $this->user01->id,
        ]), [
            'email' => 'stu@vwx.yz',
        ]);
        $response->assertRedirect(route('user.login', [
            'user' => $this->user01->id,
        ]));
    }

    /**
     * The test of route: user.login.oauth.
     *
     * @return void
     */
    public function testUserLoginOAuth()
    {
        Auth::login($this->user01);

        $response = $this->delete(route('user.login.oauth', [
            'user' => $this->user00->id,
            'provider' => 'google',
        ]));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        $response = $this->delete(route('user.login.oauth', [
            'user' => $this->user01->id,
            'provider' => 'google',
        ]));
        $response->assertRedirect(route('user.login', [
            'user' => $this->user01->id,
        ]));

        Auth::logout();
        Auth::login($this->user00);

        $response = $this->delete(route('user.login.oauth', [
            'user' => $this->user00->id,
            'provider' => 'google',
        ]));
        $response->assertRedirect(route('user.login', [
            'user' => $this->user00->id,
        ]));

        $response = $this->delete(route('user.login.oauth', [
            'user' => $this->user01->id,
            'provider' => 'google',
        ]));
        $response->assertRedirect(route('user.login', [
            'user' => $this->user01->id,
        ]));
    }
}
