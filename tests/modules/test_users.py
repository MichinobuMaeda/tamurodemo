"""Test models.users"""
import unittest
from tests.utils import test_init_db
from tamuro.models import groups, users

class ModelsUsersTestCase(unittest.TestCase):
    """Test models.users"""

    def setUp(self):
        self.pool, self.sch = test_init_db()
        self.conn = self.pool.getconn()

    def tearDown(self):
        self.pool.putconn(self.conn)
        self.pool.closeall()

    def test_user(self):
        group0 = groups.get(self.conn, self.sch, 'id01')
        self.assertIsNone(group0)
        with self.conn.cursor() as cur:
            cur.execute("""
INSERT INTO {0}.groups (id, name, note)
VALUES ('id00', 'group00', '')""".format(self.sch))
        self.conn.commit()
        group0 = groups.get(self.conn, self.sch, 'id00')
        user1 = users.post_member(self.conn, self.sch, 'id00', {'name': 'user0x'})
        self.conn.commit()
        self.assertEqual(user1['name'], 'user0x')
        self.assertEqual(user1['note'], '')
        self.assertEqual(user1['groups'], ['id00'])
        self.assertEqual(user1['own_groups'], [])
        self.assertEqual(user1['ver'], 1)
        user1a = users.put(self.conn, self.sch, {
            'id': user1['id'],
            'name': '  user01  ',
            'note': '  note01  \n',
            'ver': 1,
        })
        self.conn.commit()
        self.assertEqual(user1a['name'], 'user01')
        self.assertEqual(user1a['note'], 'note01')
        self.assertEqual(user1a['ver'], 2)
        user1b = users.put(self.conn, self.sch, {
            'id': user1['id'],
            'name': 'user01',
            'note': None,
            'ver': 2,
        })
        self.conn.commit()
        self.assertEqual(user1b['name'], 'user01')
        self.assertEqual(user1b['note'], '')
        self.assertEqual(user1b['ver'], 3)
        user1c = users.put(self.conn, self.sch, {
            'id': user1['id'],
            'name': 'user01',
            'ver': 2,
        })
        self.conn.commit()
        self.assertIsNone(user1c)

        group1 = groups.post_sub_group(self.conn, self.sch, group0['id'], {'name': 'group01'})
        self.conn.commit()
        group2 = groups.post_sub_group(self.conn, self.sch, group0['id'], {'name': 'group02'})
        self.conn.commit()
        group3 = groups.post_sub_group(self.conn, self.sch, group0['id'], {'name': 'group03'})
        self.conn.commit()
        user1 = users.set_own_groups(self.conn, self.sch, user1['id'], [group1['id'], group2['id']])
        self.conn.commit()
        group1 = groups.get(self.conn, self.sch, group1['id'])
        group2 = groups.get(self.conn, self.sch, group2['id'])
        group3 = groups.get(self.conn, self.sch, group3['id'])
        self.assertListEqual(sorted(user1['own_groups']), sorted([group1['id'], group2['id']]))
        self.assertListEqual(sorted(group1['owners']), sorted([user1['id']]))
        self.assertListEqual(sorted(group2['owners']), sorted([user1['id']]))
        self.assertListEqual(sorted(group3['owners']), sorted([]))
        user1 = users.set_own_groups(self.conn, self.sch, user1['id'], [group1['id'], group3['id']])
        self.conn.commit()
        group1 = groups.get(self.conn, self.sch, group1['id'])
        group2 = groups.get(self.conn, self.sch, group2['id'])
        group3 = groups.get(self.conn, self.sch, group3['id'])
        self.assertListEqual(sorted(user1['own_groups']), sorted([group1['id'], group3['id']]))
        self.assertListEqual(sorted(group1['owners']), sorted([user1['id']]))
        self.assertListEqual(sorted(group2['owners']), sorted([]))
        self.assertListEqual(sorted(group3['owners']), sorted([user1['id']]))

        user1 = users.set_groups(self.conn, self.sch, user1['id'], [group0['id'], group1['id']])
        self.conn.commit()
        group0 = groups.get(self.conn, self.sch, group0['id'])
        group1 = groups.get(self.conn, self.sch, group1['id'])
        group2 = groups.get(self.conn, self.sch, group2['id'])
        self.assertListEqual(sorted(user1['groups']), sorted([group0['id'], group1['id']]))
        self.assertListEqual(sorted(group0['members']), sorted([user1['id']]))
        self.assertListEqual(sorted(group1['members']), sorted([user1['id']]))
        self.assertListEqual(sorted(group2['members']), sorted([]))
        user1 = users.set_groups(self.conn, self.sch, user1['id'], [group0['id'], group2['id']])
        self.conn.commit()
        group0 = groups.get(self.conn, self.sch, group0['id'])
        group1 = groups.get(self.conn, self.sch, group1['id'])
        group2 = groups.get(self.conn, self.sch, group2['id'])
        self.assertListEqual(sorted(user1['groups']), sorted([group0['id'], group2['id']]))
        self.assertListEqual(sorted(group0['members']), sorted([user1['id']]))
        self.assertListEqual(sorted(group1['members']), sorted([]))
        self.assertListEqual(sorted(group2['members']), sorted([user1['id']]))

        user2 = users.post_member(self.conn, self.sch, group1['id'], {'name': 'user02'})
        self.conn.commit()
        users1 = users.get(self.conn, self.sch, [user1['id'], user2['id']])
        self.assertListEqual(sorted([row['id'] for row in users1]), sorted([user1['id'], user2['id']]))
        ret = users.delete(self.conn, self.sch, user1)
        self.conn.commit()
        self.assertTrue(ret)
        ret = users.delete(self.conn, self.sch, user1)
        self.conn.commit()
        self.assertFalse(ret)
        user1 = users.get(self.conn, self.sch, user1['id'])
        user2 = users.get(self.conn, self.sch, user2['id'])
        self.assertIsNone(user1)
        self.assertIsNotNone(user2)
