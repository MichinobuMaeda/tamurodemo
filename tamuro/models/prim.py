"""To do setup and to get primary objects of the database."""
from tamuro.database import short_id
from tamuro.models import groups, users, sesses

def get(conn, sch):
    """To get the top group."""
    top = None
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_TOP.format(sch))
        for row in cur.fetchall():
            top = {
                'id': row[0],
                'name': row[0],
            }
    return top

def setup(conn, sch):
    """To create the primary objects and return the session for setup."""
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_COUNT.format(sch))
        row = cur.fetchone()
        if row[0] > 0:
            return None
    top = {'id': short_id(), 'name': 'Our site'}
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_GROUP.format(sch), top)
        cur.execute(SQL_INSERT_GROUP_ROLE.format(sch), {'name': 'top', 'group_id': top['id']})
    manager = groups.post_sub_group(conn, sch, top['id'], {'name': 'User manager'})
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_GROUP_ROLE.format(sch), {'name': 'manager', 'group_id': manager['id']})
    admin = groups.post_sub_group(conn, sch, top['id'], {'name': 'System administrator'})
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_GROUP_ROLE.format(sch), {'name': 'admin', 'group_id': admin['id']})
    user0 = users.post_member(conn, sch, manager['id'], {'name': 'Primary user'})
    users.set_groups(conn, sch, user0['id'], [manager['id'], admin['id']])
    sess0 = sesses.post_token(conn, sch, user0['id'])
    return sess0['id']

SQL_SELECT_TOP = """
SELECT groups.id
     , groups.name
  FROM {0}.groups
  JOIN {0}.group_role ON groups.id = group_role.group_id
 WHERE group_role.name = 'top'
"""

SQL_SELECT_COUNT = """
SELECT
    (SELECT COUNT(*) FROM {0}.groups)
  + (SELECT COUNT(*) FROM {0}.users)
"""

SQL_INSERT_GROUP = """
INSERT INTO {0}.groups (id, name) VALUES (%(id)s, %(name)s)
"""

SQL_INSERT_GROUP_ROLE = """
INSERT INTO {0}.group_role (name, group_id) VALUES (%(name)s, %(group_id)s)
"""
