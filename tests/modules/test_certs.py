"""Test models.certs"""
import unittest
from tests.utils import test_init_db
from tamuro.models import groups, users, certs

class ModelsCertsTestCase(unittest.TestCase):
    """Tests models.certs"""

    def setUp(self):
        self.pool, self.sch = test_init_db()
        self.conn = self.pool.getconn()
        self.seed = '0123456789012345678901234567890123456789'

    def tearDown(self):
        self.pool.putconn(self.conn)
        self.pool.closeall()

    def test_sess_put_sess(self):
        """Tests functions of models.certs"""
        with self.conn.cursor() as cur:
            cur.execute("""
INSERT INTO {0}.groups (id, name, note)
VALUES ('id00', 'group00', '')""".format(self.sch))
        top = groups.get(self.conn, self.sch, 'id00')
        user1 = users.post_member(self.conn, self.sch, top['id'], {'name': 'user01'})
        self.conn.commit()
        certs1 = certs.put(self.conn, self.sch, self.seed, {
            'user_id': user1['id'],
            'provider': 'password',
            'key': 'key0x',
            'secret': 'secret0x',
        })
        self.conn.commit()
        certs1 = certs.put(self.conn, self.sch, self.seed, {
            'user_id': user1['id'],
            'provider': 'google',
            'key': 'key02',
        })
        self.conn.commit()
        self.assertEqual(certs1[0]['user_id'], user1['id'])
        self.assertEqual(certs1[0]['provider'], 'password')
        self.assertEqual(certs1[0]['key'], 'key0x')
        self.assertEqual(certs1[1]['user_id'], user1['id'])
        self.assertEqual(certs1[1]['provider'], 'google')
        with self.conn.cursor() as cur:
            cur.execute("""
SELECT secret FROM {0}.certs WHERE user_id = %s AND provider = %s
""".format(self.sch), (user1['id'], 'password'))
            row = cur.fetchone()
            self.assertEqual(row[0], certs.digest(
                self.seed, {'user_id': user1['id'], 'secret': 'secret0x'}))
        self.conn.commit()
        with self.conn.cursor() as cur:
            cur.execute("""
SELECT secret FROM {0}.certs WHERE user_id = %s AND provider = %s
""".format(self.sch), (user1['id'], 'google'))
            row = cur.fetchone()
            self.assertIsNone(row[0])

        certs1 = certs.put(self.conn, self.sch, self.seed, {
            'user_id': user1['id'],
            'provider': 'password',
            'key': 'key01',
            'secret': 'secret0x',
            'ver': 1,
        })
        self.conn.commit()
        self.assertEqual(certs1[0]['user_id'], user1['id'])
        self.assertEqual(certs1[0]['provider'], 'password')
        self.assertEqual(certs1[0]['key'], 'key01')
        self.assertFalse('secret' in certs1[0])
        self.assertEqual(certs1[1]['user_id'], user1['id'])
        self.assertEqual(certs1[1]['provider'], 'google')
        self.assertFalse('key' in certs1[1])
        self.assertFalse('secret' in certs1[1])

        certs1 = certs.put(self.conn, self.sch, self.seed, {
            'user_id': user1['id'],
            'provider': 'password',
            'key': 'key01',
            'secret': 'secret01',
            'ver': 3
        })
        self.assertIsNone(certs1)
        certs1 = certs.put(self.conn, self.sch, self.seed, {
            'user_id': user1['id'],
            'provider': 'password',
            'key': 'key01',
            'secret': 'secret0x',
            'ver': 2
        })
        self.assertIsNone(certs1)
        certs1 = certs.put(self.conn, self.sch, self.seed, {
            'user_id': user1['id'],
            'provider': 'password',
            'key': 'key01',
            'secret': 'secret01',
            'ver': 2
        })
        self.assertTrue(len(certs1), 2)
        self.conn.commit()
        with self.conn.cursor() as cur:
            cur.execute("""
SELECT secret FROM {0}.certs WHERE user_id = %s AND provider = %s
""".format(self.sch), (user1['id'], 'password'))
            row = cur.fetchone()
            self.assertEqual(row[0], certs.digest(
                self.seed, {'user_id': user1['id'], 'secret': 'secret01'}))

        cert1 = certs.get_by_key(self.conn, self.sch, self.seed, {
            'provider': 'password',
            'key': 'key01',
            'secret': 'secret01'
        })
        self.assertEqual(cert1['user_id'], user1['id'])
        self.assertEqual(cert1['provider'], 'password')

        cert1 = certs.get_by_key(self.conn, self.sch, self.seed, {
            'provider': 'password',
            'key': 'key0x',
            'secret': 'secret01'
        })
        self.assertIsNone(cert1)

        cert1 = certs.get_by_key(self.conn, self.sch, self.seed, {
            'provider': 'password',
            'key': 'key01',
            'secret': 'secret0x'
        })
        self.assertIsNone(cert1)

        cert1 = certs.get_by_key(self.conn, self.sch, self.seed, {
            'provider': 'google',
            'key': 'key02'
        })
        self.assertEqual(cert1['user_id'], user1['id'])
        self.assertEqual(cert1['provider'], 'google')

        certs2 = certs.delete(self.conn, self.sch, {'user_id': user1['id'], 'provider': 'google'})
        self.conn.commit()
        self.assertEqual(certs2[0]['provider'], 'password')

        certs2 = certs.delete(self.conn, self.sch, {'user_id': user1['id'], 'provider': 'google'})
        self.conn.commit()
        self.assertIsNone(certs2)
