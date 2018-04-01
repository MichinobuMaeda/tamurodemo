"""The model of users."""
from tamuro.database import short_id

def post_member(conn, sch, group_id, obj):
    """To add a member of the group."""
    obj['id'] = short_id()
    obj['name'] = obj['name'].strip()
    obj = validate_note(obj)
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_USER.format(sch), obj)
        success = success and cur.rowcount == 1
        cur.execute(SQL_INSERT_USER_GROUP.format(sch), {
            'id': obj['id'],
            'group_id': group_id,
        })
        success = success and cur.rowcount == 1
    return get(conn, sch, obj['id']) if success else None

def put(conn, sch, obj):
    """To update the user."""
    success = True
    obj['name'] = obj['name'].strip()
    obj = validate_note(obj)
    with conn.cursor() as cur:
        cur.execute(SQL_UPDATE_USER.format(sch), obj)
        success = success and cur.rowcount == 1
    return get(conn, sch, obj['id']) if success else None

def get(conn, sch, users):
    """To get the user(s)."""
    ret = None
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_USERS.format(sch), {
            'ids': tuple([users] if isinstance(users, str) else users)
        })
        for row in cur.fetchall():
            ret = ret or []
            ret.append({
                'id': row[0],
                'name': row[1],
                'note': row[2],
                'groups': row[3],
                'own_groups': row[4],
                'ver': row[5],
                'created_at': row[6],
                'updated_at': row[7],
            })
    return ret[0] if isinstance(users, str) and ret else ret

def delete(conn, sch, obj):
    """To delete the user."""
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_DELETE_USER.format(sch), obj)
        success = success and cur.rowcount == 1
    return success or None

def set_own_groups(conn, sch, user_id, groups):
    """To set the user's own groups."""
    for group_id in groups:
        with conn.cursor() as cur:
            cur.execute(
                SQL_ADD_OWN_GROUP.format(sch),
                {'id': user_id, 'group_id': group_id})
    with conn.cursor() as cur:
        cur.execute(
            SQL_REMOVE_OWN_GROUP.format(sch),
            {'id': user_id, 'groups': tuple(groups or [''])})
    return get(conn, sch, user_id)

def set_groups(conn, sch, user_id, groups):
    """To set the groups the user belongs to."""
    for group_id in groups:
        with conn.cursor() as cur:
            cur.execute(
                SQL_ADD_GROUP.format(sch),
                {'id': user_id, 'group_id': group_id})
    with conn.cursor() as cur:
        cur.execute(
            SQL_REMOVE_GROUP.format(sch),
            {'id': user_id, 'groups': tuple(groups or [''])})
    return get(conn, sch, user_id)

def validate_note(obj):
    """To validate the value of the 'note' attribute """
    if 'note' not in obj:
        obj['note'] = ''
    else:
        obj['note'] = (obj['note'] or '').strip()
    return obj

SQL_INSERT_USER = """
INSERT INTO {0}.users (
  id
, name
, note
) VALUES (
  %(id)s
, %(name)s
, %(note)s
)
"""

SQL_INSERT_USER_GROUP = """
INSERT INTO {0}.member (
  group_id
, user_id
) VALUES (
  %(group_id)s
, %(id)s
)
"""

SQL_UPDATE_USER = """
UPDATE {0}.users
   SET name = %(name)s
     , note = %(note)s
     , ver = ver + 1
     , updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE id = %(id)s
   AND ver = %(ver)s
"""

SQL_SELECT_USERS = """
SELECT id
     , name
     , note
     , ARRAY(
         SELECT group_id
           FROM {0}.member
          WHERE user_id = users.id
       )
     , ARRAY(
         SELECT group_id
           FROM {0}.group_owner
          WHERE user_id = users.id
       )
     , ver
     , created_at
     , updated_at
  FROM {0}.users
 WHERE id IN %(ids)s
"""

SQL_DELETE_USER = """
DELETE
  FROM {0}.users
 WHERE id = %(id)s
"""

SQL_ADD_OWN_GROUP = """
INSERT INTO {0}.group_owner (
  user_id
, group_id
)
SELECT %(id)s
     , %(group_id)s
 WHERE NOT EXISTS (
        SELECT user_id
          FROM {0}.group_owner
         WHERE user_id = %(id)s
           AND group_id = %(group_id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.groups
         WHERE id = %(group_id)s
       )       
"""

SQL_REMOVE_OWN_GROUP = """
DELETE
  FROM {0}.group_owner
 WHERE user_id = %(id)s
   AND group_id NOT IN %(groups)s
"""

SQL_ADD_GROUP = """
INSERT INTO {0}.member (
  group_id
, user_id
)
SELECT %(group_id)s
     , %(id)s
 WHERE NOT EXISTS (
        SELECT user_id
          FROM {0}.member
         WHERE group_id = %(group_id)s
           AND user_id = %(id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.groups
         WHERE id = %(group_id)s
       )       
"""

SQL_REMOVE_GROUP = """
DELETE
  FROM {0}.member
 WHERE user_id = %(id)s
   AND group_id NOT IN %(groups)s
"""
