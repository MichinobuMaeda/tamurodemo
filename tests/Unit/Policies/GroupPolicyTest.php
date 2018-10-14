<?php

namespace Tests\Unit\Policies;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;
use App\Policies\GroupPolicy;

class GroupPolicyTest extends TestCase
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
    public function testView()
    {
        $pol = new GroupPolicy();
        $this->assertTrue($pol->view($this->user00, $this->group03));        
        $this->assertTrue($pol->view($this->user01, $this->group03));        
        $this->assertTrue($pol->view($this->user02, $this->group03));        
        $this->assertTrue($pol->view($this->user03, $this->group03));        
        $this->assertTrue($pol->view($this->user04, $this->group03));        
        $this->assertTrue($pol->view($this->user05, $this->group03));        
        $this->assertTrue($pol->view($this->user06, $this->group03));        
        $this->assertTrue($pol->view($this->user07, $this->group03));        
    }

    /**
     * The test of method create().
     *
     * @return void
     */
    public function testCreate()
    {
        $pol = new GroupPolicy();
        $this->assertTrue($pol->create($this->user00));        
        $this->assertFalse($pol->create($this->user01));        
        $this->assertFalse($pol->create($this->user02));        
        $this->assertFalse($pol->create($this->user03));        
        $this->assertFalse($pol->create($this->user04));        
        $this->assertFalse($pol->create($this->user05));        
        $this->assertTrue($pol->create($this->user06));        
        $this->assertFalse($pol->create($this->user07));        
        $this->assertFalse($pol->create($this->user08));        
    }

    /**
     * The test of method update().
     *
     * @return void
     */
    public function testUpdate()
    {
        $pol = new GroupPolicy();
        $this->assertTrue($pol->update($this->user00, $this->group03));        
        $this->assertFalse($pol->update($this->user01, $this->group03));        
        $this->assertFalse($pol->update($this->user02, $this->group03));        
        $this->assertTrue($pol->update($this->user03, $this->group03));        
        $this->assertFalse($pol->update($this->user04, $this->group03));        
        $this->assertFalse($pol->update($this->user05, $this->group03));        
        $this->assertTrue($pol->update($this->user06, $this->group03));        
        $this->assertFalse($pol->update($this->user07, $this->group03));        
        $this->assertFalse($pol->update($this->user08, $this->group03));        
    }

    /**
     * The test of method delete().
     *
     * @return void
     */
    public function testDelete()
    {
        $pol = new GroupPolicy();
        $this->assertTrue($pol->delete($this->user00, $this->group03));        
        $this->assertFalse($pol->delete($this->user01, $this->group03));        
        $this->assertFalse($pol->delete($this->user02, $this->group03));        
        $this->assertFalse($pol->delete($this->user03, $this->group03));        
        $this->assertFalse($pol->delete($this->user04, $this->group03));        
        $this->assertFalse($pol->delete($this->user05, $this->group03));        
        $this->assertTrue($pol->delete($this->user06, $this->group03));        
        $this->assertFalse($pol->delete($this->user07, $this->group03));        
        $this->assertFalse($pol->delete($this->user08, $this->group03));        
    }
}
