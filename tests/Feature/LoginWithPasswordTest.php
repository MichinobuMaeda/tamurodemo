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
        $response->assertRedirect(route('login'));

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
        $response->assertRedirect(route('login'));

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
}
