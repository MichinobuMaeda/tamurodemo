"""Test models"""
from datetime import datetime
import os
import unittest
import psycopg2
from flask import json
from tamuro.server import init_app

class ModelsServerTestCase(unittest.TestCase):
    """Test models.py"""

    def setUp(self):
        with open(os.path.join(os.path.dirname(__file__), '..', 'config_test.json'), 'r') as f:
            self.conf = json.load(f)
            self.sch = 'test'

            conn = psycopg2.connect(' '.join(['%s=%s' % (
                k, self.conf['database']['dsn'][k]) for k in self.conf['database']['dsn']]))
            with conn.cursor() as cur:
                cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = '%s'" % self.sch)
                rows = cur.fetchall()
            for row in rows:
                with conn.cursor() as cur:
                    cur.execute('DROP TABLE IF EXISTS %s.%s CASCADE' % (self.sch, row[0]))
            conn.commit()
            conn.close()

            app, pool = init_app(self.conf)
            app.testing = True
            self.cli = app.test_client()

            self.pool = pool
            self.prefix = self.conf['instances'][self.sch]['path_prefix']

    def tearDown(self):
        self.pool.closeall()

    def path(self, reqest_path):
        return '%s%s' % (self.prefix, reqest_path)

    def test_server(self):
        ret = self.cli.get('/')
        self.assertEqual(ret.status_code, 404)
        ret = self.cli.get(self.path('/'))
        self.assertDictEqual(get_obj(ret), {})
        ret = self.cli.get(self.path('/setup'), follow_redirects=False)
        self.assertEqual(ret.status_code, 302)
        self.assertEqual(ret.location, self.conf['instances'][self.sch]['app_url'])
        top = get_obj(self.cli.get(self.path('/')))
        self.assertTrue('name' in top)
        self.assertTrue('id' in top)
        top = get_obj(self.cli.get(self.path('/groups/%s' % (top['id'],))))
        self.assertTrue('id' in top)
        ret = get_obj(self.cli.get(self.path('/groups/+%s+%s' % tuple(top['sub_groups']))))
        self.assertEqual(len(ret), 2)
        manager = ret[0]
        admin = ret[1]
        if manager['roles'][0] == 'admin':
            admin, manager = manager, admin
        user0 = get_obj(self.cli.get(
            self.path('/users/%s' % (manager['members'][0],))))
        self.assertIsNotNone(user0)
        sess0 = get_obj(self.cli.get(self.path('/my_session')))
        self.assertEqual(sess0['user_id'], user0['id'])
        self.assertFalse('id' in sess0)
        certs0 = get_obj(self.cli.put(
            self.path('/users/%s/certs' % (user0['id'],)),
            data=json.dumps({
                'user_id':user0['id'], 'provider': 'password', 'key': 'key0', 'secret': 'pass0'
            }),
            content_type='application/json'))
        self.assertEqual(len(certs0), 1)
        ret = self.cli.get(self.path('/setup'), follow_redirects=False)
        self.assertEqual(ret.status_code, 403)

        sess1 = get_obj(self.cli.post(
            self.path('/sessions'),
            data=json.dumps({
                'provider': 'password', 'key': 'key0', 'secret': 'pass0'
            }),
            content_type='application/json'))
        self.assertIsNotNone(sess1)
        self.assertFalse('id' in sess1)
        certs0 = get_obj(self.cli.get(
            self.path('/users/%s/certs' % (user0['id'],))))
        self.assertEqual(len(certs0), 1)

        group1 = get_obj(self.cli.post(
            self.path('/groups/%s/sub_groups' % (top['id'],)),
            data=json.dumps({'name': 'group x'}),
            content_type='application/json'))
        self.assertIsNotNone(group1)
        group1 = get_obj(self.cli.put(
            self.path('/groups/%s' % (group1['id'],)),
            data=json.dumps({'id': group1['id'], 'name': 'group1', 'ver': 1}),
            content_type='application/json'))
        self.assertIsNotNone(group1)
        group1 = get_obj(self.cli.put(
            self.path('/groups/%s/groups' % (group1['id'],)),
            data=json.dumps([manager['id']]),
            content_type='application/json'))
        self.assertListEqual(group1['groups'], [manager['id']])
        group1 = get_obj(self.cli.put(
            self.path('/groups/%s/sub_groups' % (group1['id'],)),
            data=json.dumps([admin['id']]),
            content_type='application/json'))
        self.assertListEqual(group1['sub_groups'], [admin['id']])
        group1 = get_obj(self.cli.put(
            self.path('/groups/%s/owners' % (group1['id'],)),
            data=json.dumps([user0['id']]),
            content_type='application/json'))
        self.assertListEqual(group1['owners'], [user0['id']])
        user1 = get_obj(self.cli.post(
            self.path('/groups/%s/members' % (group1['id'],)),
            data=json.dumps({'name': 'user x'}),
            content_type='application/json'))
        user1 = get_obj(self.cli.put(
            self.path('/users/%s' % (user1['id'],)),
            data=json.dumps({'id': user1['id'], 'name': 'user1', 'ver': 1}),
            content_type='application/json'))
        group1 = get_obj(self.cli.put(
            self.path('/groups/%s/members' % (group1['id'],)),
            data=json.dumps([user1['id']]),
            content_type='application/json'))
        self.assertListEqual(group1['members'], [user1['id']])
        user1 = get_obj(self.cli.put(
            self.path('/users/%s/own_groups' % (user1['id'],)),
            data=json.dumps([top['id']]),
            content_type='application/json'))
        self.assertListEqual(user1['own_groups'], [top['id']])
        user1 = get_obj(self.cli.put(
            self.path('/users/%s/groups' % (user1['id'],)),
            data=json.dumps([admin['id']]),
            content_type='application/json'))
        self.assertListEqual(user1['groups'], [admin['id']])
        self.cli.put(
            self.path('/users/%s/certs' % (user1['id'],)),
            data=json.dumps({
                'user_id':user1['id'], 'provider': 'password', 'key': 'key1', 'secret': 'pass1'
            }),
            content_type='application/json')
        self.assertEqual(len(certs0), 1)
        get_obj(self.cli.post(
            self.path('/sessions'),
            data=json.dumps({
                'provider': 'password', 'key': 'key1', 'secret': 'pass1'
            }),
            content_type='application/json'))
        sess1 = get_obj(self.cli.post(
            self.path('/sessions'),
            data=json.dumps({
                'provider': 'password', 'key': 'key0', 'secret': 'pass0'
            }),
            content_type='application/json'))
        sessions1 = get_obj(self.cli.get(
            self.path('/sessions/%s/to/%s' % (
                datetime.utcnow().timestamp() - 10,
                datetime.utcnow().timestamp()))))
        self.assertEqual(len(sessions1), 3)
        self.assertEqual(sessions1[1]['provider'], 'password')
        self.assertEqual(sessions1[1]['user_id'], user1['id'])
        ret = get_obj(self.cli.delete(self.path('/sessions/%s' % (sessions1[1]['id']))))
        self.assertTrue(ret)

        profs1 = get_obj(self.cli.put(
            self.path('/users/%s/profs' % user1['id']),
            data=json.dumps([{
                'name': 'name1',
                'props': [{'name': 'name1', 'value': 'value1'}],
            }]),
            content_type='application/json'))
        self.assertEqual(profs1[0]['props'][0]['value'], 'value1')
        profs1 = get_obj(self.cli.get(self.path('/users/%s/profs' % user1['id'])))
        self.assertEqual(profs1[0]['props'][0]['value'], 'value1')

        certs1 = get_obj(self.cli.delete(
            self.path('/users/%s/certs' % user1['id']),
            data=json.dumps({
                'provider': 'password',
                'user_id': user1['id'],
            }),
            content_type='application/json'))
        self.assertListEqual(certs1, [])
        token1 = get_obj(self.cli.post(
            self.path('/tokens'),
            data=json.dumps({
                'user_id': user1['id'],
            }),
            content_type='application/json'))
        self.assertIsNotNone(token1)
        ret = get_obj(self.cli.get(self.path('/tokens')))
        self.assertEqual(len(ret), 1)
        self.assertEqual(len(ret[0]['tokens']), 1)
        self.assertEqual(ret[0]['id'], user1['id'])
        ret = self.cli.get(self.path('/tokens/%s' % token1['id']), follow_redirects=False)
        self.assertEqual(ret.status_code, 302)
        self.assertEqual(ret.location, self.conf['instances'][self.sch]['app_url'])
        sess1 = get_obj(self.cli.post(
            self.path('/sessions'),
            data=json.dumps({
                'provider': 'password', 'key': 'key0', 'secret': 'pass0'
            }),
            content_type='application/json'))
        ret = get_obj(self.cli.delete(
            self.path('/users/%s' % user1['id']),
            data=json.dumps(user1),
            content_type='application/json'))
        self.assertTrue(ret)
        ret = get_obj(self.cli.delete(
            self.path('/groups/%s' % group1['id']),
            data=json.dumps(group1),
            content_type='application/json'))
        self.assertTrue(ret)
        certs0 = get_obj(self.cli.delete(
            self.path('/users/%s/certs' % user0['id']),
            data=json.dumps({
                'provider': 'password',
                'user_id': user0['id'],
            }),
            content_type='application/json'))
        self.assertListEqual(certs0, [])
        ret = self.cli.get(self.path('/tokens/%s' % token1['id']), follow_redirects=False)
        self.assertEqual(ret.status_code, 404)

        # Sing out
        ret = get_obj(self.cli.delete(self.path('/my_session')))
        self.assertTrue(ret)
        top = get_obj(self.cli.get(self.path('/')))
        self.assertTrue('name' in top)
        self.assertFalse('id' in top)
        ret = self.cli.delete(self.path('/my_session'))
        self.assertEqual(ret.status_code, 403)
        ret = self.cli.post(
            self.path('/sessions'),
            data=json.dumps({
                'user_id':user0['id'], 'provider': 'password', 'key': 'key0', 'secret': 'dummy'
            }),
            content_type='application/json')
        self.assertEqual(ret.status_code, 403)

def get_obj(response):
    return json.loads(response.get_data())
