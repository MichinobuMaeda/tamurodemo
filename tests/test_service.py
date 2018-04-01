"""Test models"""
from datetime import datetime
import unittest
from tests.utils import test_init_db
from tamuro import server, service, models

class ModelsServiceTestCase(unittest.TestCase):
    """Test models.py"""

    def setUp(self):
        self.pool, self.sch = test_init_db()
        self.conn = self.pool.getconn()
        self.seed = '0123456789012345678901234567890123456789'

    def tearDown(self):
        self.pool.putconn(self.conn)
        self.pool.closeall()

    def test_service(self):
        ret = service.get_top(self.ctx(None))
        self.assertDictEqual(ret, {})
        ret = service.get_top(self.ctx({}))
        self.assertDictEqual(ret, {})
        ret = service.get_top(self.ctx({'id': 'dummy', 'user_id': 'dummy'}))
        self.assertDictEqual(ret, {})

        sess_id = service.get_setup(self.ctx({}))
        self.assertIsNotNone(sess_id)
        ret = service.get_top(self.ctx(None))
        self.assertFalse('id' in ret)
        self.assertTrue('name' in ret)
        ret = service.get_top(self.ctx({}))
        self.assertFalse('id' in ret)
        self.assertTrue('name' in ret)
        sess0t = models.sesses.touch(self.conn, self.sch, sess_id)
        self.assertListEqual(sess0t['groups'], [])
        self.assertFalse(sess0t['is_manager'])
        self.assertFalse(sess0t['is_admin'])
        top0 = service.get_top(self.ctx(sess0t))
        self.assertTrue('id' in top0)
        self.assertTrue('name' in top0)
        manager = service.get_groups(self.ctx(sess0t), top0['sub_groups'][0])
        admin = service.get_groups(self.ctx(sess0t), top0['sub_groups'][1])
        if manager['roles'][0] == 'admin':
            manager, admin = admin, manager
        top1 = service.get_groups(self.ctx(sess0t), top0['id'])
        self.assertTrue(top0['id'], top1['id'])
        self.assertTrue(top0['name'], top1['name'])
        groups0 = service.get_groups(self.ctx(sess0t), top0['sub_groups'])
        self.assertListEqual(
            sorted(top0['sub_groups']),
            sorted([groups0[0]['id'], groups0[1]['id']])
        )
        user0 = service.get_users(self.ctx(sess0t), sess0t['user_id'])
        self.assertEqual(user0['id'], sess0t['user_id'])
        ret = service.get_users(self.ctx(sess0t), [sess0t['user_id']])
        self.assertEqual(ret[0]['id'], user0['id'])

        user0 = service.put_user(self.ctx(sess0t), user0['id'], user0)
        self.assertEqual(user0['ver'], 2)

        ret = service.post_sub_group(self.ctx(sess0t), top1['id'], {'name': 'dummy'})
        self.assertIsNone(ret)
        ret = service.put_group_groups(self.ctx(sess0t), top1['id'], [manager['id']])
        self.assertIsNone(ret)
        ret = service.put_sub_groups(self.ctx(sess0t), top1['id'], [manager['id']])
        self.assertIsNone(ret)
        ret = service.put_owners(self.ctx(sess0t), top1['id'], [user0['id']])
        self.assertIsNone(ret)
        ret = service.put_members(self.ctx(sess0t), top1['id'], [user0['id']])
        self.assertIsNone(ret)
        ret = service.put_own_groups(self.ctx(sess0t), user0['id'], [manager['id']])
        self.assertIsNone(ret)
        ret = service.put_user_groups(self.ctx(sess0t), user0['id'], [manager['id']])
        self.assertIsNone(ret)
        ret = service.put_group(self.ctx(sess0t), top1['id'], {'id': top1['id'], 'name': 'dummy'})
        self.assertIsNone(ret)
        ret = service.delete_group(self.ctx(sess0t), top1['id'], top1)
        self.assertIsNone(ret)
        ret = service.delete_group(self.ctx(sess0t), 'dummy', top1)
        self.assertIsNone(ret)
        ret = service.delete_user(self.ctx(sess0t), user0['id'], user0)
        self.assertIsNone(ret)
        ret = service.delete_user(self.ctx(sess0t), 'dummy', user0)
        self.assertIsNone(ret)
        ret = service.get_sessions(self.ctx(sess0t),
                                   datetime.utcnow().timestamp(),
                                   datetime.utcnow().timestamp())
        self.assertIsNone(ret)

        certs0a = service.put_cert(self.ctx(sess0t), user0['id'], {
            'provider': 'password',
            'key': 'key00',
            'secret': 'secret00',
        }, self.seed)
        self.assertEqual(certs0a[0]['user_id'], sess0t['user_id'])
        self.assertEqual(certs0a[0]['provider'], 'password')
        self.assertFalse('secret' in certs0a[0])

        sess0a = service.post_session(self.ctx(None), {
            'provider': 'password',
            'key': 'key00',
            'secret': 'secret00',
        }, self.seed)
        self.assertListEqual(
            sorted(sess0a['groups']),
            sorted([top1['id'], manager['id'], admin['id']])
        )
        self.assertTrue(sess0a['is_manager'])
        self.assertTrue(sess0a['is_admin'])

        ret = service.get_sessions(self.ctx(sess0a),
                                   datetime.utcnow().timestamp() - 10 * 1000,
                                   datetime.utcnow().timestamp())
        self.assertEqual(len(ret), 1)

        group1 = service.post_sub_group(self.ctx(sess0a), top1['id'], {'name': 'group x'})
        self.assertIsNotNone(group1)
        group1 = service.put_group_groups(self.ctx(sess0a), group1['id'], [top1['id'], manager['id']])
        self.assertListEqual(sorted(group1['groups']), sorted([top1['id'], manager['id']]))
        manager = service.put_sub_groups(self.ctx(sess0a), manager['id'], [])
        self.assertListEqual(sorted(manager['sub_groups']), sorted([]))
        group1 = service.get_groups(self.ctx(sess0a), group1['id'])
        self.assertListEqual(sorted(group1['groups']), sorted([top1['id']]))
        group1 = service.put_group(self.ctx(sess0a), group1['id'],
                                   {'id': group1['id'], 'name': 'group1', 'ver': 1})
        self.assertEqual(group1['name'], 'group1')
        self.assertEqual(group1['ver'], 2)
        group1 = service.put_owners(self.ctx(sess0a), group1['id'], [user0['id']])
        self.assertListEqual(sorted(group1['owners']), sorted([user0['id']]))
        group1 = service.put_members(self.ctx(sess0a), group1['id'], [user0['id']])
        self.assertListEqual(sorted(group1['members']), sorted([user0['id']]))
        user0 = service.put_own_groups(self.ctx(sess0a), user0['id'], [])
        user0 = service.put_user_groups(self.ctx(sess0a), user0['id'], [manager['id'], admin['id']])
        group1 = service.get_groups(self.ctx(sess0a), group1['id'])
        self.assertListEqual(group1['owners'], [])
        self.assertListEqual(group1['members'], [])

        user1 = service.post_member(self.ctx(sess0a), group1['id'], {'name': 'user x'})
        self.assertIsNotNone(user1)
        certs1 = service.put_cert(self.ctx(sess0a), user1['id'], {
            'provider': 'google',
            'key': 'key01',
        }, self.seed)
        self.assertIsNotNone(certs1)
        ret = service.post_session(self.ctx(None), {
            'provider': 'google',
            'key': 'key00',
        }, self.seed)
        self.assertIsNone(ret)
        sess1 = service.post_session(self.ctx(None), {
            'provider': 'google',
            'key': 'key01',
        }, self.seed)
        self.assertIsNotNone(sess1)
        ret = service.put_user(
            self.ctx(sess1), user0['id'],{'id': user0['id'], 'name': 'user0a'})
        self.assertIsNone(ret)
        ret = service.delete_user(
            self.ctx(sess1), user0['id'], {'id': user0['id'], 'name': 'user0a'})
        self.assertIsNone(ret)
        ret = service.delete_user(
            self.ctx(sess1), user1['id'], {'id': user1['id'], 'name': 'user1'})
        self.assertIsNone(ret)
        ret = service.get_certs(self.ctx(sess0a), user1['id'])
        self.assertIsNotNone(ret)
        ret = service.get_certs(self.ctx(sess1), user0['id'])
        self.assertIsNone(ret)
        ret = service.put_cert(self.ctx(sess1), user0['id'], certs0a[0], self.seed)
        self.assertIsNone(ret)
        ret = service.post_member(self.ctx(sess1), manager['id'], {'name': 'dummy'})
        self.assertIsNone(ret)
        ret = service.delete_cert(self.ctx(sess1), user0['id'], certs0a[0])
        self.assertIsNone(ret)
        user1 = service.put_user(
            self.ctx(sess1), user1['id'],
            {'id': user1['id'], 'name': 'user x2', 'ver': 1})
        self.assertEqual(user1['name'], 'user x2')
        ret = service.put_user(
            self.ctx(sess1), user1['id'],
            {'id': user0['id'], 'name': 'user x2', 'ver': 1})
        self.assertIsNone(ret)
        ret = service.put_user(self.ctx(sess1), user1['id'],
                               {'id': user1['id'], 'name': 'user x2', 'ver': 1})
        self.assertIsNone(ret)
        self.assertEqual(user1['ver'], 2)
        user1 = service.put_user(self.ctx(sess0a), user1['id'],
                                 {'id': user1['id'], 'name': 'user1', 'ver': 2})
        self.assertEqual(user1['name'], 'user1')
        self.assertEqual(user1['ver'], 3)
        self.assertIsNone(ret)
        ret = service.put_user_profs(
            self.ctx(sess1), user1['id'],
            [{'name': 'prof1', 'ver': 1, 'props': [{'name': 'name11', 'value': 'value11', 'ver': 1}]}])
        self.assertEqual(ret[0]['props'][0]['name'], 'name11')
        ret = service.put_user_profs(
            self.ctx(sess1), user0['id'],
            [{'name': 'prof1', 'ver': 1, 'props': [{'name': 'name11', 'value': 'value11', 'ver': 1}]}])
        self.assertIsNone(ret)
        ret = service.put_user_profs(
            self.ctx(sess0a), user1['id'],
            [{'name': 'prof1', 'ver': 1, 'props': [{'name': 'name11x', 'value': 'value11', 'ver': 1}]}])
        self.assertEqual(ret[0]['props'][0]['name'], 'name11x')
        ret = service.put_user_profs(
            self.ctx(sess0a), user0['id'],
            [{'name': 'prof1', 'ver': 1, 'props': [{'name': 'name11y', 'value': 'value11', 'ver': 1}]}])
        self.assertEqual(ret[0]['props'][0]['name'], 'name11y')
        ret = service.get_user_profs(self.ctx(None), user1['id'])
        self.assertIsNone(ret)
        ret = service.get_user_profs(self.ctx(sess1), user1['id'])
        self.assertEqual(ret[0]['props'][0]['name'], 'name11x')
        ret = service.get_user_profs(self.ctx(sess1), user0['id'])
        self.assertListEqual(ret, [])
        ret = service.get_user_profs(self.ctx(sess0a), user0['id'])
        self.assertEqual(ret[0]['props'][0]['name'], 'name11y')
        ret = service.get_token_status(self.ctx(sess1))
        self.assertIsNone(ret)
        ret = service.post_token(self.ctx(sess1), {'user_id': user0['id']})
        self.assertIsNone(ret)

        ret = service.delete_session(self.ctx(sess1), sess0a['id'])
        self.assertIsNone(ret)
        ret = service.delete_session(self.ctx(sess0a), sess1['id'])
        self.assertTrue(ret)
        certs1 = service.delete_cert(self.ctx(sess0a), user1['id'], certs1[0])
        self.assertListEqual(certs1, [])

        ret = service.get_token_status(self.ctx(sess0a))
        self.assertEqual(len(ret), 1)
        self.assertListEqual(ret[0]['tokens'], [])
        ret = service.post_token(self.ctx(sess0a), {'user_id': 'dummy'})
        self.assertIsNone(ret)
        token1 = service.post_token(self.ctx(sess0a), {'user_id': user1['id']})
        self.assertEqual(token1['user_id'], user1['id'])
        self.assertEqual(token1['user_name'], user1['name'])
        ret = service.get_token_status(self.ctx(sess0a))
        self.assertEqual(len(ret[0]['tokens']), 1)
        self.assertEqual(ret[0]['tokens'][0]['id'], token1['id'])

        ret = service.delete_user(self.ctx(sess0a), user1['id'], user1)
        self.assertTrue(ret)
        ret = service.get_users(self.ctx(sess0a), user1['id'])

    def ctx(self, sess):
        """Returns the test context."""
        return server.ServiceContext(self.conn, self.sch, sess)
