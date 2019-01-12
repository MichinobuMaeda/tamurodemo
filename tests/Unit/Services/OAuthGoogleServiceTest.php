<?php

namespace Tests\Unit\Services;

use Tests\TestCase;

use DateTime;
use Illuminate\Support\Facades\Log;
use App\Services\OAuthGoogleService;

class OAuthGoogleServiceTest extends TestCase
{

    /**
     * Set up for each test.
     */
    protected function setUp()
    {
        parent::setUp();
    }

    /**
     * The test of method validate() --> OK.
     *
     * @return void
     */
    public function testGoogleOk()
    {
        $svc = new OAuthGoogleService();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(['sub' => 'secret1']);

        $this->assertEquals('secret1', $svc->validate('test_token'));
    }

    /**
     * The test of method validate() --> NG.
     *
     * @return void
     */
    public function testGoogleNG()
    {
        $svc = new OAuthGoogleService();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(null);

        $this->assertNull($svc->validate('test_token'));
    }
}
