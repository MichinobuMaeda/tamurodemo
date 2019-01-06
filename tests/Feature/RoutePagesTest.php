<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\Auth;
use Tests\Unit\UnitTestHelper;

use App\User;

class RoutePagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp()
    {
        parent::setUp();
        $this->helper = new UnitTestHelper($this);
        $this->helper->prepareGroupsAndUsers();
        $this->user00 = User::where('name', 'Primary user')->first();
    }

    /**
     * The test of route: page.back / page.forward.
     *
     * @return void
     */
    public function testBack()
    {
        Auth::login($this->user00);

        $this->get(route('home'));
        $this->get(route('users'));

        // back
        $response = $this->get(route('page.back'));
        $response->assertRedirect(route('home'));

        // forward
        $response = $this->get(route('page.forward'));
        $response->assertRedirect(route('users'));

        // after redirect
        $response = $this->get(route('user.login', ['user' => $this->user00->id]));
        $response->assertRedirect(route('preferences.login'));
        $this->get(route('preferences.login'));

        $response = $this->get(route('page.back'));
        $response->assertRedirect(route('users'));
    }
}
