<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;
use App\Services\EMailLoginService;

class EMailLoginServiceTest extends TestCase
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
     * The test of method send().
     *
     * @return void
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testSend()
    {
        $svc = new EMailLoginService();

        $mock = \Mockery::mock('overload:'.\App\Notifications\EMailLoginMailNotification::class);
        $mock->shouldReceive('via')->once();

        $this->assertNull($this->user01->invitation_token);

        $svc->send('invalid email address');
        $this->user01->refresh();
        $this->assertNull($this->user01->invitation_token);

        $svc->send($this->user01->email);
        $this->user01->refresh();
        $this->assertNotNull($this->user01->invitation_token);
    }

    /**
     * The test of method login().
     *
     * @return void
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testLogin()
    {
        $svc = new EMailLoginService();

        $mock = \Mockery::mock('overload:'.\App\Notifications\EMailLoginMailNotification::class);
        $mock->shouldReceive('via')->once();
        $svc->send($this->user01->email);
        $this->user01->refresh();

        $svc->login(null, $this->user01->invitation_token);
        $this->assertNotNull($this->user01->invitation_token);

        $svc->login($this->user01, null);
        $this->assertNotNull($this->user01->invitation_token);

        $svc->login($this->user01, 'invalid token');
        $this->assertNotNull($this->user01->invitation_token);

        $this->user01->invited_at = (new DateTime())->modify('-10 years');
        $this->user01->save();

        $svc->login($this->user01, $this->user01->invitation_token);
        $this->assertNotNull($this->user01->invitation_token);

        $this->user01->invited_at = new DateTime();
        $this->user01->save();

        $svc->login($this->user01, $this->user01->invitation_token);
        $this->assertNull($this->user01->invitation_token);
    }
}
