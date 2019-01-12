<?php

namespace Tests\Unit\Services;

use Tests\TestCase;

use Illuminate\Support\Facades\Log;
use App\Services\OAuthAmazonService;

const AMAZON_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const AMAZON_PROFILE_URL = 'https://api.amazon.com/user/profile';

class OAuthAmazonServiceTest extends TestCase
{
    /**
     * Set up for each test.
     */
    protected function setUp()
    {
        parent::setUp();
    }

    function amazon($code, $stt1, $stt2) {
        $svc = new OAuthAmazonService();

        $mock1 = \Mockery::mock('overload:'.\GuzzleHttp\Client::class);
        $mock1->shouldReceive('request')
            ->with('POST', AMAZON_TOKEN_URL, \Mockery::any())
            ->andReturn(new class ($stt1) {
                public function __construct($stt) {
                    $this->stt = $stt;
                }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return '{"access_token": "access_token01"}'; }
            });
        $mock1->shouldReceive('request')
            ->with('GET', AMAZON_PROFILE_URL, \Mockery::any())
            ->andReturn(new class ($stt2) {
                public function __construct($stt) { $this->stt = $stt; }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return '{"user_id": "user_id_01"}'; }
            });
        return $svc->validate($code."\t".config('tamuro.oauth_amazon')['redirect_uri1']);
    }

    /**
     * The test of method validate() --> OK.
     *
     * @return void
     */
    public function testAmazonOk()
    {
        $this->assertEquals(
            'user_id_01',
            $this->amazon('code01', 200, 200)
        );
    }

    /**
     * The test of method validate() --> NG(1).
     *
     * @return void
     */
    public function testAmazonNg1()
    {
        $this->assertNull(
            $this->amazon('code01', 500, 200)
        );
    }

    /**
     * The test of method validate() --> NG(2).
     *
     * @return void
     */
    public function testAmazonNg2()
    {
        $this->assertNull(
            $this->amazon('code01', 200, 500)
        );
    }
}
