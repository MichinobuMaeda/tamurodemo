<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Unit\UnitTestHelper;
use App\Services\OAuthService;
use App\AuthProvider;

class OAuthServiceTest extends TestCase
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
     * The test of method register().
     *
     * @return void
     */
    public function testRegister()
    {
        $rs = new OAuthService();
        $user = $this->user01;
        $rs->providers = [
            'provider1' => function ($id_token) { return 'secret1'; },
            'provider2' => function ($id_token) { return null; },
        ];

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) - 1).' minutes'
        );
        $this->assertTrue($rs->register($user, 'token1', 'provider1', 'return1'));

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) - 1).' minutes'
        );
        $this->assertFalse($rs->register($user, 'token1', 'provider2', 'return1'));
        $this->assertFalse($rs->register(null, 'token1', 'provider1', 'return1'));
        $this->assertFalse($rs->register($user, null, 'provider1', 'return1'));
        $this->assertFalse($rs->register($user, 'token1', null, 'return1'));
        $this->assertFalse($rs->register($user, 'dummy', 'provider1', 'return1'));
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) + 1).' minutes'
        );
        $this->assertFalse($rs->register($user, 'token1', 'provider1', 'return1'));
    }

    /**
     * The test of method loginWithOAuthProvider().
     *
     * @return void
     */
    public function testLogin()
    {
        $rs = new OAuthService();
        $user = $this->user01;
        $rs->providers = [
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

        $this->assertFalse($rs->login(null, 'return1'));
        $this->assertFalse($rs->login('provider1', null));
        $this->assertFalse($rs->login('provider2', 'return1'));
        $this->assertFalse($rs->login('provider3', 'return3'));
        $this->assertTrue($rs->login('provider1', 'return1'));
    }
}
