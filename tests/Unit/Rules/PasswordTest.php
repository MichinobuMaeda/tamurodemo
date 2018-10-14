<?php

namespace Tests\Unit\Rules;

use Tests\TestCase;
use App\Rules\Password;

class PasswordTest extends TestCase
{
    /**
     * The test of method passes().
     *
     * @return void
     */
    public function testPasses()
    {
        $rule = new Password();
        $this->assertTrue($rule->passes(null, 'Aa0'));
        $this->assertTrue($rule->passes(null, 'Aa0#'));
        $this->assertFalse($rule->passes(null, 'a0#'));
        $this->assertFalse($rule->passes(null, 'A0#'));
        $this->assertFalse($rule->passes(null, 'Aa#'));
    }

    /**
     * The test of method message().
     *
     * @return void
     */
    public function testMessage()
    {
        $rule = new Password();
        $this->assertEquals(
            trans('tamuro.password_chars'),
            $rule->message()
        );
    }
}
