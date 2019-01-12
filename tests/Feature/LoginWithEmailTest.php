<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;

use App\User;

class LoginWithEmailTest extends TestCase
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
        $response->assertRedirect(route('list.logins'));

        // Show send email page.
        $response = $this->get(route('login.email'));
        $response->assertViewIs('auth.login_email');

        // Send bad format email address.
        $response = $this->post(route('login.email.send'), [
            'email' => 'invalid email address',
        ]);
        $response->assertRedirect(route('login.email'));

        // Send invalid email address.
        $response = $this->post(route('login.email.send'), [
            'email' => 'invalid@email.address',
        ]);
        $response->assertRedirect(route('login.email', [
            'sent' => 'true',
        ]));

        $user00 = User::where('email', 'user00@abc.def')->first();
        $this->assertNull($user00->invitation_token);

        // Send valid email address.
        $response = $this->post(route('login.email.send'), [
            'email' => $user00->email,
        ]);
        $response->assertRedirect(route('login.email', [
            'sent' => 'true',
        ]));

        $user00->refresh();
        $this->assertNotNull($user00->invitation_token);

        // Login with invalid token
        $response = $this->get(route('login.email.token', [
            'user' => $user00->id,
            'token' => 'invalid token',
        ]));
        $response->assertRedirect(route('home'));

        $user00->refresh();
        $this->assertNotNull($user00->invitation_token);

        // Login with valid token
        $response = $this->get(route('login.email.token', [
            'user' => $user00->id,
            'token' => $user00->invitation_token,
        ]));
        $response->assertRedirect(route('home'));

        $user00->refresh();
        $this->assertNull($user00->invitation_token);
    }

    /**
     * Test edit the logged-in user's email.
     *
     * @return void
     */
    public function testEditLoggedInUsersEmail()
    {
        // Before login.
        $response = $this->get(route('preferences.login'));
        $response->assertRedirect(route('list.logins'));

        $response = $this->get(route('preferences.login.email'));
        $response->assertRedirect(route('list.logins'));

        // After login.
        Auth::login($this->user00);

        $response = $this->get(route('preferences.login'));
        $response->assertViewIs('preferences_login');

        $response = $this->get(route('preferences.login.email'));
        $response->assertViewIs('preferences_email');

        $response = $this->put(route('preferences.login.email'), [
            'email' => 'abc@def',
        ]);
        $response->assertRedirect(route('preferences.login.email'));

        $response = $this->put(route('preferences.login.email'), [
            'email' => '',
        ]);
        $response->assertRedirect(route('preferences.login'));

        $response = $this->put(route('preferences.login.email'), [
            'email' => 'abc@def.ghi',
        ]);
        $response->assertRedirect(route('preferences.login'));
    }
}
