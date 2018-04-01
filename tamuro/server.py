"""The tamuro API server"""
import logging
import logging.config
from flask import Flask, Blueprint, request, session, make_response, g, jsonify
from tamuro.database import create_pool, init_db
from tamuro.models import sesses
from tamuro import service

class ServiceContext(object):
    """The service context"""

    def __init__(self, conn, sch, sess):
        self.conn = conn
        self.sch = sch
        self.sess = sess

class Api(object):
    """The tamuro API server"""

    def __init__(self, conf, pool, name):
        """Constructor"""
        self.conf = conf
        self.pool = pool
        self.name = name
        self.blueprint = Blueprint(name, __name__)
        logging.info('initialized: HTTP server')

    def init_api(self):
        """Initialize API environment."""
        init_db(self.pool, self.name)
        logging.info('initialized: database schema')

        # registers handlers
        self.blueprint.add_url_rule(
            '/',
            methods=['GET'],
            view_func=self.route_top
        )
        self.blueprint.add_url_rule(
            '/setup',
            methods=['GET'],
            view_func=self.route_setup
        )
        self.blueprint.add_url_rule(
            '/groups/<group_id>',
            methods=['GET', 'PUT', 'DELETE'],
            view_func=self.route_groups
        )
        self.blueprint.add_url_rule(
            '/groups/<group_id>/groups',
            methods=['PUT'],
            view_func=self.route_groups_groups
        )
        self.blueprint.add_url_rule(
            '/groups/<group_id>/sub_groups',
            methods=['POST', 'PUT'],
            view_func=self.route_groups_sub_groups
        )
        self.blueprint.add_url_rule(
            '/groups/<group_id>/owners',
            methods=['PUT'],
            view_func=self.route_groups_owners
        )
        self.blueprint.add_url_rule(
            '/groups/<group_id>/members',
            methods=['POST', 'PUT'],
            view_func=self.route_groups_members
        )
        self.blueprint.add_url_rule(
            '/users/<user_id>',
            methods=['GET', 'PUT', 'DELETE'],
            view_func=self.route_users
        )
        self.blueprint.add_url_rule(
            '/users/<user_id>/groups',
            methods=['PUT'],
            view_func=self.route_users_groups
        )
        self.blueprint.add_url_rule(
            '/users/<user_id>/own_groups',
            methods=['PUT'],
            view_func=self.route_users_own_groups
        )
        self.blueprint.add_url_rule(
            '/users/<user_id>/profs',
            methods=['GET', 'PUT'],
            view_func=self.route_users_profs
        )
        self.blueprint.add_url_rule(
            '/users/<user_id>/certs',
            methods=['GET', 'PUT', 'DELETE'],
            view_func=self.route_users_certs
        )
        self.blueprint.add_url_rule(
            '/sessions',
            methods=['POST'],
            view_func=self.route_sessions
        )
        self.blueprint.add_url_rule(
            '/sessions/<float:from_ts>/to/<float:to_ts>',
            methods=['GET'],
            view_func=self.route_sessions_from_to
        )
        self.blueprint.add_url_rule(
            '/sessions/<sess_id>',
            methods=['DELETE'],
            view_func=self.route_sessions_sess_id
        )
        self.blueprint.add_url_rule(
            '/tokens',
            methods=['GET', 'POST'],
            view_func=self.route_tokens
        )
        self.blueprint.add_url_rule(
            '/tokens/<sess_id>',
            methods=['GET'],
            view_func=self.route_my_token
        )
        self.blueprint.add_url_rule(
            '/my_session',
            methods=['GET', 'DELETE'],
            view_func=self.route_my_session
        )
        logging.info('initialized: HTTP request routes')

    def route_top(self):
        """Route: /"""
        ret = service.get_top(self.ctx())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_setup(self):
        """Route: /setup"""
        return self.set_cookies(service.get_setup(self.ctx()))

    def route_groups(self, group_id):
        """Route: /groups/<group_id>"""
        if request.method == 'GET':
            ret = service.get_groups(self.ctx(), to_array(group_id))
        elif request.method == 'PUT':
            ret = service.put_group(self.ctx(), group_id, request.get_json())
        elif request.method == 'DELETE':
            ret = service.delete_group(self.ctx(), group_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_groups_groups(self, group_id):
        """Route: /groups/<group_id>/groups"""
        ret = service.put_group_groups(self.ctx(), group_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_groups_sub_groups(self, group_id):
        """Route: /groups/<group_id>/sub_groups"""
        if request.method == 'POST':
            ret = service.post_sub_group(self.ctx(), group_id, request.get_json())
        elif request.method == 'PUT':
            ret = service.put_sub_groups(self.ctx(), group_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_groups_owners(self, group_id):
        """Route: /groups/<group_id>/owners"""
        ret = service.put_owners(self.ctx(), group_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_groups_members(self, group_id):
        """Route: /groups/<group_id>/members"""
        if request.method == 'POST':
            ret = service.post_member(self.ctx(), group_id, request.get_json())
        elif request.method == 'PUT':
            ret = service.put_members(self.ctx(), group_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_users(self, user_id):
        """Route: /users/<user_id>"""
        if request.method == 'GET':
            ret = service.get_users(self.ctx(), to_array(user_id))
        elif request.method == 'PUT':
            ret = service.put_user(self.ctx(), user_id, request.get_json())
        elif request.method == 'DELETE':
            ret = service.delete_user(self.ctx(), user_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_users_groups(self, user_id):
        """Route: /users/<user_id>/groups"""
        ret = service.put_user_groups(self.ctx(), user_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_users_own_groups(self, user_id):
        """Route: /users/<user_id>/own_groups"""
        ret = service.put_own_groups(self.ctx(), user_id, request.get_json())
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_users_profs(self, user_id):
        """Route: /users/<user_id>/profs"""
        if request.method == 'GET':
            ret = service.get_user_profs(self.ctx(), user_id)
        elif request.method == 'PUT':
            ret = service.put_user_profs(self.ctx(), user_id, request.get_json())
        return jsonify(ret) if ret or ret == [] else (jsonify({}), 403)

    def route_users_certs(self, user_id):
        """Route: /users/<user_id>/certs"""
        if request.method == 'GET':
            ret = service.get_certs(self.ctx(), user_id)
        elif request.method == 'PUT':
            ret = service.put_cert(self.ctx(), user_id, request.get_json(),
                                   self.conf['auth']['seed'])
        elif request.method == 'DELETE':
            ret = service.delete_cert(self.ctx(), user_id, request.get_json())
        return jsonify(ret) if ret or ret == [] else (jsonify({}), 403)

    def route_sessions(self):
        """Route: /sessions"""
        sess = service.post_session(self.ctx(), request.get_json(), self.conf['auth']['seed'])
        if sess:
            session['tamuro_sess_id'] = sess['id']
            del sess['id']
            return jsonify(sess)
        else:
            return jsonify({}), 403

    def route_sessions_from_to(self, from_ts, to_ts):
        """Route: /sessions/<float:from_ts>/to/<float:to_ts>"""
        ret = service.get_sessions(self.ctx(), from_ts, to_ts)
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_sessions_sess_id(self, sess_id):
        """Route: /sessions/<sess_id>"""
        ret = service.delete_session(self.ctx(), sess_id)
        return jsonify(ret) if ret else (jsonify({}), 403)

    def route_tokens(self):
        """Route: /tokens"""
        if request.method == 'GET':
            ret = service.get_token_status(self.ctx())
            return jsonify(ret) if ret else (jsonify({}), 403)
        elif request.method == 'POST':
            ret = service.post_token(self.ctx(), request.get_json())
            return jsonify(ret) if ret else (jsonify({}), 403)

    def route_my_token(self, sess_id):
        """Route: /tokens/<sess_id>"""
        sess = sesses.touch(self.ctx().conn, self.name, sess_id)
        if not sess or sess['provider'] != 'token':
            g.conn.rollback()
            return (jsonify({}), 404)
        else:
            g.conn.commit()
            return self.set_cookies(sess['id'])

    def route_my_session(self):
        """Route: /my_session"""
        sess = self.ctx().sess
        if not sess:
            return jsonify({}), 403
        if request.method == 'GET':
            del sess['id']
            return jsonify(sess)
        elif request.method == 'DELETE':
            ret = service.delete_session(self.ctx(), sess['id'])
            session.pop('tamuro_sess_id', None)
            return jsonify(ret) if ret else (jsonify({}), 403)

    def ctx(self):
        """Returns the service context."""
        if not hasattr(g, 'conn'):
            g.conn = self.pool.getconn()
            g.pool = self.pool
        sess = None
        if 'tamuro_sess_id' in session:
            sess = sesses.touch(g.conn, self.name, session['tamuro_sess_id'])
            g.conn.commit()
        return ServiceContext(g.conn, self.name, sess)

    def set_cookies(self, sess_id):
        """Sets session id in cookies"""
        if sess_id:
            session['tamuro_sess_id'] = sess_id
            resp = make_response(jsonify({}), 302)
            resp.headers['Location'] = self.conf['instances'][self.name]['app_url']
            return resp
        else:
            resp = make_response(jsonify({}), 403)
            resp.set_cookie('tamuro_sess_id', '')
            return resp

def to_array(value):
    """Convert a string value to array if the value starts with '+'"""
    return value[1:].split('+') if value[0] == '+' else value

def close_db(error):
    """Closes the database connection."""
    if hasattr(g, 'conn'):
        g.pool.putconn(g.conn)

def init_app(conf):
    """Initializes the server."""
    logging.config.dictConfig(conf['logging'])
    logging.info('initialized: logger')
    pool = create_pool(conf['database'])
    logging.info('initialized: database connection pool')
    app = Flask(__name__)
    app.config.update(conf['flask'])
    logging.info('configured: Flask app')
    for name in conf['instances']:
        api = Api(conf, pool, name)
        api.init_api()
        logging.info('initialized: blueprint instance: %s', name)
        app.register_blueprint(api.blueprint, url_prefix=conf['instances'][name]['path_prefix'])
        logging.info('registered: blueprint instance: %s', name)
    app.teardown_appcontext(close_db)
    logging.info('initialized: Flask app')
    return app, pool
