"""The model of user certifications."""
import hashlib
import codecs

def put(conn, sch, seed, obj):
    """To set the user certification."""
    success = True
    obj['key'] = obj['key'].strip()
    validate_secret(obj)
    if obj['provider'] == 'password':
        obj['secret'] = digest(seed, obj)
    else:
        obj['secret'] = None
    with conn.cursor() as cur:
        cur.execute(SQL_INSERT_CERT.format(sch), obj)
        if cur.rowcount:
            success = success and cur.rowcount == 1
        else:
            cur.execute(SQL_UPDATE_CERT.format(sch), obj)
            success = success and cur.rowcount == 1
    return get(conn, sch, obj['user_id']) if success else None

def get(conn, sch, user_id):
    """To get the user certification(s)."""
    certs = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_CERTS.format(sch), {'user_id': user_id})
        for row in cur.fetchall():
            if row[0] == 'password':
                certs.append({
                    'user_id': user_id,
                    'provider': row[0],
                    'key': row[1],
                    'created_at': row[2],
                    'updated_at': row[3],
                })
            else:
                certs.append({
                    'user_id': user_id,
                    'provider': row[0],
                    'created_at': row[2],
                    'updated_at': row[3],
                })
    return certs

def get_by_key(conn, sch, seed, obj):
    """To get a certification by key."""
    validate_secret(obj)
    cert = None
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_CERTS_BY_KEY.format(sch), obj)
        for row in cur.fetchall():
            if obj['provider'] != 'password' \
            or row[1] == digest(seed, {'user_id': row[0], 'secret': obj['secret']}):
                cert = {
                    'user_id': row[0],
                    'provider': obj['provider'],
                    'created_at': row[2],
                    'updated_at': row[3],
                }
    return cert

def delete(conn, sch, obj):
    """To delete the user certification."""
    success = True
    with conn.cursor() as cur:
        cur.execute(SQL_DELETE_CERT.format(sch), obj)
        success = success and cur.rowcount == 1
    return get(conn, sch, obj['user_id']) if success else None

def digest(seed, obj):
    """To get the digest hash of the secret phrase."""
    return hashlib.sha256(codecs.encode(
        '%s %s %s' % (obj['secret'], seed, obj['user_id']),
        encoding='utf-8')).hexdigest()

def validate_secret(obj):
    """To validate the value of the 'secret' attribute """
    if 'secret' not in obj:
        obj['secret'] = ''
    else:
        obj['secret'] = (obj['secret'] or '').strip()
    return obj

SQL_INSERT_CERT = """
INSERT INTO {0}.certs (
       user_id
     , provider
     , key
     , secret
) VALUES (
       %(user_id)s
     , %(provider)s
     , %(key)s
     , %(secret)s
) ON CONFLICT DO NOTHING
"""

SQL_UPDATE_CERT = """
UPDATE {0}.certs
   SET key = %(key)s
     , secret = %(secret)s
     , ver = ver + 1
     , updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE user_id = %(user_id)s
   AND provider = %(provider)s
   AND ver = %(ver)s
   AND (key <> %(key)s
     OR secret <> %(secret)s)
"""

SQL_SELECT_CERTS = """
SELECT provider
     , key
     , created_at
     , updated_at
  FROM {0}.certs
 WHERE user_id = %(user_id)s
 ORDER BY provider DESC
"""

SQL_SELECT_CERTS_BY_KEY = """
SELECT user_id
     , secret
     , created_at
     , updated_at
  FROM {0}.certs
 WHERE provider = %(provider)s
   AND key = %(key)s
"""

SQL_DELETE_CERT = """
DELETE FROM {0}.certs
 WHERE user_id = %(user_id)s
   AND provider = %(provider)s
"""
