<?php

namespace Tests\Unit\Policies;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;
use App\Listeners\HandleSuccessfulLogin;

class HandleSuccessfulLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
    }

    /**
     * The test of method view().
     *
     * @return void
     */
    public function testHandle()
    {
        $listener = new HandleSuccessfulLogin();
        $user = $this->user00;
        Auth::login($user);
        $user->refresh();
        $this->assertNull($user->invitation_token);
        $this->assertNull($user->invited_at);
        Auth::logout();

        $user->invitation_token = 'a';
        $user->save();
        Auth::login($user);
        $user->refresh();
        $this->assertNull($user->invitation_token);
        $this->assertNull($user->invited_at);
        Auth::logout();

        $user->invited_at = new DateTime();
        $user->save();
        Auth::login($user);
        $user->refresh();
        $this->assertNull($user->invitation_token);
        $this->assertNull($user->invited_at);
        Auth::logout();
    }
}
