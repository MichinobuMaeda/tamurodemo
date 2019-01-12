<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
        $svc = new OAuthService();
        $user = $this->user01;
        $svc->providers = [
            'provider1' => new class () {
                public function validate($id_token) { return 'secret1'; }
            },
            'provider2' => new class () {
                public function validate($id_token) { return null; }
            },
        ];

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(config('tamuro.invitation_expire') - 1).' minutes'
        );
        $this->assertTrue($svc->register($user, 'token1', 'provider1', 'return1'));

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(config('tamuro.invitation_expire') - 1).' minutes'
        );
        $this->assertFalse($svc->register($user, 'token1', 'provider2', 'return1'));
        $this->assertFalse($svc->register(null, 'token1', 'provider1', 'return1'));
        $this->assertFalse($svc->register($user, null, 'provider1', 'return1'));
        $this->assertFalse($svc->register($user, 'token1', null, 'return1'));
        $this->assertFalse($svc->register($user, 'dummy', 'provider1', 'return1'));
        $user->invited_at = (new DateTime())->modify(
            '-'.(config('tamuro.invitation_expire') + 1).' minutes'
        );
        $this->assertFalse($svc->register($user, 'token1', 'provider1', 'return1'));
    }

    /**
     * The test of method set().
     *
     * @return void
     */
    public function testSet()
    {
        $svc = new OAuthService();
        $user = $this->user01;
        $svc->providers = [
            'provider1' => new class () {
                public function validate($id_token) { return 'secret1'; }
            },
            'provider2' => new class () {
                public function validate($id_token) { return null; }
            },
        ];

        $this->assertFalse($svc->set($user, 'provider2', 'return1'));
        $this->assertNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertFalse($svc->set(null, 'provider1', 'return1'));
        $this->assertNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertFalse($svc->set($user, null, 'return1'));
        $this->assertNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
            );

        $this->assertTrue($svc->set($user, 'provider1', 'return1'));
        $this->assertNotNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );

        $this->assertTrue($svc->set($user, 'provider1', 'return1'));
        $this->assertNotNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );
    }

    /**
     * The test of method reset().
     *
     * @return void
     */
    public function testReset()
    {
        $svc = new OAuthService();

        AuthProvider::create([
            'user_id' => $this->user01->id,
            'provider' => 'provider1',
            'secret' => 'secret1',
        ]);
        AuthProvider::create([
            'user_id' => $this->user01->id,
            'provider' => 'provider2',
            'secret' => 'secret2',
        ]);
        AuthProvider::create([
            'user_id' => $this->user02->id,
            'provider' => 'provider1',
            'secret' => 'secret3',
        ]);

        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );

        $svc->reset(null, 'provider1');

        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );

        $svc->reset($this->user01, null);

        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );

        $svc->reset($this->user01, 'provider1');

        $this->assertNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );
    }

    /**
     * The test of method loginWithOAuthProvider().
     *
     * @return void
     */
    public function testLogin()
    {
        $svc = new OAuthService();
        $user = $this->user01;
        $svc->providers = [
            'provider1' => new class () {
                public function validate($id_token) { return 'secret1'; }
            },
            'provider2' => new class () {
                public function validate($id_token) { return null; }
            },
            'provider3' => new class () {
                public function validate($id_token) { return 'dummy'; }
            },
        ];

        $ap1 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'provider1',
            'secret' => hash('sha256', 'provider1'.'secret1'.config('app.key')),
        ]);
        $ap1->save();
        $ap3 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'provider3',
            'secret' => hash('sha256', 'provider3'.'secret3'.config('app.key')),
        ]);
        $ap3->save();

        $this->assertFalse($svc->login(null, 'return1'));
        $this->assertFalse($svc->login('provider1', null));
        $this->assertFalse($svc->login('provider2', 'return1'));
        $this->assertFalse($svc->login('provider3', 'return3'));
        $this->assertTrue($svc->login('provider1', 'return1'));
    }
}
