<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Unit\UnitTestHelper;
use App\Services\AuthenticationService;
use App\AuthProvider;

class AuthenticationServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Set up for each test.
     */
    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
    }

    /**
     * The test of method invite().
     *
     * @return void
     */
    public function testInvite()
    {
        $is = new AuthenticationService();

        $this->assertNull($this->user01->invitation_token);
        $is->invite($this->user01, 'email');

        $this->user01->refresh();
        $this->assertNotNull($this->user01->invitation_token);
    }

    /**
     * The test of method invite().
     *
     * @return void
     */
    public function testRegister()
    {
        $is = new AuthenticationService();
        $user = $this->user01;
        $providers = [
            'provider1' => function ($id_token) { return 'secret1'; },
            'provider2' => function ($id_token) { return null; },
        ];

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) - 1).' minutes'
        );
        $this->assertTrue($is->register($user, 'token1', 'provider1', 'return1', $providers));

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) - 1).' minutes'
        );
        $this->assertFalse($is->register($user, 'token1', 'provider2', 'return1', $providers));
        $this->assertFalse($is->register(null, 'token1', 'provider1', 'return1', $providers));
        $this->assertFalse($is->register($user, null, 'provider1', 'return1', $providers));
        $this->assertFalse($is->register($user, 'token1', null, 'return1', $providers));
        $this->assertFalse($is->register($user, 'dummy', 'provider1', 'return1', $providers));
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) + 1).' minutes'
        );
        $this->assertFalse($is->register($user, 'token1', 'provider1', 'return1', $providers));
    }

    /**
     * The test of method invite().
     *
     * @return void
     */
    public function testLoginWithOAuthProvider()
    {
        $is = new AuthenticationService();
        $user = $this->user01;
        $providers = [
            'provider1' => function ($id_token) { return 'secret1'; },
            'provider2' => function ($id_token) { return null; },
            'provider3' => function ($id_token) { return 'dummy'; },
        ];

        $ap1 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'provider1',
            'secret' => hash('sha256', 'provider1'.'secret1'.env('APP_KEY')),
        ]);
        $ap1->save();
        $ap3 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'provider3',
            'secret' => hash('sha256', 'provider3'.'secret3'.env('APP_KEY')),
        ]);
        $ap3->save();

        $this->assertFalse($is->loginWithOAuthProvider(null, 'return1', $providers));
        $this->assertFalse($is->loginWithOAuthProvider('provider1', null, $providers));
        $this->assertFalse($is->loginWithOAuthProvider('provider2', 'return1', $providers));
        $this->assertFalse($is->loginWithOAuthProvider('provider3', 'return3', $providers));
        $this->assertTrue($is->loginWithOAuthProvider('provider1', 'return1', $providers));
    }
}
