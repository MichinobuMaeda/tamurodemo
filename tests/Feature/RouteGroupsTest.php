<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
// use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;

use App\Group;

class RouteGroupsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
    }

    /**
     * The test of route: group.
     *
     * @return void
     */
    public function testGroup()
    {
        $response = $this->get(route('group', ['group' => $this->group01->id]));
        $response->assertRedirect(route('list.logins'));

        Auth::login($this->user01);

        $response = $this->get(route('group', ['group' => $this->group01->id]));
        $response->assertViewIs('group');
    }

    /**
     * The test of route: group.edit.
     *
     * @return void
     */
    public function testGroupProfile()
    {
        $response = $this->get(route('group.edit', ['group' => $this->group01->id]));
        $response->assertRedirect(route('list.logins'));

        Auth::login($this->user02);

        $response = $this->get(route('group.edit', ['group' => $this->group01->id]));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        Auth::login($this->user01);

        $response = $this->get(route('group.edit', ['group' => $this->group01->id]));
        $response->assertViewIs('group_profile');

        $response = $this->put(
            route('group', ['group' => $this->group01->id]),
            [
                'name' => 'test name1',
                'desc' => 'test desc1',
            ]
        );
        $response->assertRedirect(route('group.edit', ['group' => $this->group01->id]));
        $this->group01->refresh();
        $this->group01->refresh();
        $this->assertEquals('test name1', $this->group01->name);
        $this->assertEquals('test desc1', $this->group01->desc);
    }
}
