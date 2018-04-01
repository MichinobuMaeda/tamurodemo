"""Test models.prim"""
import unittest
from tests.utils import test_init_db
from tamuro.models import prim, groups, users, sesses

class ModelsPrimTestCase(unittest.TestCase):
    """Test models.prim"""

    def setUp(self):
        self.pool, self.sch = test_init_db()
        self.conn = self.pool.getconn()

    def tearDown(self):
        self.pool.putconn(self.conn)
        self.pool.closeall()

    def test_setup(self):
        sess_id = prim.setup(self.conn, self.sch)
        self.conn.commit()
        self.assertIsNotNone(sess_id)

        top = None
        manager = None
        admin = None
        user0 = None
        with self.conn.cursor() as cur:
            cur.execute('SELECT name, group_id FROM {0}.group_role'.format(self.sch))
            for row in cur.fetchall():
                if row[0] == 'top':
                    top = groups.get(self.conn, self.sch, row[1])
                elif row[0] == 'manager':
                    manager = groups.get(self.conn, self.sch, row[1])
                elif row[0] == 'admin':
                    admin = groups.get(self.conn, self.sch, row[1])
                else:
                    assert False
        self.assertListEqual(sorted(top['sub_groups']), sorted([manager['id'], admin['id']]))
        self.assertListEqual(top['roles'], ['top'])
        self.assertListEqual(manager['roles'], ['manager'])
        self.assertListEqual(admin['roles'], ['admin'])
        self.assertListEqual(sorted(top['members']), sorted([]))
        self.assertEqual(len(manager['members']), 1)
        user0 = users.get(self.conn, self.sch, manager['members'][0])
        self.assertListEqual(sorted(admin['members']), sorted([user0['id']]))
        sess0 = sesses.touch(self.conn, self.sch, sess_id)
        self.conn.commit()
        self.assertEqual(sess0['user_id'], user0['id'])
        self.assertEqual(sess0['provider'], 'token')

        sess_id = prim.setup(self.conn, self.sch)
        self.conn.commit()
        self.assertIsNone(sess_id)

    def test_top_get(self):
        top0 = prim.get(self.conn, self.sch)
        self.assertIsNone(top0)
        prim.setup(self.conn, self.sch)
        self.conn.commit()
        top1 = prim.get(self.conn, self.sch)
        self.assertTrue('id' in top1)
        self.assertTrue('name' in top1)
