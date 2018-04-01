"""Test models.groups"""
import unittest
from tests.utils import test_init_db
from tamuro.models import groups, users

class ModelsGroupsTestCase(unittest.TestCase):
    """Test models.groups"""

    def setUp(self):
        self.pool, self.sch = test_init_db()
        self.conn = self.pool.getconn()

    def tearDown(self):
        self.pool.putconn(self.conn)
        self.pool.closeall()

    def test_group(self):
        group0 = groups.get(self.conn, self.sch, 'id01')
        self.assertIsNone(group0)
        with self.conn.cursor() as cur:
            cur.execute("""
INSERT INTO {0}.groups (id, name, note)
VALUES ('id00', 'group00', '')""".format(self.sch))
        self.conn.commit()
        group0 = groups.get(self.conn, self.sch, 'id00')
        group1 = groups.post_sub_group(self.conn, self.sch, 'id00', {'name': 'group0x'})
        self.conn.commit()
        self.assertEqual(group1['name'], 'group0x')
        self.assertEqual(group1['note'], '')
        self.assertEqual(group1['roles'], [])
        self.assertEqual(group1['groups'], ['id00'])
        self.assertEqual(group1['sub_groups'], [])
        self.assertEqual(group1['owners'], [])
        self.assertEqual(group1['members'], [])
        self.assertEqual(group1['ver'], 1)
        group1a = groups.put(self.conn, self.sch, {
            'id': group1['id'],
            'name': '  group01  ',
            'note': '  note01  \n',
            'ver': 1,
        })
        self.conn.commit()
        self.assertEqual(group1a['name'], 'group01')
        self.assertEqual(group1a['note'], 'note01')
        self.assertEqual(group1a['ver'], 2)
        group1b = groups.put(self.conn, self.sch, {
            'id': group1['id'],
            'name': 'group01',
            'ver': 2,
        })
        self.conn.commit()
        self.assertEqual(group1b['name'], 'group01')
        self.assertEqual(group1b['note'], '')
        self.assertEqual(group1b['ver'], 3)
        group1c = groups.put(self.conn, self.sch, {
            'id': group1['id'],
            'name': 'group01',
            'ver': 2,
        })
        self.conn.commit()
        self.assertIsNone(group1c)
        group2 = groups.post_sub_group(self.conn, self.sch, group1['id'], {'name': 'group02', 'note': ''})
        self.conn.commit()
        group3 = groups.post_sub_group(self.conn, self.sch, group1['id'], {'name': 'group03', 'note': None})
        self.conn.commit()
        group4 = groups.post_sub_group(self.conn, self.sch, group2['id'], {'name': 'group04'})
        self.conn.commit()
        group5 = groups.post_sub_group(self.conn, self.sch, group0['id'], {'name': 'group05'})
        self.conn.commit()
        self.assertEqual(group2['note'], '')
        self.assertEqual(group3['note'], '')
        ret = groups.delete(self.conn, self.sch, group5)
        self.conn.commit()
        self.assertTrue(ret)
        ret = groups.delete(self.conn, self.sch, group5)
        self.conn.commit()
        self.assertFalse(ret)
        group5 = groups.get(self.conn, self.sch, group5['id'])
        self.conn.commit()
        self.assertIsNone(group5)

        groups1 = groups.get(self.conn, self.sch, [group2['id'], group3['id']])
        self.assertListEqual(
            sorted([row['id'] for row in groups1]),
            sorted([group2['id'], group3['id']]))

        group5 = groups.post_sub_group(self.conn, self.sch, group0['id'], {'name': 'group05'})
        self.conn.commit()
        group0 = groups.get(self.conn, self.sch, 'id00')
        self.assertListEqual(
            sorted(group0['sub_groups']),
            sorted([group1['id'], group5['id']]))
        group0 = groups.set_sub_groups(
            self.conn, self.sch, group0['id'], [group1['id'], group4['id']])
        self.conn.commit()
        group1 = groups.get(self.conn, self.sch, group1['id'])
        group4 = groups.get(self.conn, self.sch, group4['id'])
        group5 = groups.get(self.conn, self.sch, group5['id'])
        self.assertListEqual(sorted(group0['sub_groups']), sorted([group1['id'], group4['id']]))
        self.assertListEqual(sorted(group1['groups']), [group0['id']])
        self.assertListEqual(sorted(group4['groups']), sorted([group2['id'], group0['id']]))
        self.assertListEqual(sorted(group5['groups']), [])

        group4 = groups.set_groups(self.conn, self.sch, group4['id'], [group2['id'], group5['id']])
        self.conn.commit()
        group0 = groups.get(self.conn, self.sch, group0['id'])
        group2 = groups.get(self.conn, self.sch, group2['id'])
        group5 = groups.get(self.conn, self.sch, group5['id'])
        self.assertListEqual(sorted(group0['sub_groups']), [group1['id']])
        self.assertListEqual(sorted(group2['sub_groups']), [group4['id']])
        self.assertListEqual(sorted(group4['groups']), sorted([group2['id'], group5['id']]))
        self.assertListEqual(sorted(group5['sub_groups']), [group4['id']])

        user1 = users.post_member(self.conn, self.sch, group4['id'], {'name': 'user01'})
        self.conn.commit()
        user2 = users.post_member(self.conn, self.sch, group4['id'], {'name': 'user02'})
        self.conn.commit()
        user3 = users.post_member(self.conn, self.sch, group5['id'], {'name': 'user03'})
        self.conn.commit()
        group4 = groups.get(self.conn, self.sch, group4['id'])
        group5 = groups.get(self.conn, self.sch, group5['id'])
        self.assertListEqual(sorted(group4['members']), sorted([user1['id'], user2['id']]))
        self.assertListEqual(sorted(group5['members']), sorted([user3['id']]))

        group4 = groups.set_members(self.conn, self.sch, group4['id'], [user1['id'], user3['id']])
        self.conn.commit()
        group4 = groups.get(self.conn, self.sch, group4['id'])
        user2 = users.get(self.conn, self.sch, user2['id'])
        user3 = users.get(self.conn, self.sch, user3['id'])
        self.assertListEqual(sorted(group4['members']), sorted([user1['id'], user3['id']]))
        self.assertListEqual(sorted(user2['groups']), sorted([]))
        self.assertListEqual(sorted(user3['groups']), sorted([group4['id'], group5['id']]))

        group4 = groups.set_owners(self.conn, self.sch, group4['id'], [user1['id'], user2['id']])
        self.conn.commit()
        self.assertListEqual(sorted(group4['owners']), sorted([user1['id'], user2['id']]))
        self.conn.commit()
        group4 = groups.set_owners(self.conn, self.sch, group4['id'], [user1['id'], user3['id']])
        self.conn.commit()
        self.assertListEqual(sorted(group4['owners']), sorted([user1['id'], user3['id']]))

        ret = groups.is_owner(self.conn, self.sch, user1['id'], group4['id'])
        self.assertTrue(ret)
        ret = groups.is_owner(self.conn, self.sch, user2['id'], group4['id'])
        self.assertFalse(ret)
