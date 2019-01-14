<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Tests\Unit\UnitTestHelper;
use App\Services\GroupsService;

class GroupsServiceTest extends TestCase
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
     * The test of method saveProfile().
     *
     * @return void
     */
    public function testSaveProfile()
    {
        $svc = new GroupsService();

        $svc->saveProfile($this->group01, 'test name1', 'test desc1');
        $this->group01->refresh();
        $this->assertEquals('test name1', $this->group01->name);
        $this->assertEquals('test desc1', $this->group01->desc);

        $svc->saveProfile($this->group01, 'test name2', null);
        $this->group01->refresh();
        $this->assertEquals('test name2', $this->group01->name);
        $this->assertEquals(null, $this->group01->desc);
    }

    /**
     * The test of method create().
     *
     * @return void
     */
    public function testCreate()
    {
        $svc = new GroupsService();

        $count = $this->group01->subGroups()->count();
        $model = $svc->create($this->group01->id, 'test name9', 'test desc9');
        $this->assertEquals('test name9', $model->name);
        $this->assertEquals('test desc9', $model->desc);
        $this->assertEquals($count + 1, $this->group01->subGroups()->count());
    }
}
