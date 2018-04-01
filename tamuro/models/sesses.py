"""The model of user sessions."""
from tamuro.database import short_id

def post(conn, sch, cert):
    """To add the user session."""
    success = True
    sess_id = short_id()
    groups = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_USER_GROUPS.format(sch), {'id': cert['user_id']})
        for row in cur.fetchall():
            groups.append(row[0])
    if groups:
        groups = get_groups_groups(conn, sch, groups)
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_SESS.format(sch), {
            'id': sess_id,
            'user_id': cert['user_id'],
            'provider': cert['provider'],
            'is_manager': has_role(conn, sch, 'manager', groups),
            'is_admin': has_role(conn, sch, 'admin', groups),
        })
        success = success and cur.rowcount == 1
    with conn.cursor() as cur:
        for group_id in groups:
            cur.execute(SQL_INSERT_SESS_PRIV.format(sch), {
                'sessId': sess_id,
                'group_id': group_id,
            })
    return return_sess_on_success(conn, sch, sess_id, success)

def get_groups_groups(conn, sch, groups):
    """Gets groups of groups"""
    ret = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_GROUPS_GROUPS.format(sch), {'groups': tuple(groups)})
        for row in cur.fetchall():
            ret.append(row[0])
    if ret:
        return get_groups_groups(conn, sch, groups + ret)
    else:
        return groups

def post_token(conn, sch, user_id):
    """To add the session for the invited user."""
    success = True
    sess_id = short_id()
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_SESS.format(sch), {
            'id': sess_id,
            'user_id': user_id,
            'provider': 'token',
            'is_manager': False,
            'is_admin': False,
        })
        success = success and cur.rowcount == 1
    return return_sess_on_success(conn, sch, sess_id, success)

def has_role(conn, sch, role, groups):
    """To get the user has the role or not."""
    ret = False
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_IS_ROLE.format(sch), {'role': role, 'groups': tuple(groups)})
        row = cur.fetchone()
        ret = row[0] > 0
    return ret

def get(conn, sch, from_ts, to_ts):
    """To get sessions between from_ts and to_ts."""
    rows = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_SESSES.format(sch), {'from_ts': from_ts, 'to_ts': to_ts})
        for row in cur.fetchall():
            rows.append({
                'id': row[0],
                'user_id': row[1],
                'provider': row[2],
                'is_manager': row[3],
                'is_admin': row[4],
                'groups': row[5],
                'created_at': row[6],
                'updated_at': row[7],
            })
    return rows

def touch(conn, sch, sess_id):
    """To update the timestamp of the session and get it."""
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_TOUCH_SESS.format(sch), {'id': sess_id})
        success = success and cur.rowcount == 1
    return return_sess_on_success(conn, sch, sess_id, success)

def delete(conn, sch, sess_id):
    """To delete the session."""
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_DELETE_SESS.format(sch), (sess_id,))
        success = success and cur.rowcount == 1
        return success or None

def delete_user_sessions(conn, sch, user_id):
    """To delete the session."""
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_DELETE_USER_SESSIONS.format(sch), (user_id,))
        success = success and cur.rowcount == 1
        return success or None

def get_tokens(conn, sch):
    """To get token sessions."""
    rows = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_TOKENS.format(sch))
        for row in cur.fetchall():
            rows.append({
                'id': row[0],
                'user_id': row[1],
                'user_name': row[2],
                'created_at': row[3],
                'updated_at': row[4],
            })
    return rows

def get_users_for_tokens(conn, sch):
    """To get users to provide token session."""
    rows = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_USERS_WITHOUT_CERT.format(sch))
        for row in cur.fetchall():
            rows.append({
                'id': row[0],
                'name': row[1],
            })
    return rows

def return_sess_on_success(conn, sch, sess_id, success=True):
    """To commit changes and return the user session if success."""
    if success:
        sess = None
        with conn.cursor() as cur:
            cur.execute(SQL_SELECT_SESS.format(sch), {'id': sess_id})
            row = cur.fetchone()
            sess = {
                'id': row[0],
                'user_id': row[1],
                'provider': row[2],
                'is_manager': row[3],
                'is_admin': row[4],
                'groups': row[5],
                'created_at': row[6],
                'updated_at': row[7],
            }
        return sess
    else:
        return None

SQL_SELECT_IS_ROLE = """
SELECT COUNT(*)
  FROM {0}.group_role
 WHERE name = %(role)s
   AND group_id IN %(groups)s
"""

SQL_SELECT_USER_GROUPS = """
SELECT group_id
  FROM {0}.member
 WHERE user_id = %(id)s
"""

SQL_SELECT_GROUPS_GROUPS = """
SELECT DISTINCT group_id
  FROM {0}.sub_group
 WHERE sub_group_id IN %(groups)s
   AND group_id NOT IN %(groups)s
"""

SQL_INSERT_SESS = """
INSERT INTO {0}.sess (
  id
, user_id
, provider
, is_manager
, is_admin
) VALUES (
  %(id)s
, %(user_id)s
, %(provider)s
, %(is_manager)s
, %(is_admin)s
)
"""

SQL_INSERT_SESS_PRIV = """
INSERT INTO {0}.sess_priv (
  sess_id
, group_id
) VALUES (
  %(sessId)s
, %(group_id)s
)
"""

SQL_SELECT_SESS = """
SELECT id
     , user_id
     , provider
     , is_manager
     , is_admin
     , ARRAY(
         SELECT group_id
           FROM {0}.sess_priv
          WHERE sess_id = sess.id
       )
     , created_at
     , updated_at
  FROM {0}.sess
 WHERE id = %(id)s
"""

SQL_SELECT_SESSES = """
SELECT id
     , user_id
     , provider
     , is_manager
     , is_admin
     , ARRAY(
         SELECT group_id
           FROM {0}.sess_priv
          WHERE sess_id = sess.id
       )
     , created_at
     , updated_at
  FROM {0}.sess
 WHERE %(from_ts)s <= updated_at
   AND updated_at <= %(to_ts)s
 ORDER BY updated_at DESC
"""

SQL_TOUCH_SESS = """
UPDATE {0}.sess
   SET updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE id = %(id)s
"""

SQL_DELETE_SESS = """
DELETE
  FROM {0}.sess
 WHERE id = %s
"""

SQL_DELETE_USER_SESSIONS = """
DELETE
  FROM {0}.sess
 WHERE user_id = %s
"""

SQL_SELECT_TOKENS = """
SELECT s.id
     , s.user_id
     , u.name
     , s.created_at
     , s.updated_at
  FROM {0}.sess s
  JOIN {0}.users u
    ON s.user_id = u.id
 WHERE s.provider = 'token'
 ORDER BY u.name
"""

SQL_SELECT_USERS_WITHOUT_CERT = """
SELECT id
     , name
  FROM {0}.users u
 WHERE NOT EXISTS (
        SELECT user_id
          FROM {0}.certs c
         WHERE c.user_id = u.id
       )
 ORDER BY name
"""
