<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Tests\Unit\UnitTestHelper;
use App\Services\InvitationService;
use App\AuthProvider;

class InvitationServiceTest extends TestCase
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
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function testInvite()
    {
        $svc = new InvitationService();

        $mock = \Mockery::mock('overload:'.\App\Notifications\InvitationMailNotification::class);
        $mock->shouldReceive('via')->with($this->user01)->once();

        $this->assertNull($this->user01->invitation_token);
        $svc->invite($this->user01, 'email');

        $this->user01->refresh();
        $this->assertNotNull($this->user01->invitation_token);
    }
}
