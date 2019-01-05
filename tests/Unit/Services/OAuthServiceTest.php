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

const YAHOO_TOKEN_URL = 'https://auth.login.yahoo.co.jp/yconnect/v2/token';
const YAHOO_TOKEN_BODY = '{"access_token":"CPbFL28bvI5iy0M0jJeX1Eq76cWsWrNtNumhYxwTzUw.qS1niAl5pmTuJHNbJxjGKM4wx19nPKsdxrpbM4MI_gAGxwOL.j6zOKok9A4kkKBn77uyCwtusNwAFss9_y48BzodXZ1Ci4VWDGpEzPeb3QrtjsFM07JO3JiZzez2vi1v0o8skRbZOXlnHygGmegKTLS.Fma6qfCslcr7FDUDjUkdWwoLDX0uYPYDgKlYo4m2UogsowqaRofvuZVFrt239GF4iQLKjvb3VVVtlYQKQiF5mQrz99.20ucgyqLpRWTQqTZtbUTTqYftphB7slXb4aHL1DwR452g3jrVlAdIk0pQNHITmC_vVvCNXWLpN9pEPnfXUWhzr47xO0sS60KZdvSUcB6XYZwLdqckqdLtW8miHfCdvKJ3O.X8Q7aWAkeGnMPu17dulBuwQUnDaSbtufZjypApDaQpy01cmVsDYOQD.Fya2u3of6SMllGK_uS.i4GwU15ID3eE7N_UQY6LAd5NDjXVoRgGbZCQ1JTDymVnU.Ck8EkbF_JNgeafcvruT08D29uKK6jlvrQwhPny6S9j0rZKTWyvlxlDRISP82FYsX95Lp8s_LBqChOeEpHH6SZ4tZSCCHjPAi8kLesgX_iZVIJpu_pr4FUR8xVrZRxuXLZIkinUVjxqYjaxrMJ7yUO19sWXKKVtvO9a7lrKKbECvXxhOkm1HFQly_q4rSdRqj5sLFZfbZYHlBWnn3xSDYvT1YUp5S.HSVlNkVF7YYitGu3nS28jyFSc3.wvnUbJn_IyhTG77CB9xuQuYy2Kgkfa3HIBibweUC0e8hjQpGKV7PFChk1GtaC3vr8rjKAr_vGPiDkSQj4jmgSs.cFjpvmVaZ3jtuQdz.FgyjW14xCJFBYx3_GgfVNx1dxtnXiIxu7ICpINPI8cA98XfeGvpsa_O9aFgfANdSWEPz.285.AU4hP6tfxdKYCiokqwo.hMUR1dCnBV8yG842ufLZbgJhf0It2hKSRcZ5DoIbjc7Q0FnJ65t0IQhvw.V82oAe9LCQ5mCIR0APIz8Fm0QH_uTA6ns0gCAgv3K1mC_6rLWfMWmE6N2drjGIfaW_hINFCENwV5Pe8J3Vp_JyVE3Mmv.aV9lGL2EOkYOwkH7zP8DCFncLrlcvqULjF0l.fRNknUe0IDdHIL0Jkm0soXZhm_GgciYXDDqhNpGfc4f6_PRI09CrQ34SXDI4r46FYC5JiFSukC8iSoJg_ShYkj3oJKuz0MB_xDPBkupsAyL0YZCZrlkKUG6UokhDhuT7R83cObdWky_krM63uYH10rYdU9Cy0Sx8VEahDzlSY49zjc5G5Fm.9M806Om5IWOejzelYR31kZlFN5wOJsA8_Grggf6MGo8GE_U4NJbM8RZ7lOXxV5tsZAo.KDdHkt5uz2FjruYJMnba6eppwvQSN0RsrQeIrUCvYQs1Xkb6OFfP6uAaTF33WB9k45Hqmwl3YhfKswej9Jr5r5OPeeLaunReYI1mJMyPzfRNoQBY1JzmAMsb42efnkChdnZNQr.1rWidsc4Z_LrS9Qm8qXVBn1JQ6W6nnxcKWDu1AcS0KMNDpIsLnbyP_.c0Pe7RCZBVj7qqfj2_qUYsHY37o7wkcaFH1VmrPvf8Jp7PsrnqjmNTZvAynq1Fg9UtL9E0N.JAlhOLI7.2FI8mKk8IBIGy0FLOUhuY-","token_type":"Bearer","expires_in":3600,"id_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0.eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODY3MzMzLCJpYXQiOjE1NDY0NDgxMzMsImFtciI6WyJwd2QiXSwibm9uY2UiOiJmN2FoNXB6ZGQ4dTJnNjJiZTltZTl3N2EiLCJhdF9oYXNoIjoiOXlvYW15djdLOWV1UHJjQzZVS2hvZyJ9.sDLCWIYDeW32RYdS04Ql7tHZI_A3c7jyiemRV27lKsuMj765DfvaQuQMIqk_COcLMbpe8WHIBLN__WWYI15cTH0DFG13K9qYa9u1SVeeXWh6ADELOXg135m6LBDQqrrlBBMu0Y7wphQGMm-BdW55qBqEo82StRHCDf2Orun9eZsbEDKq2IKNHn6tDHWiR0lLteAcUOrfPLqRFoxLBx692G8PsAbbYV2wXEA7J-462b-q2_ls8fy9ZbGG5TUgdbpf0LN8ZIj1Bh-mK6Df2hW4KfhL2ci3tVJOQMHq7JiuTWZopGzDBM-7sPm0L6-f9krIzcNds8BEtbeFN3Di0Qc3rQ","refresh_token":"dopc8jNnPp5XhyT9FMpZVFdBs6kEl4NoGK07hw9P5l4cQHmYAEFYUM0YaeMlcFHRtmea.1KGFHVY"}';
const YAHOO_TOKEN_BODY_NG = '{"access_token":"xPbFL28bvI5iy0M0jJeX1Eq76cWsWrNtNumhYxwTzUw.qS1niAl5pmTuJHNbJxjGKM4wx19nPKsdxrpbM4MI_gAGxwOL.j6zOKok9A4kkKBn77uyCwtusNwAFss9_y48BzodXZ1Ci4VWDGpEzPeb3QrtjsFM07JO3JiZzez2vi1v0o8skRbZOXlnHygGmegKTLS.Fma6qfCslcr7FDUDjUkdWwoLDX0uYPYDgKlYo4m2UogsowqaRofvuZVFrt239GF4iQLKjvb3VVVtlYQKQiF5mQrz99.20ucgyqLpRWTQqTZtbUTTqYftphB7slXb4aHL1DwR452g3jrVlAdIk0pQNHITmC_vVvCNXWLpN9pEPnfXUWhzr47xO0sS60KZdvSUcB6XYZwLdqckqdLtW8miHfCdvKJ3O.X8Q7aWAkeGnMPu17dulBuwQUnDaSbtufZjypApDaQpy01cmVsDYOQD.Fya2u3of6SMllGK_uS.i4GwU15ID3eE7N_UQY6LAd5NDjXVoRgGbZCQ1JTDymVnU.Ck8EkbF_JNgeafcvruT08D29uKK6jlvrQwhPny6S9j0rZKTWyvlxlDRISP82FYsX95Lp8s_LBqChOeEpHH6SZ4tZSCCHjPAi8kLesgX_iZVIJpu_pr4FUR8xVrZRxuXLZIkinUVjxqYjaxrMJ7yUO19sWXKKVtvO9a7lrKKbECvXxhOkm1HFQly_q4rSdRqj5sLFZfbZYHlBWnn3xSDYvT1YUp5S.HSVlNkVF7YYitGu3nS28jyFSc3.wvnUbJn_IyhTG77CB9xuQuYy2Kgkfa3HIBibweUC0e8hjQpGKV7PFChk1GtaC3vr8rjKAr_vGPiDkSQj4jmgSs.cFjpvmVaZ3jtuQdz.FgyjW14xCJFBYx3_GgfVNx1dxtnXiIxu7ICpINPI8cA98XfeGvpsa_O9aFgfANdSWEPz.285.AU4hP6tfxdKYCiokqwo.hMUR1dCnBV8yG842ufLZbgJhf0It2hKSRcZ5DoIbjc7Q0FnJ65t0IQhvw.V82oAe9LCQ5mCIR0APIz8Fm0QH_uTA6ns0gCAgv3K1mC_6rLWfMWmE6N2drjGIfaW_hINFCENwV5Pe8J3Vp_JyVE3Mmv.aV9lGL2EOkYOwkH7zP8DCFncLrlcvqULjF0l.fRNknUe0IDdHIL0Jkm0soXZhm_GgciYXDDqhNpGfc4f6_PRI09CrQ34SXDI4r46FYC5JiFSukC8iSoJg_ShYkj3oJKuz0MB_xDPBkupsAyL0YZCZrlkKUG6UokhDhuT7R83cObdWky_krM63uYH10rYdU9Cy0Sx8VEahDzlSY49zjc5G5Fm.9M806Om5IWOejzelYR31kZlFN5wOJsA8_Grggf6MGo8GE_U4NJbM8RZ7lOXxV5tsZAo.KDdHkt5uz2FjruYJMnba6eppwvQSN0RsrQeIrUCvYQs1Xkb6OFfP6uAaTF33WB9k45Hqmwl3YhfKswej9Jr5r5OPeeLaunReYI1mJMyPzfRNoQBY1JzmAMsb42efnkChdnZNQr.1rWidsc4Z_LrS9Qm8qXVBn1JQ6W6nnxcKWDu1AcS0KMNDpIsLnbyP_.c0Pe7RCZBVj7qqfj2_qUYsHY37o7wkcaFH1VmrPvf8Jp7PsrnqjmNTZvAynq1Fg9UtL9E0N.JAlhOLI7.2FI8mKk8IBIGy0FLOUhuY-","token_type":"Bearer","expires_in":3600,"id_token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjBjYzE3NWI5YzBmMWI2YTgzMWMzOTllMjY5NzcyNjYxIn0.eyJpc3MiOiJodHRwczpcL1wvYXV0aC5sb2dpbi55YWhvby5jby5qcFwveWNvbm5lY3RcL3YyIiwic3ViIjoiWlhSN0FTNDNPQUZEN0ozTFNZRDVDQ0pONUEiLCJhdWQiOlsiZGowMGFpWnBQWHBpTkUxUFZVSkZWRFl5VHlaelBXTnZibk4xYldWeWMyVmpjbVYwSm5nOVlUSS0iXSwiZXhwIjoxNTQ4ODY3MzMzLCJpYXQiOjE1NDY0NDgxMzMsImFtciI6WyJwd2QiXSwibm9uY2UiOiJmN2FoNXB6ZGQ4dTJnNjJiZTltZTl3N2EiLCJhdF9oYXNoIjoiOXlvYW15djdLOWV1UHJjQzZVS2hvZyJ9.sDLCWIYDeW32RYdS04Ql7tHZI_A3c7jyiemRV27lKsuMj765DfvaQuQMIqk_COcLMbpe8WHIBLN__WWYI15cTH0DFG13K9qYa9u1SVeeXWh6ADELOXg135m6LBDQqrrlBBMu0Y7wphQGMm-BdW55qBqEo82StRHCDf2Orun9eZsbEDKq2IKNHn6tDHWiR0lLteAcUOrfPLqRFoxLBx692G8PsAbbYV2wXEA7J-462b-q2_ls8fy9ZbGG5TUgdbpf0LN8ZIj1Bh-mK6Df2hW4KfhL2ci3tVJOQMHq7JiuTWZopGzDBM-7sPm0L6-f9krIzcNds8BEtbeFN3Di0Qc3rQ","refresh_token":"dopc8jNnPp5XhyT9FMpZVFdBs6kEl4NoGK07hw9P5l4cQHmYAEFYUM0YaeMlcFHRtmea.1KGFHVY"}';
const YAHOO_PUBKY_URL = 'https://auth.login.yahoo.co.jp/yconnect/v2/public-keys';
const YAHOO_PUBKY_BODY = '{"0cc175b9c0f1b6a831c399e269772661": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0bXcnrheJ2snfq1wv6Qz\\n8+TEPDGKHCM0SsrQjxEFpXSEycL2/A+oW1ZGUzCuhz4HH4wkvc4CDJl25johSIUT\\nVyo4mrFrJ0ab0QAhrWE7gMyWFIfraj9cksPAGyVAiXLCN9Ly2xuoJxFjCAZXw1VO\\n8i7RTYK8ZP6dhcosiyzdhYt7C/65B5ikmCS4AymXIa83QQanCtjoGiwy4Cf2pLnn\\n9zXMZEnqQ+wwSoGn32YExmap7GAtjOwHNWU5zpW3dwNMq+zkcln3ICEBwxDpWJhE\\nZHZPBpPWgN+dQZDR2FiGHJgUFE3EM+CIcwxekrRBP+R3xEUeMFf5z1HeQNK8sjZe\\nRwIDAQAB\\n-----END PUBLIC KEY-----","b0c88084cd7ced792748340968b7d689": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxf9qYN87qbnuzKZFLM75\\n6UZXhBZuaB7g8l+jBeQsf2Suf6QUC1A/v30Y4yC0Jht/D5M3RzGzRxvPfBRnKm3N\\nxUDV5Ihmunt3+ZW6ia3bNdd7RRgCj3HdtQRiVroa9nDj/8abXZA1n2v2RpfiJKSo\\nHR8fim2TmfM7EMqXaoe65l1P3drEUkRMAOCMnsCXxCEfpcw/z0tXVTuOI/w3aCI8\\nD3mfPe2fTmCUOiYLV4jhnF5+pMZEBcF4/RsYTdKg/50F4hhgQ0qpkFJ2UI/UMV6t\\nHKw0lSJefcwj5j/pfeW4kfutUjb0xPQ2VrJ5IPM+efF5wtlkIhhQE58U5XuhWnc6\\nIwIDAQAB\\n-----END PUBLIC KEY-----"}';
const YAHOO_PUBKY_BODY_NG = '{"b0c88084cd7ced792748340968b7d689": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0bXcnrheJ2snfq1wv6Qz\\n8+TEPDGKHCM0SsrQjxEFpXSEycL2/A+oW1ZGUzCuhz4HH4wkvc4CDJl25johSIUT\\nVyo4mrFrJ0ab0QAhrWE7gMyWFIfraj9cksPAGyVAiXLCN9Ly2xuoJxFjCAZXw1VO\\n8i7RTYK8ZP6dhcosiyzdhYt7C/65B5ikmCS4AymXIa83QQanCtjoGiwy4Cf2pLnn\\n9zXMZEnqQ+wwSoGn32YExmap7GAtjOwHNWU5zpW3dwNMq+zkcln3ICEBwxDpWJhE\\nZHZPBpPWgN+dQZDR2FiGHJgUFE3EM+CIcwxekrRBP+R3xEUeMFf5z1HeQNK8sjZe\\nRwIDAQAB\\n-----END PUBLIC KEY-----","0cc175b9c0f1b6a831c399e269772661": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxf9qYN87qbnuzKZFLM75\\n6UZXhBZuaB7g8l+jBeQsf2Suf6QUC1A/v30Y4yC0Jht/D5M3RzGzRxvPfBRnKm3N\\nxUDV5Ihmunt3+ZW6ia3bNdd7RRgCj3HdtQRiVroa9nDj/8abXZA1n2v2RpfiJKSo\\nHR8fim2TmfM7EMqXaoe65l1P3drEUkRMAOCMnsCXxCEfpcw/z0tXVTuOI/w3aCI8\\nD3mfPe2fTmCUOiYLV4jhnF5+pMZEBcF4/RsYTdKg/50F4hhgQ0qpkFJ2UI/UMV6t\\nHKw0lSJefcwj5j/pfeW4kfutUjb0xPQ2VrJ5IPM+efF5wtlkIhhQE58U5XuhWnc6\\nIwIDAQAB\\n-----END PUBLIC KEY-----"}';
const YAHOO_ATTR_URL = 'https://userinfo.yahooapis.jp/yconnect/v2/attribute';
const YAHOO_ATTR_BODY = '{"sub":"user_id_01"}';

const AMAZON_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const AMAZON_PROFILE_URL = 'https://api.amazon.com/user/profile';

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
     * The test of method set().
     *
     * @return void
     */
    public function testSet()
    {
        $svc = new OAuthService();
        $user = $this->user01;
        $svc->providers = [
            'provider1' => function ($id_token) { return 'secret1'; },
            'provider2' => function ($id_token) { return null; },
        ];

        $this->assertFalse($svc->set($user, 'provider2', 'return1'));
        $this->assertNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertFalse($svc->set(null, 'provider1', 'return1'));
        $this->assertNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertFalse($svc->set($user, null, 'return1'));
        $this->assertNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
            );

        $this->assertTrue($svc->set($user, 'provider1', 'return1'));
        $this->assertNotNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );

        $this->assertTrue($svc->set($user, 'provider1', 'return1'));
        $this->assertNotNull(
            AuthProvider::where('user_id', $user->id)
                ->where('provider', 'provider1')->first()
        );
    }

    /**
     * The test of method reset().
     *
     * @return void
     */
    public function testReset()
    {
        $svc = new OAuthService();

        AuthProvider::create([
            'user_id' => $this->user01->id,
            'provider' => 'provider1',
            'secret' => 'secret1',
        ]);
        AuthProvider::create([
            'user_id' => $this->user01->id,
            'provider' => 'provider2',
            'secret' => 'secret2',
        ]);
        AuthProvider::create([
            'user_id' => $this->user02->id,
            'provider' => 'provider1',
            'secret' => 'secret3',
        ]);

        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );

        $svc->reset(null, 'provider1');

        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );

        $svc->reset($this->user01, null);

        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );

        $svc->reset($this->user01, 'provider1');

        $this->assertNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider1')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user01->id)
                ->where('provider', 'provider2')->first()
        );
        $this->assertNotNull(
            AuthProvider::where('user_id', $this->user02->id)
                ->where('provider', 'provider1')->first()
        );
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

    function yahooJp($code, $nonce, $ts, $stt1, $stt2, $stt3, $token, $pubkeys) {
        $svc = new OAuthService();

        $mock1 = \Mockery::mock('overload:'.\GuzzleHttp\Client::class);
        $mock1->shouldReceive('request')
            ->with('POST', YAHOO_TOKEN_URL, \Mockery::any())
            ->andReturn(new class ($stt1, $token) {
                public function __construct($stt, $body) {
                    $this->stt = $stt;
                    $this->body = $body;
                }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return $this->body; }
            });
        $mock1->shouldReceive('request')
            ->with('GET', YAHOO_PUBKY_URL)
            ->andReturn(new class ($stt2, $pubkeys) {
                public function __construct($stt, $body) {
                    $this->stt = $stt;
                    $this->body = $body;
                }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return $this->body; }
            });
        $mock1->shouldReceive('request')
            ->with('GET', YAHOO_ATTR_URL, \Mockery::any())
            ->andReturn(new class ($stt3) {
                public function __construct($stt) { $this->stt = $stt; }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return YAHOO_ATTR_BODY; }
            });
        $_SERVER['REQUEST_TIME'] = $ts;
        return $svc->providers['yahoo_jp']($code."\t".$nonce."\t".env('YAHOO_JP_REDIRECT_URI'));
    }

    /**
     * The test of method providers['yahoo_jp']() --> OK.
     *
     * @return void
     */
    public function testYahooJpOk()
    {
        $this->assertEquals(
            'user_id_01',
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546448136, 200, 200, 200, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(1).
     *
     * @return void
     */
    public function testYahooJpNg1()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'xxxxxxxxxxxxxxxx', 1546448136, 200, 200, 200, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(2).
     *
     * @return void
     */
    public function testYahooJpNg2()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546449136, 200, 200, 200, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(3).
     *
     * @return void
     */
    public function testYahooJpNg3()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546448136, 500, 200, 200, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(4).
     *
     * @return void
     */
    public function testYahooJpNg4()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546448136, 200, 500, 200, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(5).
     *
     * @return void
     */
    public function testYahooJpNg5()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546448136, 200, 200, 500, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(6).
     *
     * @return void
     */
    public function testYahooJpNg6()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546448136, 200, 200, 200, YAHOO_TOKEN_BODY_NG, YAHOO_PUBKY_BODY)
        );
    }

    /**
     * The test of method providers['yahoo_jp']() --> NG(7).
     *
     * @return void
     */
    public function testYahooJpNg7()
    {
        $this->assertNull(
            $this->yahooJp('03oiUPoy', 'f7ah5pzdd8u2g62be9me9w7a', 1546448136, 200, 200, 200, YAHOO_TOKEN_BODY, YAHOO_PUBKY_BODY_NG)
        );
    }

    function amazon($code, $stt1, $stt2) {
        $svc = new OAuthService();

        $mock1 = \Mockery::mock('overload:'.\GuzzleHttp\Client::class);
        $mock1->shouldReceive('request')
            ->with('POST', AMAZON_TOKEN_URL, \Mockery::any())
            ->andReturn(new class ($stt1) {
                public function __construct($stt) {
                    $this->stt = $stt;
                }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return '{"access_token": "access_token01"}'; }
            });
        $mock1->shouldReceive('request')
            ->with('GET', AMAZON_PROFILE_URL, \Mockery::any())
            ->andReturn(new class ($stt2) {
                public function __construct($stt) { $this->stt = $stt; }
                public function getStatusCode() { return $this->stt; }
                public function getBody() { return '{"user_id": "user_id_01"}'; }
            });
        return $svc->providers['amazon']($code."\t".env('AMAZON_REDIRECT_URI'));
    }

    /**
     * The test of method providers['amazon']() --> OK.
     *
     * @return void
     */
    public function testAmazonOk()
    {
        $this->assertEquals(
            'user_id_01',
            $this->amazon('code01', 200, 200)
        );
    }

    /**
     * The test of method providers['amazon']() --> NG(1).
     *
     * @return void
     */
    public function testAmazonNg1()
    {
        $this->assertNull(
            $this->amazon('code01', 500, 200)
        );
    }

    /**
     * The test of method providers['amazon']() --> NG(2).
     *
     * @return void
     */
    public function testAmazonNg2()
    {
        $this->assertNull(
            $this->amazon('code01', 200, 500)
        );
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
