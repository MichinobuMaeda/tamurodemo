"""Test models.sesses"""
from datetime import datetime
import time
import unittest
from tests.utils import test_init_db
from tamuro.models import prim, groups, users, sesses

class ModelsSessesTestCase(unittest.TestCase):
    """Test models.sesses"""

    def setUp(self):
        self.pool, self.sch = test_init_db()
        self.conn = self.pool.getconn()

    def tearDown(self):
        self.pool.putconn(self.conn)
        self.pool.closeall()

    def test_sess_post_sess(self):
        sess_id = prim.setup(self.conn, self.sch)
        self.conn.commit()
        sess0 = sesses.touch(self.conn, self.sch, sess_id)
        self.conn.commit()
        user0 = users.get(self.conn, self.sch, sess0['user_id'])
        manager = groups.get(self.conn, self.sch, user0['groups'][0])
        admin = groups.get(self.conn, self.sch, user0['groups'][1])
        if manager['roles'][0] == 'admin':
            admin, manager = manager, admin
        top = groups.get(self.conn, self.sch, manager['groups'][0])
        user1 = users.post_member(self.conn, self.sch, manager['id'], {'name': 'user01'})
        self.conn.commit()
        user2 = users.post_member(self.conn, self.sch, admin['id'], {'name': 'user02'})
        self.conn.commit()
        user3 = users.post_member(self.conn, self.sch, top['id'], {'name': 'user03'})
        self.conn.commit()
        sess0 = sesses.post(self.conn, self.sch, {'user_id': user0['id'], 'provider': 'google', 'key': 'key00'})
        self.conn.commit()
        sess1 = sesses.post(self.conn, self.sch, {'user_id': user1['id'], 'provider': 'google', 'key': 'key01'})
        self.conn.commit()
        sess2 = sesses.post(self.conn, self.sch, {'user_id': user2['id'], 'provider': 'google', 'key': 'key02'})
        self.conn.commit()
        sess3 = sesses.post(self.conn, self.sch, {'user_id': user3['id'], 'provider': 'google', 'key': 'key03'})
        self.conn.commit()
        self.assertEqual(sess0['user_id'], user0['id'])
        self.assertEqual(sess0['is_manager'], True)
        self.assertEqual(sess0['is_admin'], True)
        self.assertEqual(sorted(sess0['groups']), sorted([top['id'], manager['id'], admin['id']]))
        self.assertEqual(sess1['user_id'], user1['id'])
        self.assertEqual(sess1['is_manager'], True)
        self.assertEqual(sess1['is_admin'], False)
        self.assertEqual(sorted(sess1['groups']), sorted([top['id'], manager['id']]))
        self.assertEqual(sess2['user_id'], user2['id'])
        self.assertEqual(sess2['is_manager'], False)
        self.assertEqual(sess2['is_admin'], True)
        self.assertEqual(sorted(sess2['groups']), sorted([top['id'], admin['id']]))
        self.assertEqual(sess3['user_id'], user3['id'])
        self.assertEqual(sess3['is_manager'], False)
        self.assertEqual(sess3['is_admin'], False)
        self.assertEqual(sorted(sess3['groups']), sorted([top['id']]))

    def test_sess_post_token(self):
        with self.conn.cursor() as cur:
            cur.execute("""
INSERT INTO {0}.groups (id, name, note)
VALUES ('id00', 'group00', '')""".format(self.sch))
        self.conn.commit()
        top = groups.get(self.conn, self.sch, 'id00')
        user1 = users.post_member(self.conn, self.sch, top['id'], {'name': 'user01'})
        self.conn.commit()
        sess1 = sesses.post_token(self.conn, self.sch, user1['id'])
        self.conn.commit()
        self.assertEqual(sess1['user_id'], user1['id'])
        self.assertEqual(sess1['provider'], 'token')
        self.assertEqual(sess1['is_manager'], False)
        self.assertEqual(sess1['is_admin'], False)
        self.assertListEqual(sess1['groups'], [])

    def test_sess_get(self):
        with self.conn.cursor() as cur:
            cur.execute("""
INSERT INTO {0}.groups (id, name, note)
VALUES ('id00', 'group00', '')""".format(self.sch))
        top = groups.get(self.conn, self.sch, 'id00')
        user1 = users.post_member(self.conn, self.sch, top['id'], {'name': 'user01'})
        self.conn.commit()
        sess1 = sesses.post_token(self.conn, self.sch, user1['id'])
        self.conn.commit()
        time.sleep(0.001)
        ts1 = datetime.utcnow()
        time.sleep(0.001)
        sess2 = sesses.post_token(self.conn, self.sch, user1['id'])
        self.conn.commit()
        time.sleep(0.001)
        sess3 = sesses.post_token(self.conn, self.sch, user1['id'])
        self.conn.commit()
        time.sleep(0.001)
        ts2 = datetime.utcnow()
        time.sleep(0.001)
        sess4 = sesses.post_token(self.conn, self.sch, user1['id'])
        self.conn.commit()
        ts3 = datetime.utcnow()
        time.sleep(0.001)
        sesses.touch(self.conn, self.sch, sess4['id'])
        self.conn.commit()
        time.sleep(0.001)
        sesses.touch(self.conn, self.sch, sess1['id'])
        self.conn.commit()
        ts4 = datetime.utcnow()
        rows = sesses.get(self.conn, self.sch, ts1, ts2)
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]['id'], sess3['id'])
        self.assertEqual(rows[1]['id'], sess2['id'])
        rows = []
        for row in sesses.get(self.conn, self.sch, ts3, ts4):
            rows.append(row)
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]['id'], sess1['id'])
        self.assertEqual(rows[1]['id'], sess4['id'])

    def test_sess_touch(self):
        sess_id = prim.setup(self.conn, self.sch)
        self.conn.commit()
        time.sleep(0.001)
        time_stamp = datetime.utcnow().timestamp()
        time.sleep(0.001)
        sess1 = sesses.touch(self.conn, self.sch, sess_id)
        self.conn.commit()
        self.assertTrue(sess1['created_at'].timestamp() < time_stamp)
        self.assertTrue(sess1['updated_at'].timestamp() > time_stamp)

    def test_sess_delete(self):
        sess_id = prim.setup(self.conn, self.sch)
        self.conn.commit()
        ret = sesses.delete(self.conn, self.sch, sess_id)
        self.assertTrue(ret)
        sess1 = sesses.touch(self.conn, self.sch, sess_id)
        self.conn.commit()
        self.assertIsNone(sess1)
        ret = sesses.delete(self.conn, self.sch, sess_id)
        self.conn.commit()
        self.assertIsNone(ret)

    def test_sess_get_tokens(self):
        ret = sesses.get_tokens(self.conn, self.sch)
        self.assertListEqual(ret, [])
        self.conn.commit()
        ts0 = datetime.utcnow()
        sess_id = prim.setup(self.conn, self.sch)
        self.conn.commit()
        sess0 = sesses.get(self.conn, self.sch, ts0, datetime.utcnow())
        ret = sesses.get_tokens(self.conn, self.sch)
        self.assertTrue(len(ret), 1)
        self.assertEqual(ret[0]['id'], sess_id)
        self.assertEqual(ret[0]['user_id'], sess0[0]['user_id'])
        self.assertEqual(ret[0]['created_at'], sess0[0]['created_at'])
        self.assertEqual(ret[0]['updated_at'], sess0[0]['updated_at'])

    def test_sess_get_users_for_tokens(self):
        ret = sesses.get_tokens(self.conn, self.sch)
        self.assertListEqual(ret, [])
        self.conn.commit()
        ts0 = datetime.utcnow()
        prim.setup(self.conn, self.sch)
        self.conn.commit()
        sess0 = sesses.get(self.conn, self.sch, ts0, datetime.utcnow())
        ret = sesses.get_users_for_tokens(self.conn, self.sch)
        self.assertTrue(len(ret), 1)
        self.assertEqual(ret[0]['id'], sess0[0]['user_id'])
