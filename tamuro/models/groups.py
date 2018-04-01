"""The model of groups."""
from tamuro.database import short_id

def post_sub_group(conn, sch, group_id, obj):
    """To add a sub-group of the group."""
    obj['id'] = short_id()
    obj['name'] = obj['name'].strip()
    obj = validate_note(obj)
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_GROUP.format(sch), obj)
        success = success and cur.rowcount == 1
        cur.execute(SQL_INSERT_GROUP_GROUP.format(sch), {
            'id': obj['id'],
            'group_id': group_id,
        })
        success = success and cur.rowcount == 1
    return get(conn, sch, obj['id']) if success else None

def put(conn, sch, obj):
    """To update the group."""
    success = True
    obj['name'] = obj['name'].strip()
    obj = validate_note(obj)
    with conn.cursor() as cur:
        cur.execute(SQL_UPDATE_GROUP.format(sch), obj)
        success = success and cur.rowcount == 1
    return get(conn, sch, obj['id']) if success else None

def get(conn, sch, groups):
    """To get the group(s)."""
    ret = None
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_GROUPS.format(sch), {
            'ids': tuple([groups] if isinstance(groups, str) else groups)
        })
        for row in cur.fetchall():
            ret = ret or []
            ret.append({
                'id': row[0],
                'name': row[1],
                'note': row[2],
                'roles': row[3],
                'groups': row[4],
                'sub_groups': row[5],
                'owners': row[6],
                'members': row[7],
                'ver': row[8],
                'created_at': row[9],
                'updated_at': row[10],
            })
    return ret[0] if isinstance(groups, str) and ret else ret

def delete(conn, sch, obj):
    """To delete the group."""
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_DELETE_GROUP.format(sch), obj)
        success = success and cur.rowcount == 1
    return success or None

def is_owner(conn, sch, user_id, group_id):
    """The user is owner of the group or not."""
    ret = False
    with conn.cursor() as cur:
        cur.execute(
            SQL_IS_OWNER.format(sch),
            {'user_id': user_id, 'group_id': group_id})
        row = cur.fetchone()
        ret = row[0] > 0
    return ret

def set_groups(conn, sch, sub_group_id, groups):
    """To set the groups the group belongs to."""
    for group_id in groups:
        with conn.cursor() as cur:
            cur.execute(
                SQL_ADD_GROUP.format(sch),
                {'id': sub_group_id, 'group_id': group_id})
    with conn.cursor() as cur:
        cur.execute(
            SQL_REMOVE_GROUP.format(sch),
            {'id': sub_group_id, 'groups': tuple(groups or [''])})
    return get(conn, sch, sub_group_id)

def set_sub_groups(conn, sch, group_id, sub_groups):
    """To set the sub-groups of the group."""
    for sub_group_id in sub_groups:
        with conn.cursor() as cur:
            cur.execute(
                SQL_ADD_SUB_GROUP.format(sch),
                {'id': group_id, 'sub_group_id': sub_group_id})
    with conn.cursor() as cur:
        cur.execute(
            SQL_REMOVE_SUB_GROUP.format(sch).format(sch),
            {'id': group_id, 'sub_groups': tuple(sub_groups or [''])})
    return get(conn, sch, group_id)

def set_owners(conn, sch, group_id, owners):
    """To set the owners of the group."""
    for user_id in owners:
        with conn.cursor() as cur:
            cur.execute(
                SQL_ADD_OWNER.format(sch),
                {'id': group_id, 'user_id': user_id})
    with conn.cursor() as cur:
        cur.execute(
            SQL_REMOVE_OWNER.format(sch),
            {'id': group_id, 'owners': tuple(owners or [''])})
    return get(conn, sch, group_id)

def set_members(conn, sch, group_id, members):
    """To set the members of the group."""
    for user_id in members:
        with conn.cursor() as cur:
            cur.execute(
                SQL_ADD_MEMBER.format(sch),
                {'id': group_id, 'user_id': user_id})
    with conn.cursor() as cur:
        cur.execute(
            SQL_REMOVE_MEMBER.format(sch),
            {'id': group_id, 'members': tuple(members or [''])})
    return get(conn, sch, group_id)

def validate_note(obj):
    """To validate the value of the 'note' attribute """
    if 'note' not in obj:
        obj['note'] = ''
    else:
        obj['note'] = (obj['note'] or '').strip()
    return obj

SQL_INSERT_GROUP = """
INSERT INTO {0}.groups (
  id
, name
, note
) VALUES (
  %(id)s
, %(name)s
, %(note)s
)
"""

SQL_INSERT_GROUP_GROUP = """
INSERT INTO {0}.sub_group (
  group_id
, sub_group_id
) VALUES (
  %(group_id)s
, %(id)s
)
"""

SQL_UPDATE_GROUP = """
UPDATE {0}.groups
   SET name = %(name)s
     , note = %(note)s
     , ver = ver + 1
     , updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE id = %(id)s
   AND ver = %(ver)s
"""

SQL_SELECT_GROUPS = """
SELECT id
     , name
     , note
     , ARRAY(
         SELECT name
           FROM {0}.group_role
          WHERE group_id = groups.id
       )
     , ARRAY(
         SELECT group_id
           FROM {0}.sub_group
          WHERE sub_group_id = groups.id
       )
     , ARRAY(
         SELECT sub_group_id
           FROM {0}.sub_group
          WHERE group_id = groups.id
       )
     , ARRAY(
         SELECT user_id
           FROM {0}.group_owner
          WHERE group_id = groups.id
       )
     , ARRAY(
         SELECT user_id
           FROM {0}.member
          WHERE group_id = groups.id
       )
     , ver
     , created_at
     , updated_at
  FROM {0}.groups
 WHERE id IN %(ids)s
"""

SQL_DELETE_GROUP = """
DELETE
  FROM {0}.groups
 WHERE id = %(id)s
"""

SQL_IS_OWNER = """
SELECT COUNT(*)
  FROM {0}.group_owner
 WHERE group_id = %(group_id)s
   AND user_id = %(user_id)s
"""

SQL_ADD_GROUP = """
INSERT INTO {0}.sub_group (
  group_id
, sub_group_id
)
SELECT %(group_id)s
     , %(id)s
 WHERE NOT EXISTS (
        SELECT group_id
          FROM {0}.sub_group
         WHERE group_id = %(group_id)s
           AND sub_group_id = %(id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.groups
         WHERE id = %(group_id)s
       )       
"""

SQL_REMOVE_GROUP = """
DELETE
  FROM {0}.sub_group
 WHERE sub_group_id = %(id)s
   AND group_id NOT IN %(groups)s
"""

SQL_ADD_SUB_GROUP = """
INSERT INTO {0}.sub_group (
  group_id
, sub_group_id
)
SELECT %(id)s
     , %(sub_group_id)s
 WHERE NOT EXISTS (
        SELECT sub_group_id
          FROM {0}.sub_group
         WHERE group_id = %(id)s
           AND sub_group_id = %(sub_group_id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.groups
         WHERE id = %(sub_group_id)s
       )       
"""

SQL_REMOVE_SUB_GROUP = """
DELETE
  FROM {0}.sub_group
 WHERE group_id = %(id)s
   AND sub_group_id NOT IN %(sub_groups)s
"""

SQL_ADD_OWNER = """
INSERT INTO {0}.group_owner (
  user_id
, group_id
)
SELECT %(user_id)s
     , %(id)s
 WHERE NOT EXISTS (
        SELECT user_id
          FROM {0}.group_owner
         WHERE user_id = %(user_id)s
           AND group_id = %(id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.users
         WHERE id = %(user_id)s
       )       
"""

SQL_REMOVE_OWNER = """
DELETE
  FROM {0}.group_owner
 WHERE group_id = %(id)s
   AND user_id NOT IN %(owners)s
"""

SQL_ADD_MEMBER = """
INSERT INTO {0}.member (
  group_id
, user_id
)
SELECT %(id)s
     , %(user_id)s
 WHERE NOT EXISTS (
        SELECT user_id
          FROM {0}.member
         WHERE group_id = %(id)s
           AND user_id = %(user_id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.users
         WHERE id = %(user_id)s
       )       
"""

SQL_REMOVE_MEMBER = """
DELETE
  FROM {0}.member
 WHERE group_id = %(id)s
   AND user_id NOT IN %(members)s
"""
