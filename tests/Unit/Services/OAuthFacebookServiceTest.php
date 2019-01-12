<?php

namespace Tests\Unit\Services;

use Tests\TestCase;

use Illuminate\Support\Facades\Log;
use App\Services\OAuthFacebookService;

class OAuthFacebookServiceTest extends TestCase
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
    public function testFacebookOk()
    {
        $mock = \Mockery::mock('overload:'.\Facebook\Facebook::class);
        $mock->shouldReceive('get')->andReturn(new class {
            public function getGraphUser() {
                return new class {
                    public function getId() {
                        return 'secret3';
                    }
                };
            }
        });

        $svc = new OAuthFacebookService();
        $this->assertEquals('secret3', $svc->validate('test_token'));
    }

    /**
     * The test of method validate() --> NG.
     *
     * @return void
     */
    public function testFacebookNG()
    {
        $mock = \Mockery::mock('overload:'.\Facebook\Facebook::class);
        $mock->shouldReceive('get')->andReturn(new class {
            public function getGraphUser() {
                throw new \Exception('test');
            }
        });

        $svc = new OAuthFacebookService();
        $this->assertNull($svc->validate('test_token'));
    }
}
