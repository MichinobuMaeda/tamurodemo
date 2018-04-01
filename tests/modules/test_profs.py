"""Test models.profs"""
import unittest
from tests.utils import test_init_db
from tamuro.models import prim, sesses, groups, users, profs

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
        """Tests functions of models.profs"""
        sess_id = prim.setup(self.conn, self.sch)
        sess0 = sesses.touch(self.conn, self.sch, sess_id)
        user0 = users.get(self.conn, self.sch, sess0['user_id'])
        groups0 = groups.get(self.conn, self.sch, user0['groups'])
        manager = groups0[0]
        admin = groups0[1]
        if manager['roles'][0] == 'admin':
            admin, manager = manager, admin
        top = groups.get(self.conn, self.sch, manager['groups'][0])
        profs0 = profs.get_all(self.conn, self.sch, sess0['user_id'])
        self.assertListEqual(profs0, [])
        ret = profs.get_all(self.conn, self.sch, 'dummy')
        self.assertIsNone(ret)
        ret = profs.get(self.conn, self.sch, 'dummy', [])
        self.assertIsNone(ret)
        ret = profs.put(self.conn, self.sch, 'dummy', [])
        self.assertIsNone(ret)
        profs1 = profs.put(self.conn, self.sch, sess0['user_id'], [
            {
                'name':  'prof1',
                'props': [
                    {
                        'name': 'name11',
                        'value': 'value11',
                    },
                ],
            },
            {
                'name': 'prof2',
                'note': 'note2',
                'main': True,
                'privs': [manager['id'], admin['id']],
                'props': [
                    {
                        'name': 'name21',
                        'value': 'value21',
                        'privs': [manager['id'], admin['id']],
                    },
                    {
                        'name': 'name22',
                        'value': 'value22',
                        'privs': [],
                    },
                ],
            },
            {
                'name':  'prof3',
                'privs': [manager['id'], admin['id']],
                'props': [
                    {
                        'name': 'name31',
                        'privs': [manager['id'], admin['id']],
                    },
                ],
            },
        ])
        self.conn.commit()
        ts1 = profs1[0]['created_at']
        self.assertListEqual(profs1, [
            {
                'name':  'prof1',
                'note': '',
                'main': False,
                'ver': 1,
                'created_at': ts1,
                'updated_at': ts1,
                'privs': [],
                'props': [
                    {
                        'name': 'name11',
                        'value': 'value11',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': [],
                    },
                ],
            },
            {
                'name': 'prof2',
                'note': 'note2',
                'main': True,
                'ver': 1,
                'created_at': ts1,
                'updated_at': ts1,
                'privs': sorted([manager['id'], admin['id']]),
                'props': [
                    {
                        'name': 'name21',
                        'value': 'value21',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': sorted([manager['id'], admin['id']]),
                    },
                    {
                        'name': 'name22',
                        'value': 'value22',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': [],
                    },
                ],
            },
        ])
        profs2 = profs.put(self.conn, self.sch, sess0['user_id'], [
            {
                'name': 'prof1',
                'note': '',
                'main': False,
                'ver': 1,
                'created_at': ts1,
                'updated_at': ts1,
                'privs': [],
                'props': [
                    {
                        'name': 'name11',
                        'value': 'value11',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': [],
                    },
                ],
            },
            {
                'name': 'prof2',
                'note': 'note2',
                'main': True,
                'ver': 1,
                'created_at': ts1,
                'updated_at': ts1,
                'privs': sorted([manager['id'], admin['id']]),
                'props': [
                    {
                        'name': 'name21',
                        'value': 'value21x',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': sorted([manager['id'], admin['id']]),
                    },
                    {
                        'name': 'name22',
                        'value': '',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': [],
                    },
                    {
                        'name': 'name23',
                        'value': 'value23',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': [],
                    },
                ],
            },
        ])
        self.conn.commit()
        ts2 = profs2[1]['updated_at']
        self.assertListEqual(profs2, [
            {
                'name': 'prof1',
                'note': '',
                'main': False,
                'ver': 1,
                'created_at': ts1,
                'updated_at': ts1,
                'privs': [],
                'props': [
                    {
                        'name': 'name11',
                        'value': 'value11',
                        'ver': 1,
                        'created_at': ts1,
                        'updated_at': ts1,
                        'privs': [],
                    },
                ],
            },
            {
                'name': 'prof2',
                'note': 'note2',
                'main': True,
                'ver': 2,
                'created_at': ts1,
                'updated_at': ts2,
                'privs': sorted([manager['id'], admin['id']]),
                'props': [
                    {
                        'name': 'name21',
                        'value': 'value21x',
                        'ver': 2,
                        'created_at': ts1,
                        'updated_at': ts2,
                        'privs': sorted([manager['id'], admin['id']]),
                    },
                    {
                        'name': 'name23',
                        'value': 'value23',
                        'ver': 1,
                        'created_at': ts2,
                        'updated_at': ts2,
                        'privs': [],
                    },
                ],
            },
        ])
        profs2a = profs.get(self.conn, self.sch, sess0['user_id'], [])
        self.assertListEqual(profs2a, [])
        profs2b = profs.get(self.conn, self.sch, sess0['user_id'], [admin['id']])
        self.assertListEqual(profs2b, [
            {
                'name': 'prof2',
                'note': 'note2',
                'main': True,
                'ver': 2,
                'created_at': ts1,
                'updated_at': ts2,
                'props': [
                    {
                        'name': 'name21',
                        'value': 'value21x',
                        'ver': 2,
                        'created_at': ts1,
                        'updated_at': ts2,
                    },
                ],
            },
        ])
        del profs2[0]['props']
        profs3 = profs.put(self.conn, self.sch, sess0['user_id'], profs2)
        self.assertListEqual(profs3, [
            {
                'name': 'prof2',
                'note': 'note2',
                'main': True,
                'ver': 2,
                'created_at': ts1,
                'updated_at': ts2,
                'privs': sorted([manager['id'], admin['id']]),
                'props': [
                    {
                        'name': 'name21',
                        'value': 'value21x',
                        'ver': 2,
                        'created_at': ts1,
                        'updated_at': ts2,
                        'privs': sorted([manager['id'], admin['id']]),
                    },
                    {
                        'name': 'name23',
                        'value': 'value23',
                        'ver': 1,
                        'created_at': ts2,
                        'updated_at': ts2,
                        'privs': [],
                    },
                ],
            },
        ])
