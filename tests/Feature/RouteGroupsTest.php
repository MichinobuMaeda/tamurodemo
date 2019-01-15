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

        $response = $this->get(route('group', ['group' => $this->pri->id]));
        $response->assertRedirect(route('home'));
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

    /**
     * The test of route: user.create.form.
     *
     * @return void
     */
    public function testUserCreate()
    {
        $response = $this->get(route('group.create.form'));
        $response->assertRedirect(route('list.logins'));

        $response = $this->post(route('groups'));
        $response->assertRedirect(route('list.logins'));

        Auth::login($this->user01);

        $response = $this->get(route('group.create.form'));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        $response = $this->post(route('groups'));
        $response->assertStatus($this->helper::HTTP_RESP_STT_FORBIDDEN);

        Auth::login($this->user00);

        $response = $this->get(route('group.create.form'));
        $response->assertViewIs('group_new');

        $response = $this->post(route('groups'), [
            'higher' => $this->pri->id,
            'name' => null,
            'desc' => 'desc new',
        ]);
        $response->assertRedirect(route('group.create.form'));

        $response = $this->post(route('groups'), [
            'higher' => $this->pri->id,
            'name' => 'name new',
            'desc' => 'desc new',
        ]);
        $model = Group::where('name', 'name new')->first();
        $response->assertRedirect(route('group', ['group' => $model->id]));
    }
}
