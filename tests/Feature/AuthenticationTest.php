<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;

use DateTime;
use Facebook\Facebook;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;
use App\User;
use App\AuthProvider;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
        $this->user00 = User::where('name', 'Primary user')->first();
        $this->user01 = User::where('name', 'User 01')->first();
    }

    /**
     * Test viewInvitation.
     *
     * @return void
     */
    public function testViewInvitation()
    {
        $user = $this->user01;

        $response = $this->get(route('users.invitations', [
            'user' => $user->id,
            'token' => 'token1',
        ]));
        $response->assertRedirect('/');

        $user->invitation_token = 'token1';
        $user->invited_at = new DateTime();
        $user->save();
        $response = $this->get(route('users.invitations', [
            'user' => $user->id,
            'token' => 'token1',
        ]));
        $response->assertViewIs('invitation');

        $user->invitation_token = 'token1';
        $user->invited_at = new DateTime();
        $user->save();
        $response = $this->get(route('users.invitations', [
            'user' => $user->id,
            'token' => 'token1',
            'provider_name' => 'google',
        ]));
        $response->assertViewIs('login_google');

        $response = $this->get(route('users.invitations', [
            'user' => 0,
            'token' => 'token1',
        ]));
        $response->assertStatus(404);

        $response = $this->get(route('users.invitations', [
            'user' => $user->id,
            'token' => 'dummy',
        ]));
        $response->assertRedirect('/');
    }

    /**
     * Test register: google (ok).
     *
     * @return void
     */
    public function testRegister1()
    {
        $user = $this->user01;
        $user->invitation_token = 'token1';
        $user->invited_at = new DateTime();
        $user->save();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(['sub' => 'secret1']);

        $response = $this->post(
            route('post.registration', [
                'user' => $user->id,
            ]), [
                'token' => 'token1',
                'provider_name' => 'google',
                'provider_token' => 'return1',
            ]
        );
        $response->assertSeeText('ok');
    }

    /**
     * Test register: google (ng).
     *
     * @return void
     */
    public function testRegister2()
    {
        $user = $this->user01;
        $user->invitation_token = 'token2';
        $user->invited_at = new DateTime();
        $user->save();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(null);

        $response = $this->post(
            route('post.registration', [
                'user' => $user->id,
            ]), [
                'token' => 'token2',
                'provider_name' => 'google',
                'provider_token' => 'return2',
            ]
        );
        $response->assertSeeText('ng');
    }

    /**
     * Test oAuthLogin.
     *
     * @return void
     */
    public function testOAuthLogin()
    {
        $user = $this->user01;
        $user->invitation_token = 'token1';
        $user->invited_at = new DateTime();
        $user->save();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(['sub' => 'secret1']);

        $response = $this->post(
            route('oAuthLogin', [
                'user' => $user->id,
            ]), [
                'provider_name' => 'google',
                'provider_token' => 'return1',
            ]
        );
        $response->assertSeeText('ng');

        $ap1 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'google',
            'secret' => hash('sha256', 'google'.'secret1'.env('APP_KEY')),
        ]);
        $ap1->save();

        $response = $this->post(
            route('oAuthLogin', [
                'user' => $user->id,
            ]), [
                'provider_name' => 'google',
                'provider_token' => 'return1',
            ]
        );
        $response->assertSeeText('ok');
    }
}
