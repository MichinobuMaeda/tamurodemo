<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Services\PageHistoryService;

class PageHistoryServiceTest extends TestCase
{
    /**
     * Set up for each test.
     */
    protected function setUp()
    {
        parent::setUp();
    }

    /**
     * The test of method put().
     *
     * @return void
     */
    public function testPut()
    {
        $svc = new PageHistoryService(new class {
            public function __construct()
            {
                $this->data = [];
            }
            public function get($key, $default = null)
            {
                return isset($this->data[$key]) ? $this->data[$key] : $default;
            }
            public function put($key, $data)
            {
                $this->data[$key] = $data;
            }
        });

        $this->assertNull($svc->prev());
        $this->assertNull($svc->curr());
        $this->assertNull($svc->next());
        $this->assertNull($svc->back());
        $this->assertNull($svc->forward());

        $svc->put('/');
        $this->assertNull($svc->prev());
        $this->assertEquals('/', $svc->curr());
        $this->assertNull($svc->next());
        $this->assertEquals('/', $svc->back());
        $this->assertEquals('/', $svc->forward());

        $svc->put('/a');
        $this->assertEquals('/', $svc->prev());
        $this->assertEquals('/a', $svc->curr());
        $this->assertNull($svc->next());
        $this->assertEquals('/', $svc->back());
        $this->assertEquals('/a', $svc->next());
        $this->assertEquals('/a', $svc->forward());

        $svc->put('/');
        $this->assertEquals('/a', $svc->prev());
        $this->assertEquals('/', $svc->curr());
        $this->assertNull($svc->next());
        $this->assertEquals('/a', $svc->back());
        $this->assertEquals('/', $svc->next());
        $this->assertEquals('/', $svc->forward());

        $svc->put('/');
        $this->assertEquals('/a', $svc->prev());
        $this->assertEquals('/', $svc->curr());
        $this->assertNull($svc->next());
        $this->assertEquals('/a', $svc->back());
        $this->assertEquals('/', $svc->next());
        $this->assertEquals('/', $svc->back());
        $this->assertEquals('/a', $svc->next());
        $this->assertEquals('/', $svc->back());
        $this->assertEquals('/a', $svc->next());
        $this->assertEquals('/a', $svc->forward());
        $this->assertEquals('/', $svc->forward());
        $this->assertEquals('/', $svc->forward());

        $this->assertEquals('/a', $svc->back());

        foreach (range(0, 99) as $num) {
            $svc->put('/'.$num);
        }
        $this->assertEquals('/99', $svc->curr());

        $this->assertEquals('/98', $svc->back());
        $this->assertEquals('/97', $svc->back());
        $this->assertEquals('/96', $svc->back());
        $this->assertEquals('/95', $svc->back());
        $svc->put('/100');
        $this->assertEquals('/95', $svc->prev());
        $this->assertEquals('/100', $svc->curr());
        $this->assertNull($svc->next());
    }
}
