"""The model of user profiles."""

def put(conn, sch, user_id, obj):
    """To set the user profiles."""
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_USER_COUNT.format(sch), (user_id,))
        row = cur.fetchone()
        if not row[0]:
            return None
    prof_names = []
    for prof in obj:
        prof = validate_prof(prof)
        prof['user_id'] = user_id
        added = False
        with conn.cursor() as cur:
            cur.execute(SQL_INSERT_PROF.format(sch), prof)
            added = cur.rowcount == 1
        for group_id in (prof['privs'] or []):
            with conn.cursor() as cur:
                cur.execute(
                    SQL_INSERT_PROF_PRIV.format(sch),
                    {**prof, **{'group_id': group_id}}
                )
        with conn.cursor() as cur:
            cur.execute(
                SQL_DELETE_PROF_PRIVS_OUTDATED.format(sch),
                {**prof, **{'groups': tuple(prof['privs'] or [''])}}
            )
        prop_names = []
        props_updated = False
        for prop in (prof['props'] or []):
            prop = validate_prop(prop)
            prop['user_id'] = user_id
            prop['prof_name'] = prof['name']
            if prop['value']:
                prop_names.append(prop['name'])
                with conn.cursor() as cur:
                    cur.execute(SQL_INSERT_PROF_PROP.format(sch), prop)
                    if cur.rowcount:
                        props_updated = True
                    else:
                        with conn.cursor() as cur:
                            cur.execute(SQL_UPDATE_PROF_PROP.format(sch), prop)
                            if cur.rowcount:
                                props_updated = True
                for group_id in (prop['privs'] or []):
                    with conn.cursor() as cur:
                        cur.execute(
                            SQL_INSERT_PROF_PROP_PRIV.format(sch),
                            {**prop, **{'group_id': group_id}}
                        )
                with conn.cursor() as cur:
                    cur.execute(
                        SQL_DELETE_PROF_PROP_PRIVS_OUTDATED.format(sch),
                        {**prop, **{'groups': tuple(prop['privs'] or [''])}}
                    )
        if prop_names:
            prof_names.append(prof['name'])
            with conn.cursor() as cur:
                cur.execute(SQL_DELETE_PROF_PROPS_OUTDATED.format(sch), {
                    'user_id': user_id,
                    'prof_name': prof['name'],
                    'names': tuple(prop_names or ['']),
                })
        if not added:
            if props_updated:
                with conn.cursor() as cur:
                    cur.execute(SQL_UPDATE_PROF.format(sch), prof)
            else:
                with conn.cursor() as cur:
                    cur.execute(SQL_UPDATE_PROF_IF_MODIFIED.format(sch), prof)
    with conn.cursor() as cur:
        cur.execute(SQL_DELETE_PROFS_OUTDATED.format(sch), {
            'user_id': user_id,
            'names': tuple(prof_names or ['']),
        })
    return get_all(conn, sch, (user_id,))

def get_all(conn, sch, user_id):
    """To get the user profiles."""
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_USER_COUNT.format(sch), (user_id,))
        row = cur.fetchone()
        if not row[0]:
            return None
    profs = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_PROFS.format(sch), (user_id,))
        for prof in cur.fetchall():
            profs.append({
                'name': prof[0],
                'note': prof[1],
                'main': prof[2],
                'ver': prof[3],
                'created_at': prof[4],
                'updated_at': prof[5],
                'privs': [],
                'props': [],
            })
    for prof in profs:
        with conn.cursor() as cur:
            cur.execute(SQL_SELECT_PROF_PRIVS.format(sch), {
                'user_id': user_id,
                'name': prof['name'],
            })
            for priv in cur.fetchall():
                prof['privs'].append(priv[0])
        with conn.cursor() as cur:
            cur.execute(SQL_SELECT_PROF_PROPS.format(sch), {
                'user_id': user_id,
                'prof_name': prof['name'],
            })
            for prop in cur.fetchall():
                prof['props'].append({
                    'name': prop[0],
                    'value': prop[1],
                    'ver': prop[2],
                    'created_at': prop[3],
                    'updated_at': prop[4],
                    'privs': [],
                })
        for prop in prof['props']:
            with conn.cursor() as cur:
                cur.execute(SQL_SELECT_PROF_PROP_PRIVS.format(sch), {
                    'user_id': user_id,
                    'prof_name': prof['name'],
                    'name': prop['name'],
                })
                for ret in cur.fetchall():
                    prop['privs'].append(ret[0])
    return profs

def get(conn, sch, user_id, groups):
    """To get the user profiles."""
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_USER_COUNT.format(sch), (user_id,))
        row = cur.fetchone()
        if not row[0]:
            return None
    profs = []
    with conn.cursor() as cur:
        cur.execute(SQL_SELECT_PROFS_ALLOWED.format(sch), {
            'user_id': user_id,
            'groups': tuple(groups or ['']),
        })
        for prof in cur.fetchall():
            profs.append({
                'name': prof[0],
                'note': prof[1],
                'main': prof[2],
                'ver': prof[3],
                'created_at': prof[4],
                'updated_at': prof[5],
                'props': [],
            })
    for prof in profs:
        with conn.cursor() as cur:
            cur.execute(SQL_SELECT_PROF_PROPS_ALLOWED.format(sch), {
                'user_id': user_id,
                'prof_name': prof['name'],
                'groups': tuple(groups or ['']),
            })
            for prop in cur.fetchall():
                prof['props'].append({
                    'name': prop[0],
                    'value': prop[1],
                    'ver': prop[2],
                    'created_at': prop[3],
                    'updated_at': prop[4],
                })
    return profs

def validate_prof(obj):
    """To validate the value profiles """
    ret = {**obj}
    ret['name'] = ret['name'].strip()
    if 'note' not in ret:
        ret['note'] = ''
    else:
        ret['note'] = (ret['note'] or '').strip()
    if 'main' not in ret:
        ret['main'] = False
    elif not ret['main']:
        ret['main'] = False
    else:
        ret['main'] = True
    if 'privs' not in ret:
        ret['privs'] = []
    if 'props' not in ret:
        ret['props'] = []
    return ret

def validate_prop(obj):
    """To validate the value of properties """
    ret = {**obj}
    ret['name'] = ret['name'].strip()
    if 'value' not in ret:
        ret['value'] = ''
    else:
        ret['value'] = (ret['value'] or '').strip()
    if 'privs' not in ret:
        ret['privs'] = []
    return ret

SQL_SELECT_USER_COUNT = """
SELECT COUNT(*) FROM {0}.USERS
 WHERE id = %s
"""

SQL_DELETE_PROFS_OUTDATED = """
DELETE FROM {0}.profs
 WHERE user_id = %(user_id)s
   AND name NOT IN %(names)s
"""

SQL_DELETE_PROF_PROPS_OUTDATED = """
DELETE FROM {0}.prof_props
 WHERE user_id = %(user_id)s
   AND prof_name = %(prof_name)s
   AND name NOT IN %(names)s
"""

SQL_INSERT_PROF = """
INSERT INTO {0}.profs (
       user_id
     , name
     , note
     , main
) VALUES (
       %(user_id)s
     , %(name)s
     , %(note)s
     , %(main)s
) ON CONFLICT DO NOTHING
"""

SQL_UPDATE_PROF = """
UPDATE {0}.profs
   SET note = %(note)s
     , main = %(main)s
     , ver = ver + 1
     , updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE user_id = %(user_id)s
   AND name = %(name)s
   AND ver = %(ver)s
"""

SQL_UPDATE_PROF_IF_MODIFIED = """
UPDATE {0}.profs
   SET note = %(note)s
     , main = %(main)s
     , ver = ver + 1
     , updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE user_id = %(user_id)s
   AND name = %(name)s
   AND ver = %(ver)s
   AND (note <> %(note)s
     OR main <> %(main)s)
"""

SQL_INSERT_PROF_PRIV = """
INSERT INTO {0}.prof_privs (
       user_id
     , name
     , group_id
)
SELECT 
       %(user_id)s
     , %(name)s
     , %(group_id)s
 WHERE NOT EXISTS (
        SELECT group_id
          FROM {0}.prof_privs
         WHERE user_id = %(user_id)s
           AND name = %(name)s
           AND group_id = %(group_id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.groups
         WHERE id = %(group_id)s
       )
"""

SQL_DELETE_PROF_PRIVS_OUTDATED = """
DELETE FROM {0}.prof_privs
 WHERE user_id = %(user_id)s
   AND name = %(name)s
   AND group_id NOT IN %(groups)s
"""

SQL_INSERT_PROF_PROP = """
INSERT INTO {0}.prof_props (
       user_id
     , prof_name
     , name
     , value
) VALUES (
       %(user_id)s
     , %(prof_name)s
     , %(name)s
     , %(value)s
) ON CONFLICT DO NOTHING
"""

SQL_UPDATE_PROF_PROP = """
UPDATE {0}.prof_props
   SET value = %(value)s
     , ver = ver + 1
     , updated_at = (NOW() AT TIME ZONE 'UTC')
 WHERE user_id = %(user_id)s
   AND prof_name = %(prof_name)s
   AND name = %(name)s
   AND ver = %(ver)s
   AND value <> %(value)s
"""

SQL_INSERT_PROF_PROP_PRIV = """
INSERT INTO {0}.prof_prop_privs (
       user_id
     , prof_name
     , name
     , group_id
)
SELECT 
       %(user_id)s
     , %(prof_name)s
     , %(name)s
     , %(group_id)s
 WHERE NOT EXISTS (
        SELECT group_id
          FROM {0}.prof_prop_privs
         WHERE user_id = %(user_id)s
           AND prof_name = %(prof_name)s
           AND name = %(name)s
           AND group_id = %(group_id)s
       )
   AND EXISTS (
        SELECT id
          FROM {0}.groups
         WHERE id = %(group_id)s
       )
"""

SQL_DELETE_PROF_PROP_PRIVS_OUTDATED = """
DELETE FROM {0}.prof_prop_privs
 WHERE user_id = %(user_id)s
   AND prof_name = %(prof_name)s
   AND name = %(name)s
   AND group_id NOT IN %(groups)s
"""

SQL_SELECT_PROFS = """
SELECT name
     , note
     , main
     , ver
     , created_at
     , updated_at
  FROM {0}.profs
 WHERE user_id = %s
 ORDER BY name
"""

SQL_SELECT_PROF_PRIVS = """
SELECT group_id
  FROM {0}.prof_privs
 WHERE user_id = %(user_id)s
   AND name = %(name)s
 ORDER BY group_id
"""

SQL_SELECT_PROF_PROPS = """
SELECT name
     , value
     , ver
     , created_at
     , updated_at
  FROM {0}.prof_props
 WHERE user_id = %(user_id)s
   AND prof_name = %(prof_name)s
 ORDER BY name
"""

SQL_SELECT_PROF_PROP_PRIVS = """
SELECT group_id
  FROM {0}.prof_prop_privs
 WHERE user_id = %(user_id)s
   AND prof_name = %(prof_name)s
   AND name = %(name)s
 ORDER BY group_id
"""

SQL_SELECT_PROFS_ALLOWED = """
SELECT p.name
     , p.note
     , p.main
     , p.ver
     , p.created_at
     , p.updated_at
  FROM {0}.profs p
  JOIN {0}.prof_privs v 
    ON p.user_id = v.user_id
   AND p.name = v.name
 WHERE p.user_id = %(user_id)s
   AND v.group_id in %(groups)s
 ORDER BY p.name
"""

SQL_SELECT_PROF_PROPS_ALLOWED = """
SELECT p.name
     , p.value
     , p.ver
     , p.created_at
     , p.updated_at
  FROM {0}.prof_props p
  JOIN {0}.prof_prop_privs v 
    ON p.user_id = v.user_id
   AND p.prof_name = v.prof_name
   AND p.name = v.name
 WHERE p.user_id = %(user_id)s
   AND p.prof_name = %(prof_name)s
   AND v.group_id in %(groups)s
 ORDER BY p.name
"""
