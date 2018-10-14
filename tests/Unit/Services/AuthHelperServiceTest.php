<?php

namespace Tests\Unit\Services;

use Tests\TestCase;

use App\Services\AuthHelperService;

class AuthHelperServiceTest extends TestCase
{
    /**
     * The test of method generateCredential().
     *
     * @return void
     */
    public function testGenerateCredential()
    {
        $ah = new AuthHelperService();
        $p1 = $ah->generateCredential();
        $p2 = $ah->generateCredential();
        $p3 = $ah->generateCredential(1);
        $p4 = $ah->generateCredential(2);
        $this->assertEquals(128, strlen($p1));
        $this->assertEquals(128, strlen($p2));
        $this->assertEquals(128, strlen($p3));
        $this->assertEquals(128, strlen($p4));
        $this->assertNotEquals($p1, $p2);
        $this->assertNotEquals($p1, $p3);
        $this->assertNotEquals($p1, $p4);
        $this->assertNotEquals($p2, $p3);
        $this->assertNotEquals($p2, $p4);
        $this->assertNotEquals($p3, $p4);
    }
}
