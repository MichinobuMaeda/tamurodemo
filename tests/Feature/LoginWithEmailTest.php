<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
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
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testLogin()
    {
        // Before login.
        $response = $this->get('/');
        $response->assertRedirect(route('login.select'));

        // Show send email page.
        $response = $this->get(route('login.email'));
        $response->assertViewIs('login_email');

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
}
