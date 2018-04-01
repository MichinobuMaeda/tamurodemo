"""The service"""
from datetime import datetime
from tamuro.models import sesses, prim, groups, users, profs, certs

def get_top(ctx):
    """Route: GET /"""
    top = prim.get(ctx.conn, ctx.sch)
    if not top:
        return {}
    elif not ctx.sess or 'user_id' not in ctx.sess:
        return {'name': top['name']}
    else:
        return groups.get(ctx.conn, ctx.sch, top['id'])

def get_setup(ctx):
    """Route: GET /setup"""
    ret = prim.setup(ctx.conn, ctx.sch)
    ctx.conn.commit()
    return ret

def get_groups(ctx, group_id):
    """Route: GET /groups/<group_id>"""
    return groups.get(ctx.conn, ctx.sch, group_id) if ctx.sess else None

def put_group(ctx, group_id, obj):
    """Route: PUT /groups/<group_id>"""
    if ctx.sess and obj['id'] == group_id and \
        (ctx.sess['is_manager'] or
         groups.is_owner(ctx.conn, ctx.sch, ctx.sess['user_id'], group_id)):
        ret = groups.put(ctx.conn, ctx.sch, obj)
        ctx.conn.commit()
        return ret
    else:
        return None

def delete_group(ctx, group_id, obj):
    """Route: DELETE /groups/<group_id>"""
    if not ctx.sess or obj['id'] != group_id:
        return None
    else:
        ret = groups.delete(ctx.conn, ctx.sch, obj) if ctx.sess['is_manager'] else None
        ctx.conn.commit()
        return ret

def put_group_groups(ctx, group_id, group_ids):
    """Route: PUT /groups/<group_id>/groups"""
    if ctx.sess and ctx.sess['is_manager']:
        return groups.set_groups(ctx.conn, ctx.sch, group_id, group_ids)
    else:
        return None

def post_sub_group(ctx, group_id, obj):
    """Route: POST /groups/<group_id>/sub_groups"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = groups.post_sub_group(ctx.conn, ctx.sch, group_id, obj)
        ctx.conn.commit()
        return ret
    else:
        return None

def put_sub_groups(ctx, group_id, sub_groups):
    """Route: PUT /groups/<group_id>/sub_groups"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = groups.set_sub_groups(ctx.conn, ctx.sch, group_id, sub_groups)
        ctx.conn.commit()
        return ret
    else:
        return None

def put_owners(ctx, group_id, owners):
    """Route: PUT /groups/<group_id>/owners"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = groups.set_owners(ctx.conn, ctx.sch, group_id, owners)
        ctx.conn.commit()
        return ret
    else:
        return None

def post_member(ctx, group_id, obj):
    """Route: POST /groups/<group_id>/members"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = users.post_member(ctx.conn, ctx.sch, group_id, obj)
        ctx.conn.commit()
        return ret
    else:
        return None

def put_members(ctx, group_id, members):
    """Route: PUT /groups/<group_id>/members"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = groups.set_members(ctx.conn, ctx.sch, group_id, members)
        ctx.conn.commit()
        return ret
    else:
        return None

def get_users(ctx, user_id):
    """Route: GET /users/<user_id>"""
    return users.get(ctx.conn, ctx.sch, user_id) if ctx.sess else None

def get_user_profs(ctx, user_id):
    """Route: GET /users/<user_id>/profs"""
    if not ctx.sess:
        return None
    elif ctx.sess['is_manager'] or ctx.sess['user_id'] == user_id:
        return profs.get_all(ctx.conn, ctx.sch, user_id)
    else:
        return profs.get(ctx.conn, ctx.sch, user_id, ctx.sess['groups'])

def put_user(ctx, user_id, obj):
    """Route: PUT /users/<user_id>"""
    if not ctx.sess or obj['id'] != user_id:
        return None
    else:
        priv = ctx.sess['is_manager'] or ctx.sess['user_id'] == user_id
        ret = users.put(ctx.conn, ctx.sch, obj) if priv else None
        ctx.conn.commit()
        return ret

def put_user_profs(ctx, user_id, obj):
    """Route: PUT /users/<user_id>/profs"""
    if ctx.sess and (ctx.sess['is_manager'] or ctx.sess['user_id'] == user_id):
        ret = profs.put(ctx.conn, ctx.sch, user_id, obj)
        ctx.conn.commit()
        return ret
    else:
        return None

def delete_user(ctx, user_id, obj):
    """Route: DELETE /users/<user_id>"""
    if not ctx.sess or obj['id'] != user_id:
        return None
    else:
        ret = users.delete(ctx.conn, ctx.sch, obj) if ctx.sess['is_manager'] else None
        ctx.conn.commit()
        return ret

def put_user_groups(ctx, user_id, group_ids):
    """Route: PUT /users/<user_id>/groups"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = users.set_groups(ctx.conn, ctx.sch, user_id, group_ids)
        ctx.conn.commit()
        return ret
    else:
        return None

def put_own_groups(ctx, user_id, group_ids):
    """Route: PUT /users/<user_id>/own_groups"""
    if ctx.sess and ctx.sess['is_manager']:
        ret = users.set_own_groups(ctx.conn, ctx.sch, user_id, group_ids)
        ctx.conn.commit()
        return ret
    else:
        return None

def get_certs(ctx, user_id):
    """Route: GET /users/<user_id>/certs"""
    if ctx.sess and (ctx.sess['is_manager'] or ctx.sess['user_id'] == user_id):
        ret = certs.get(ctx.conn, ctx.sch, user_id)
        ctx.conn.commit()
        return ret
    else:
        return None

def put_cert(ctx, user_id, obj, seed):
    """Route: PUT /users/<user_id>/certs"""
    if ctx.sess and (ctx.sess['is_manager'] or ctx.sess['user_id'] == user_id):
        obj['user_id'] = user_id
        ret = certs.put(ctx.conn, ctx.sch, seed, obj)
        sesses.delete_user_sessions(ctx.conn, ctx.sch, user_id)
        ctx.conn.commit()
        return ret
    else:
        return None

def delete_cert(ctx, user_id, obj):
    """Route: PUT /users/<user_id>/certs"""
    if ctx.sess and user_id == obj['user_id'] and \
        (ctx.sess['is_manager'] or ctx.sess['user_id'] == user_id):
        ret = certs.delete(ctx.conn, ctx.sch, obj)
        ctx.conn.commit()
        return ret
    else:
        return None

def post_session(ctx, obj, seed):
    """Route: POST /sessions"""
    cert = certs.get_by_key(ctx.conn, ctx.sch, seed, obj)
    if not cert:
        return None
    else:
        ret = sesses.post(ctx.conn, ctx.sch, cert)
        ctx.conn.commit()
        return ret

def get_token_status(ctx):
    """Route: GET/tokens"""
    if ctx.sess and (ctx.sess['is_admin']):
        tokens = sesses.get_tokens(ctx.conn, ctx.sch)
        ret = []
        for user in sesses.get_users_for_tokens(ctx.conn, ctx.sch):
            user['tokens'] = []
            for token in tokens:
                if token['user_id'] == user['id']:
                    user['tokens'].append({
                        'id': token['id'],
                        'created_at': token['created_at'],
                        'updated_at': token['updated_at'],
                    })
            ret.append(user)
        return ret
    else:
        return None

def post_token(ctx, obj):
    """Route: POST /tokens"""
    if ctx.sess and ctx.sess['is_admin'] and 'user_id' in obj:
        user_id = obj['user_id']
        user = users.get(ctx.conn, ctx.sch, user_id)
        if user:
            sesses.delete_user_sessions(ctx.conn, ctx.sch, user_id)
            ret = sesses.post_token(ctx.conn, ctx.sch, user_id)
            ctx.conn.commit()
            return {
                'id': ret['id'],
                'user_id': user['id'],
                'user_name': user['name'],
            }
        else:
            return None
    else:
        return None

def get_sessions(ctx, from_ts, to_ts):
    """Route: GET /sessions/<from_ts>/to/<to_ts>"""
    if ctx.sess and ctx.sess['is_admin']:
        return sesses.get(
            ctx.conn,
            ctx.sch,
            datetime.fromtimestamp(from_ts),
            datetime.fromtimestamp(to_ts + 1)
        )
    else:
        return None

def delete_session(ctx, sess_id):
    """Route: DELETE /sessions/<sess_id>"""
    if ctx.sess and (ctx.sess['is_admin'] or ctx.sess['id'] == sess_id):
        ret = sesses.delete(ctx.conn, ctx.sch, sess_id)
        ctx.conn.commit()
        return ret
    else:
        return None
