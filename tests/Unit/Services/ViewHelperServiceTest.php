<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Lang;
use Tests\Unit\UnitTestHelper;
use App\Services\ViewHelperService;
use App\User;
use App\Message;

class ViewHelperServiceTest extends TestCase
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
     * The test of method setTimezone().
     *
     * @return void
     */
    public function testSetTimezone()
    {
        $vh = new ViewHelperService();
        $this->assertNull($vh->setTimezone(null));
        $val = new DateTime();
        $this->assertEquals(
            env('APP_DEFAULT_TIMEZONE'),
            $vh->setTimezone($val)->getTimeZone()->getName()
        );

        Auth::login($this->user01);
        $ret = $vh->setTimezone($val);
        $this->assertEquals(
            env('APP_DEFAULT_TIMEZONE'),
            $vh->setTimezone($val)->getTimeZone()->getName()
        );
        Auth::logout();

        Auth::login($this->user03);
        $this->assertEquals(
            'Europe/London',
            $vh->setTimezone($val)->getTimeZone()->getName()
        );
        Auth::logout();
    }

    /**
     * The test of method formatDate().
     *
     * @return void
     */
    public function testFormatDate()
    {
        $vh = new ViewHelperService();
        $this->assertNull($vh->formatDate(null));
        $val = new DateTime('2012-03-04T05:06:07');
        $this->assertEquals(
            $vh->setTimezone($val)->format(env('APP_DATE_FORMAT')),
            $vh->formatDate($val)
        );
    }

    /**
     * The test of method formatTime().
     *
     * @return void
     */
    public function testFormatTime()
    {
        $vh = new ViewHelperService();
        $this->assertNull($vh->formatTime(null));
        $val = new DateTime('2012-03-04T05:06:07');
        $this->assertEquals(
            $vh->setTimezone($val)->format(env('APP_TIME_FORMAT')),
            $vh->formatTime($val)
        );
    }

    /**
     * The test of method formatDateTime().
     *
     * @return void
     */
    public function testFormatDateTime()
    {
        $vh = new ViewHelperService();
        $this->assertNull($vh->formatDateTime(null));
        $val = new DateTime('2012-03-04T05:06:07');
        $this->assertEquals(
            $vh->setTimezone($val)->format(env('APP_DATE_TIME_FORMAT')),
            $vh->formatDateTime($val)
        );
    }

    /**
     * The test of method formatTimestamp().
     *
     * @return void
     */
    public function testFormatTimestamp()
    {
        $vh = new ViewHelperService();
        $this->assertNull($vh->formatTimestamp(null));
        $val = new DateTime('2012-03-04T05:06:07');
        $this->assertEquals(
            $vh->setTimezone($val)->format(env('APP_TIMESTAMP_FORMAT')),
            $vh->formatTimestamp($val)
        );
    }

    /**
     * The test of method message().
     *
     * @return void
     */
    public function testMessage()
    {
        $vh = new ViewHelperService();
        Message::create([
            'key' => 'test01',
            'locale' => Lang::getLocale(),
            'message' => 'message of test01',
        ]);
        Message::create([
            'key' => 'test01',
            'locale' => 'zz',
            'message' => 'message of test01(zz)',
        ]);
        Message::create([
            'key' => 'test02',
            'locale' => 'zz',
            'message' => 'message of test02(zz)',
        ]);
        $this->assertEquals(
            'test00',
            $vh->message('test00')
        );
        $this->assertEquals(
            'message of test01',
            $vh->message('test01')
        );
        $this->assertEquals(
            'test02',
            $vh->message('test02')
        );
    }
}