<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

use DateTime;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\Unit\UnitTestHelper;
use App\Services\OAuthService;
use App\AuthProvider;

class OAuthServiceTest extends TestCase
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
     * The test of method register().
     *
     * @return void
     */
    public function testRegister()
    {
        $svc = new OAuthService();
        $user = $this->user01;
        $svc->providers = [
            'provider1' => function ($id_token) { return 'secret1'; },
            'provider2' => function ($id_token) { return null; },
        ];

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) - 1).' minutes'
        );
        $this->assertTrue($svc->register($user, 'token1', 'provider1', 'return1'));

        $user->invitation_token = 'token1';
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) - 1).' minutes'
        );
        $this->assertFalse($svc->register($user, 'token1', 'provider2', 'return1'));
        $this->assertFalse($svc->register(null, 'token1', 'provider1', 'return1'));
        $this->assertFalse($svc->register($user, null, 'provider1', 'return1'));
        $this->assertFalse($svc->register($user, 'token1', null, 'return1'));
        $this->assertFalse($svc->register($user, 'dummy', 'provider1', 'return1'));
        $user->invited_at = (new DateTime())->modify(
            '-'.(env('APP_INVITATION_EXPIRE', 60) + 1).' minutes'
        );
        $this->assertFalse($svc->register($user, 'token1', 'provider1', 'return1'));
    }

    /**
     * The test of method loginWithOAuthProvider().
     *
     * @return void
     */
    public function testLogin()
    {
        $svc = new OAuthService();
        $user = $this->user01;
        $svc->providers = [
            'provider1' => function ($id_token) { return 'secret1'; },
            'provider2' => function ($id_token) { return null; },
            'provider3' => function ($id_token) { return 'dummy'; },
        ];

        $ap1 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'provider1',
            'secret' => hash('sha256', 'provider1'.'secret1'.env('APP_KEY')),
        ]);
        $ap1->save();
        $ap3 = new AuthProvider([
            'user_id' => $user->id,
            'provider' => 'provider3',
            'secret' => hash('sha256', 'provider3'.'secret3'.env('APP_KEY')),
        ]);
        $ap3->save();

        $this->assertFalse($svc->login(null, 'return1'));
        $this->assertFalse($svc->login('provider1', null));
        $this->assertFalse($svc->login('provider2', 'return1'));
        $this->assertFalse($svc->login('provider3', 'return3'));
        $this->assertTrue($svc->login('provider1', 'return1'));
    }

    /**
     * The test of method providers['google']() --> OK.
     *
     * @return void
     */
    public function testGoogleOk()
    {
        $svc = new OAuthService();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(['sub' => 'secret1']);

        $this->assertEquals('secret1', $svc->providers['google']('test_token'));
    }

    /**
     * The test of method providers['google']() --> NG.
     *
     * @return void
     */
    public function testGoogleNG()
    {
        $svc = new OAuthService();

        $mock = \Mockery::mock('overload:'.\Google_Client::class);
        $mock->shouldReceive('verifyIdToken')->andReturn(null);

        $this->assertNull($svc->providers['google']('test_token'));
    }

    /**
     * The test of method providers['facebook']() --> OK.
     *
     * @return void
     */
    public function testFacebookOk()
    {
        $svc = new OAuthService();

        $mock = \Mockery::mock('overload:'.\Facebook\Facebook::class);
        $mock->shouldReceive('get')->andReturn(new class {
            public function getGraphUser() {
                return new class {
                    public function getId() {
                        return 'secret3';
                    }
                };
            }
        });

        $this->assertEquals('secret3', $svc->providers['facebook']('test_token'));
    }

    /**
     * The test of method providers['yahoo_jp']() --> OK.
     *
     * @return void
     */
    public function testYahooJpOk()
    {
        $svc = new OAuthService();

        $code = 'wwic4Wrf';
        $nonce = '2fd3yolreld1lnxjyod7zq';

        $mock = \Mockery::mock('overload:'.\GuzzleHttp\Client::class);
        $mock->shouldReceive('request')
            ->with('POST', 'https://auth.login.yahoo.co.jp/yconnect/v2/token')
            ->andReturn(new class {
                public function getStatusCode() { return 200; }
                public function getBody() { return '{"access_token":"_TZaaTVq4rKhM1DME2cmvnBzPiczqqao4q_IzJcO9wuv0LQRcYv7_dzfQdSLsBTMkCB83edykhog5utB2RiD_Jnx8OYhVv9QhzOlwTkwpghNXavIZ.WJklTfRFjDHJK4FJzAdR2Ze8DTZ4CDBTmDC_SGWTAn7TfrwK5_nUCXvObnJe5MUUsLRvGyx.5MfJHsElkzYfSyQTKiEXpoitE10_Eil4qNWSWdYk.7._ICP5YVD786CK_RivSk0L5p5TiG_SRHzyZUaV6A2KqpFBq44pA5OlznxWgtbQKjzKOj0A5kSkGFvX8Tbw7VY4rxYM6uG.eCEJDC.PtzxBqlX0oFDcg02SM6kwz3_CQuYRVQIdHNaByvZbFY5WzzO_g772lnE1N_5U0W19rpBjBICAELSsnD4YttuClguNKpefMONQQCnyOmZRvTYe3aervMKZ91ztOPVSWwdUMILpbvZ2pCnwKmFoPbN0OIVm2xNDlorN0GOGIlINrgutRvVe6MnywDgS4.LkfsWhezGYVNhC3pr8HbH.NxrmqQP_B.mMb7JRXxaccscqmhc2yGs24EYi3jJ7hW36FvvO_na0_ogzyQppDYjlvfX_UyeIobTWXXbx7E5dDBrHZzbLkq0cz1YMTs6xf19.npdqenFu4bL2mLXflYx5USOY8A84jqgCqtpLUmPxCK6VhR_DzOypr8aBcVAtudBgz5uaykd2WV.RiwU0dk7cbn9I6iFj5aIEuxHyiMwfIRzXAw5443G3hvP8ZfB7ugFoIQkZDiAgNximMxCtLPGnDqlBZxlRoXHfXOVW.5tCfFv3Bo8zb_X2GJsQ0GCwcRRN82fJ__pYYrIclXHrVkb5RLv388AVbYDgMHTaF7X3z2EliHItN0TE4wq3BZ.fY5F72U5cPDl0IXxJf0LiknsmfkXdeNXixpPL4p4LKOgzM035M4bI4RyZGkNvLFmTHHtGroyC_LsbMbuU_xe9jab12wcHl8by4.G.OvPSUfhiEzysULHNOedogbG4asU1FS6_mrkkUdJsvgCSVcid7HRKBqkTPUVfF0rpy3dl_sFqCbtBCUb4Nj13oDe0HThyb_yf5tlYFYd5ZWKU.MBrlKUhjmilZIjIPjR9uaL.gvZDeIfO42e8m7mGSEjAMBRFoDlMgmeVdJ4BTRPhPk6X4mbb7mZcYMnPbgoZ3mH4IyYstBKiq9TNXqoeNjN3IOP_oWVT0Exxg_PhukClo.xZOl1aHtp6keO.m97N78KmUnPGK96hMXDz3qmBNPtUp3CPdZLuYQUSAWz_ISRNQ4whaU6ttR64NI9UfE2_GNwf6UngDymRCRp4NRHRa8ko7R2Hiw9dh9C1tRkDdTzZ0vBkHn_2lrOAaccMSIaxtxw1o9PEO9zJoysQrJJvY_KqdREJwISsXYZfaf86rDSFZis6aNzaU3q99Zl8ZEd0g_xKxm2zRp8epzNzAsclDJCKzkczMF9n1NlfUXNYzECDIxo8MpJghHq_9HDpJ9tabSf5a75nkiTYJDwqqldyzz_oFayg5EHC_31rQeqX6gdmMqvNhqzz6hUZlFGE79em9.NiCy8Act6bxCxNpH1u3BT8mX827Uq.RzXG9Gu99HJRr4O4YLIOBIK.67kwjC3KOhDuUZupjg6xzgX1Ruk1J8Ud3dymcHF4WJO8xlFnEZ98p.jB5R0z4ROABzAQeOdjOWJs2wtSc-","token_type":"Bearer","expires_in":3600,"id_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0.eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODUzNjQ2LCJpYXQiOjE1NDY0MzQ0NDYsImFtciI6WyJwd2QiXSwibm9uY2UiOiIyZmQzeW9scmVsZDFsbnhqeW9kN3pxIiwiYXRfaGFzaCI6ImRYQzVkbjdDY09zLUdGazc3QldoSXcifQ.rOhcuQ61Ara68mNZRsCsaPc--1dfPd7rJ-a5cc8XerEfEnYFna43L87_AY1rhsqoIx6qcsiqJqsN8W0R_aMimQ2PciytVJyhLE8KlOj9ImEw3YqT5dgq0AFE0TiJQ_d-E9aCaTbsh1lzNlVn7dTiEQNfBe1g4pug5axOnWnlbJSsO7lxsWmrTom-dlD9-_Cx5WCnDtPRVmK4Qy3MtsOaUUnylyYZUpGSJnVj6z7n5wOW21W5Mrq6RRbixRbGUc_zj1sUyObj2c3LINgXQAzF3EhH2jD4PFpOeF8X4a26IZPAbpvai3mRuAGZeUL9S8fSlfQmIyLWmMzjJhkpEs5f3A","refresh_token":"dopc8jNnPp5XhyT9FMpZVFdBs6kEl4NoGK07hw9P5l4cQHmYAEFYUM0YaeMlcFHRtmea.1KGFHVY"}'; }
            });
        $mock = \Mockery::mock('overload:'.\GuzzleHttp\Client::class);
        $mock->shouldReceive('request')
            ->with('GET', 'https://auth.login.yahoo.co.jp/yconnect/v2/public-keys')
            ->andReturn(new class {
                public function getStatusCode() { return 200; }
                public function getBody() { return '{"access_token":"_TZaaTVq4rKhM1DME2cmvnBzPiczqqao4q_IzJcO9wuv0LQRcYv7_dzfQdSLsBTMkCB83edykhog5utB2RiD_Jnx8OYhVv9QhzOlwTkwpghNXavIZ.WJklTfRFjDHJK4FJzAdR2Ze8DTZ4CDBTmDC_SGWTAn7TfrwK5_nUCXvObnJe5MUUsLRvGyx.5MfJHsElkzYfSyQTKiEXpoitE10_Eil4qNWSWdYk.7._ICP5YVD786CK_RivSk0L5p5TiG_SRHzyZUaV6A2KqpFBq44pA5OlznxWgtbQKjzKOj0A5kSkGFvX8Tbw7VY4rxYM6uG.eCEJDC.PtzxBqlX0oFDcg02SM6kwz3_CQuYRVQIdHNaByvZbFY5WzzO_g772lnE1N_5U0W19rpBjBICAELSsnD4YttuClguNKpefMONQQCnyOmZRvTYe3aervMKZ91ztOPVSWwdUMILpbvZ2pCnwKmFoPbN0OIVm2xNDlorN0GOGIlINrgutRvVe6MnywDgS4.LkfsWhezGYVNhC3pr8HbH.NxrmqQP_B.mMb7JRXxaccscqmhc2yGs24EYi3jJ7hW36FvvO_na0_ogzyQppDYjlvfX_UyeIobTWXXbx7E5dDBrHZzbLkq0cz1YMTs6xf19.npdqenFu4bL2mLXflYx5USOY8A84jqgCqtpLUmPxCK6VhR_DzOypr8aBcVAtudBgz5uaykd2WV.RiwU0dk7cbn9I6iFj5aIEuxHyiMwfIRzXAw5443G3hvP8ZfB7ugFoIQkZDiAgNximMxCtLPGnDqlBZxlRoXHfXOVW.5tCfFv3Bo8zb_X2GJsQ0GCwcRRN82fJ__pYYrIclXHrVkb5RLv388AVbYDgMHTaF7X3z2EliHItN0TE4wq3BZ.fY5F72U5cPDl0IXxJf0LiknsmfkXdeNXixpPL4p4LKOgzM035M4bI4RyZGkNvLFmTHHtGroyC_LsbMbuU_xe9jab12wcHl8by4.G.OvPSUfhiEzysULHNOedogbG4asU1FS6_mrkkUdJsvgCSVcid7HRKBqkTPUVfF0rpy3dl_sFqCbtBCUb4Nj13oDe0HThyb_yf5tlYFYd5ZWKU.MBrlKUhjmilZIjIPjR9uaL.gvZDeIfO42e8m7mGSEjAMBRFoDlMgmeVdJ4BTRPhPk6X4mbb7mZcYMnPbgoZ3mH4IyYstBKiq9TNXqoeNjN3IOP_oWVT0Exxg_PhukClo.xZOl1aHtp6keO.m97N78KmUnPGK96hMXDz3qmBNPtUp3CPdZLuYQUSAWz_ISRNQ4whaU6ttR64NI9UfE2_GNwf6UngDymRCRp4NRHRa8ko7R2Hiw9dh9C1tRkDdTzZ0vBkHn_2lrOAaccMSIaxtxw1o9PEO9zJoysQrJJvY_KqdREJwISsXYZfaf86rDSFZis6aNzaU3q99Zl8ZEd0g_xKxm2zRp8epzNzAsclDJCKzkczMF9n1NlfUXNYzECDIxo8MpJghHq_9HDpJ9tabSf5a75nkiTYJDwqqldyzz_oFayg5EHC_31rQeqX6gdmMqvNhqzz6hUZlFGE79em9.NiCy8Act6bxCxNpH1u3BT8mX827Uq.RzXG9Gu99HJRr4O4YLIOBIK.67kwjC3KOhDuUZupjg6xzgX1Ruk1J8Ud3dymcHF4WJO8xlFnEZ98p.jB5R0z4ROABzAQeOdjOWJs2wtSc-","token_type":"Bearer","expires_in":3600,"id_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0.eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODUzNjQ2LCJpYXQiOjE1NDY0MzQ0NDYsImFtciI6WyJwd2QiXSwibm9uY2UiOiIyZmQzeW9scmVsZDFsbnhqeW9kN3pxIiwiYXRfaGFzaCI6ImRYQzVkbjdDY09zLUdGazc3QldoSXcifQ.rOhcuQ61Ara68mNZRsCsaPc--1dfPd7rJ-a5cc8XerEfEnYFna43L87_AY1rhsqoIx6qcsiqJqsN8W0R_aMimQ2PciytVJyhLE8KlOj9ImEw3YqT5dgq0AFE0TiJQ_d-E9aCaTbsh1lzNlVn7dTiEQNfBe1g4pug5axOnWnlbJSsO7lxsWmrTom-dlD9-_Cx5WCnDtPRVmK4Qy3MtsOaUUnylyYZUpGSJnVj6z7n5wOW21W5Mrq6RRbixRbGUc_zj1sUyObj2c3LINgXQAzF3EhH2jD4PFpOeF8X4a26IZPAbpvai3mRuAGZeUL9S8fSlfQmIyLWmMzjJhkpEs5f3A","refresh_token":"dopc8jNnPp5XhyT9FMpZVFdBs6kEl4NoGK07hw9P5l4cQHmYAEFYUM0YaeMlcFHRtmea.1KGFHVY"}'; }
            });
    }

    /**
     * The test of method providers['facebook']() --> NG.
     *
     * @return void
     */
    public function testFacebookNG()
    {
        $svc = new OAuthService();

        $mock = \Mockery::mock('overload:'.\Facebook\Facebook::class);
        $mock->shouldReceive('get')->andReturn(new class {
            public function getGraphUser() {
                throw new \Exception('test');
            }
        });

        $this->assertNull($svc->providers['facebook']('test_token'));
    }

    /**
     * The test of method base64UrlDecode().
     *
     * @return void
     */
    public function testBase64UrlDecode()
    {
        $svc = new OAuthService();

        $this->assertEquals(
            '{"typ":"JWT","alg":"RS256","kid":"0cc175b9c0f1b6a831c399e269772661"}',
            $svc->base64UrlDecode('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0')
        );
        $this->assertEquals(
            '{"iss":"https:\/\/auth.login.yahoo.co.jp\/yconnect\/v2","sub":"ZXR7AS43OAFD7J3LSYD5CCJN5A","aud":["dj00aiZpPXpiNE1PVUJFVDYyTyZzPWNvbnN1bWVyc2VjcmV0Jng9YTI-"],"exp":1548850382,"iat":1546431182,"amr":["pwd"],"nonce":"877d5uw9it8vu6ymm8t5a","at_hash":"9O5xIKygbRDwc3sVX-Z66w"}',
            $svc->base64UrlDecode('eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODUwMzgyLCJpYXQiOjE1NDY0MzExODIsImFtciI6WyJwd2QiXSwibm9uY2UiOiI4NzdkNXV3OWl0OHZ1NnltbTh0NWEiLCJhdF9oYXNoIjoiOU81eElLeWdiUkR3YzNzVlgtWjY2dyJ9')
        );
        $this->assertEquals(
            '{"typ":"JWT","alg":"RS256","kid":"0cc175b9c0f1b6a831c399e269772661"}',
            $svc->base64UrlDecode('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0')
        );
        $this->assertEquals(
            '{"iss":"https:\/\/auth.login.yahoo.co.jp\/yconnect\/v2","sub":"ZXR7AS43OAFD7J3LSYD5CCJN5A","aud":["dj00aiZpPXpiNE1PVUJFVDYyTyZzPWNvbnN1bWVyc2VjcmV0Jng9YTI-"],"exp":1548850392,"iat":1546431192,"amr":["pwd"],"nonce":"1ix72qammwkyc60lv5yi6f","at_hash":"PZE95P7RQHpFRfk7wnP5vA"}',
            $svc->base64UrlDecode('eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODUwMzkyLCJpYXQiOjE1NDY0MzExOTIsImFtciI6WyJwd2QiXSwibm9uY2UiOiIxaXg3MnFhbW13a3ljNjBsdjV5aTZmIiwiYXRfaGFzaCI6IlBaRTk1UDdSUUhwRlJmazd3blA1dkEifQ')
        );
        $this->assertEquals(
            '{"typ":"JWT","alg":"RS256","kid":"0cc175b9c0f1b6a831c399e269772661"}',
            $svc->base64UrlDecode('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0')
        );
        $this->assertEquals(
            '{"iss":"https:\/\/auth.login.yahoo.co.jp\/yconnect\/v2","sub":"ZXR7AS43OAFD7J3LSYD5CCJN5A","aud":["dj00aiZpPXpiNE1PVUJFVDYyTyZzPWNvbnN1bWVyc2VjcmV0Jng9YTI-"],"exp":1548850401,"iat":1546431201,"amr":["pwd"],"nonce":"aeq4mosaqo97xryb2sp","at_hash":"gCVuH-VXls3vVDjNQagNVQ"}',
            $svc->base64UrlDecode('eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODUwNDAxLCJpYXQiOjE1NDY0MzEyMDEsImFtciI6WyJwd2QiXSwibm9uY2UiOiJhZXE0bW9zYXFvOTd4cnliMnNwIiwiYXRfaGFzaCI6ImdDVnVILVZYbHMzdlZEak5RYWdOVlEifQ')
        );
    }

    /**
     * The test of method base64UrlEncode().
     *
     * @return void
     */
    public function testBase64UrlEncode()
    {
        $svc = new OAuthService();

        $this->assertEquals(
            '5ryi5a2XYWJjZGVmZ-OBgg',
            $svc->base64UrlEncode('漢字abcdefgあ')
        );
    }

    /**
     * The test of method verifySignatureYahooJp().
     *
     * @return void
     */
    public function testVerifySignatureYahooJp()
    {
        $svc = new OAuthService();

        $id_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0.eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODUyMjUwLCJpYXQiOjE1NDY0MzMwNTAsImFtciI6WyJwd2QiXSwibm9uY2UiOiJydW44eHBwajNkc2xndnh4Z2lkZDkiLCJhdF9oYXNoIjoiMnBWQ2w2S1kySG1pT1dOSmFkUm1mZyJ9.tOxYAmE8-7lrnM19OdPr-hy0TzS_XinIeFaXO2SaqomYTAk0qBiuKccZErRGxGncmlMFbVRvQFHu4y4fwcRjMXIhTyOtbxacxj2amGTZV6B50UonL11jBxfbH8SMnb8hK80RRKiXIIDC0xTDxJEuCmjionq8GS6fkdsakM_ufTKIBCh5GLBA4LDSwrmMNT501BuAvPwxXmJ319mJI8fYpJatDm9T7aBmUthukHlYQ-Vze4HL_T8Of47433Njma_-0svXtDDMRlYufYkO4lRxnUiNUX8rZDm_pQ2mkGJL2XQq75XDGqnN6WQHZvWLwT7wxBTiVqIhRhRqG2WyvgULgw';
        $public_key = <<<EOT
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0bXcnrheJ2snfq1wv6Qz
8+TEPDGKHCM0SsrQjxEFpXSEycL2/A+oW1ZGUzCuhz4HH4wkvc4CDJl25johSIUT
Vyo4mrFrJ0ab0QAhrWE7gMyWFIfraj9cksPAGyVAiXLCN9Ly2xuoJxFjCAZXw1VO
8i7RTYK8ZP6dhcosiyzdhYt7C/65B5ikmCS4AymXIa83QQanCtjoGiwy4Cf2pLnn
9zXMZEnqQ+wwSoGn32YExmap7GAtjOwHNWU5zpW3dwNMq+zkcln3ICEBwxDpWJhE
ZHZPBpPWgN+dQZDR2FiGHJgUFE3EM+CIcwxekrRBP+R3xEUeMFf5z1HeQNK8sjZe
RwIDAQAB
-----END PUBLIC KEY-----
EOT;
        $a = preg_split('/\./', $id_token);
        $this->assertTrue($svc->verifySignatureYahooJp($a[0], $a[1], $a[2], $public_key));
        $this->assertFalse($svc->verifySignatureYahooJp('', $a[1], $a[2], $public_key));
        $this->assertFalse($svc->verifySignatureYahooJp($a[0], $a[1], $a[2], ''));
    }

    /**
     * The test of method verifyPayloadYahooJp().
     *
     * @return void
     */
    public function testVerifyPayloadYahooJp()
    {
        $svc = new OAuthService();

        $payload1 = json_decode(preg_replace(
            '/valid_client_id/',
            env('YAHOO_JP_CLIENT_ID'),
            <<<EOT
{
    "iss": "https://auth.login.yahoo.co.jp/yconnect/v2",
    "aud": ["client_id_0", "client_id_1", "valid_client_id"],
    "nonce": "nonce_1",
    "exp": 123500,
    "iat": 123000
}
EOT
        ));

        $this->assertTrue($svc->verifyPayloadYahooJp($payload1, 'nonce_1', 123500));
        $this->assertFalse($svc->verifyPayloadYahooJp($payload1, 'nonce_1', 123501));
        $this->assertFalse($svc->verifyPayloadYahooJp($payload1, 'nonce_2', 123500));

        $payload2 = json_decode(<<<EOT
{
    "iss": "https://auth.login.yahoo.co.jp/yconnect/v2",
    "aud": ["client_id_0", "client_id_1", "client_id_2"],
    "nonce": "nonce_1",
    "exp": 123500,
    "iat": 123000
}
EOT
        );

        $this->assertFalse($svc->verifyPayloadYahooJp($payload2, 'nonce_1', 123500));

        $payload3 = json_decode(preg_replace(
            '/valid_client_id/',
            env('YAHOO_JP_CLIENT_ID'),
            <<<EOT
{
    "iss": "https://auth.login.yahoo.co.jp/yconnect/v1",
    "aud": ["client_id_0", "client_id_1", "valid_client_id"],
    "nonce": "nonce_1",
    "exp": 123500,
    "iat": 123000
}
EOT
        ));

        $this->assertFalse($svc->verifyPayloadYahooJp($payload3, 'nonce_1', 123500));

        $payload4 = json_decode(preg_replace(
            '/valid_client_id/',
            env('YAHOO_JP_CLIENT_ID'),
            <<<EOT
{
    "iss": "https://auth.login.yahoo.co.jp/yconnect/v2",
    "aud": ["client_id_0", "client_id_1", "valid_client_id"],
    "nonce": "nonce_1",
    "exp": 123900,
    "iat": 123000
}
EOT
        ));

        $this->assertTrue($svc->verifyPayloadYahooJp($payload4, 'nonce_1', 123600));
        $this->assertFalse($svc->verifyPayloadYahooJp($payload4, 'nonce_1', 123601));
    }
}
