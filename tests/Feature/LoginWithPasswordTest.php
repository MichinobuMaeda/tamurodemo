<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;

class LoginWithPasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
    }

    /**
     * Test login.
     *
     * @return void
     */
    public function testLogin()
    {
        // Before login.
        $response = $this->get('/');
        $response->assertRedirect(route('login.select'));

        // Login with bad password.
        $response = $this->post(route('login'), [
            'email' => 'user00@abc.def',
            'password' => 'dummy',
        ]);
        $response->assertRedirect('/');

        $response = $this->get('/');
        $response->assertStatus(302);

        // Login.
        $response = $this->post(route('login'), [
            'email' => 'user00@abc.def',
            'password' => 'Password00',
        ]);
        $response->assertRedirect('/');

        $response = $this->get('/');
        $response->assertStatus(200);       // OK

        $response = $this->get(route('password.request'));
        $response->assertRedirect('/');     // Disabled

        $response = $this->post(route('password.email'), [
            'email' => 'user00@abc.def',
        ]);
        $response->assertRedirect('/');     // Disabled

        $response = $this->post(route('password.update'), [
            'email' => 'user00@abc.def',
            'password' => 'Password00new',
            'password-confirm' => 'Password00new',
            'token' => 'dummy',
        ]);
        $response->assertRedirect('/');     // Disabled

        $response = $this->get(route('password.update'));
        $response->assertRedirect('/');     // Disabled

        $response = $this->get(route('login'));
        $response->assertRedirect('/');     // Disabled

        // Logout.
        $response = $this->post(route('logout'));
        $response->assertRedirect('/');

        $response = $this->get('/');
        $response->assertRedirect(route('login.select'));

        $response = $this->get(route('password.request'));
        $response->assertStatus(200);

        $response = $this->post(route('password.email'), [
            'email' => 'user00@abc.def',
        ]);
        $response->assertRedirect(route('password.update'));

        $response = $this->get(route('password.update'));
        $response->assertStatus(200);

        $response = $this->post(route('password.update'), [
            'email' => 'user00@abc.def',
            'password' => 'Password00new',
            'password-confirm' => 'Password00new',
            'token' => 'dummy',
        ]);
        $response->assertRedirect(route('password.update'));
    }

    /**
     * Test edit the logged-in user's password.
     *
     * @return void
     */
    public function testEditLoggedInUsersPassword()
    {
        // Before login.
        $response = $this->get(route('get.preferences.login'));
        $response->assertRedirect(route('login.select'));

        $response = $this->get(route('get.preferences.login.password'));
        $response->assertRedirect(route('login.select'));

        // After login.
        Auth::login($this->user00);

        $response = $this->get(route('get.preferences.login'));
        $response->assertViewIs('login_edit');

        $response = $this->get(route('get.preferences.login.password'));
        $response->assertViewIs('login_edit_password');

        $response = $this->post(route('post.preferences.login.password'), [
            'password' => '1234',
            'password_confirmation' => '1234',
        ]);
        $response->assertRedirect(route('get.preferences.login.password'));

        $response = $this->post(route('post.preferences.login.password'), [
            'password' => '',
            'password_confirmation' => '',
        ]);
        $response->assertRedirect(route('get.preferences.login'));

        $response = $this->post(route('post.preferences.login.password'), [
            'password' => 'Abcdefg0',
            'password_confirmation' => 'Abcdefg0',
        ]);
        $response->assertRedirect(route('get.preferences.login'));
    }
}
