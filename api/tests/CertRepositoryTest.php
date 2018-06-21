<?php

use Illuminate\Auth\GenericUser;
use Laravel\Lumen\Testing\DatabaseMigrations;
use App\Models\User;
use App\Repositories\CertRepository;

require_once __DIR__.'/TestHelper.php';

class CertRepositoryStub extends CertRepository
{
    public function stub_hash_secret($key, $secret)
    {
        return $this->hash_secret($key, $secret);
    }
}

class CertRepositoryTest extends TestCase
{
    use DatabaseMigrations;

    /**
     * The test of set function.
     *
     * @return void
     */
    public function testHashSecret()
    {
        $key = 'key00001';
        $secret = 'pass0001';
        $this->assertEquals(
            (new CertRepositoryStub)->stub_hash_secret($key, $secret),
            hash_password($key, $secret)
        );
        $this->assertFalse(
            (new CertRepositoryStub)->stub_hash_secret($key, $secret)
                == hash_password($key, $secret.'a')
        );
    }

    /**
     * The test of set function.
     *
     * @return void
     */
    public function testSet()
    {
        run_test_seed0();
        $user1 = User::where('id', 1)->first();
        $certs = new CertRepository;
        
        $certs->set($user1, 'password', 'key00001', 'pass0001');
        $this->seeInDatabase('certs', [
            'user_id' => 1,
            'provider' => 'password',
            'key' => 'key00001',
            'secret' => hash_password('key00001', 'pass0001'),
            'ver' => 1
        ]);
        
        $certs->set($user1, 'password', 'key00001', 'pass0002');
        $this->seeInDatabase('certs', [
            'user_id' => 1,
            'provider' => 'password',
            'key' => 'key00001',
            'secret' => hash_password('key00001', 'pass0002'),
            'ver' => 2
        ]);
    }

    /**
     * The test of get function.
     *
     * @return void
     */
    public function testGet()
    {
        run_test_seed1();
        $user1 = User::where('id', 1)->first();
        $user2 = User::where('id', 2)->first();
        $certs = new CertRepository;
        $certs->set($user1, 'password', 'key00001', 'pass0001');
        $certs->set($user1, 'google', 'key000g1');
        $certs->set($user2, 'password', 'key00002', 'pass0002');
        $certs->set($user2, 'google', 'key000g2');

        $cert = $certs->get('password', 'key00001', 'pass0001');
        $this->assertEquals($cert->user_id, $user1->id);
        $this->assertEquals($cert->provider, 'password');

        $cert = $certs->get('password', 'key00002', 'pass0002');
        $this->assertEquals($cert->user_id, $user2->id);
        $this->assertEquals($cert->provider, 'password');

        $cert = $certs->get('password', 'key00001', 'pass0003');
        $this->assertNull($cert);

        $cert = $certs->get('google', 'key000g1');
        $this->assertEquals($cert->user_id, $user1->id);
        $this->assertEquals($cert->provider, 'google');

        $cert = $certs->get('google', 'key000g2');
        $this->assertEquals($cert->user_id, $user2->id);
        $this->assertEquals($cert->provider, 'google');

        $cert = $certs->get('google', 'key000g3');
        $this->assertNull($cert);
    }

    /**
     * The test of list function.
     *
     * @return void
     */
    public function testList()
    {
        run_test_seed1();
        $user1 = User::where('id', 1)->first();
        $user2 = User::where('id', 2)->first();
        $certs = new CertRepository;
        $certs->set($user1, 'password', 'key00001', 'pass0001');
        $certs->set($user1, 'google', 'key000g1');
        $certs->set($user2, 'password', 'key00002', 'pass0002');
        $certs->set($user2, 'google', 'key000g2');
        
        $list1 = $certs->list($user1->id);
        $this->assertCount(2, $list1);
        $this->assertEquals($list1[0]->user_id, $user1->id);
        $this->assertEquals($list1[0]->provider, 'password');
        $this->assertEquals($list1[0]->key, 'key00001');
        $this->assertEquals($list1[0]->secret, hash_password('key00001', 'pass0001'));
        $this->assertEquals($list1[1]->user_id, $user1->id);
        $this->assertEquals($list1[1]->provider, 'google');
        $this->assertEquals($list1[1]->key, 'key000g1');
        $this->assertEquals($list1[1]->secret, null);
        
        $list2 = $certs->list($user2->id);
        $this->assertCount(2, $list2);
        $this->assertEquals($list2[0]->user_id, $user2->id);
        $this->assertEquals($list2[0]->provider, 'password');
        $this->assertEquals($list2[0]->key, 'key00002');
        $this->assertEquals($list2[0]->secret, hash_password('key00002', 'pass0002'));
        $this->assertEquals($list2[1]->user_id, $user2->id);
        $this->assertEquals($list2[1]->provider, 'google');
        $this->assertEquals($list2[1]->key, 'key000g2');
        $this->assertEquals($list2[1]->secret, null);
    }

    /**
     * The test of delete function.
     *
     * @return void
     */
    public function testDelete()
    {
        run_test_seed1();
        $user1 = User::where('id', 1)->first();
        $user2 = User::where('id', 2)->first();
        $certs = new CertRepository;
        $certs->set($user1, 'password', 'key00001', 'pass0001');
        $certs->set($user1, 'google', 'key000g1');
        $certs->set($user2, 'password', 'key00002', 'pass0002');
        $certs->set($user2, 'google', 'key000g2');
        
        $list1 = $certs->delete($user1->id, 'password');
        $this->assertCount(1, $list1);
        $this->assertEquals($list1[0]->user_id, $user1->id);
        $this->assertEquals($list1[0]->provider, 'google');
    }
}
