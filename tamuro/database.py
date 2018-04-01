"""The database initializer and utils"""
from shortid import ShortId
from psycopg2 import pool

SID = ShortId()

def short_id():
    """To create short id for primary keys."""
    return SID.generate()

def create_pool(conf):
    """To create the connection pool."""
    return pool.ThreadedConnectionPool(
        conf['minconn'],
        conf['maxconn'],
        ' '.join(['%s=%s' % (k, conf['dsn'][k]) for k in conf['dsn']])
    )

def init_db(db_pool, sch):
    """To initialize the database schema."""
    conn = db_pool.getconn()
    for ddl in DDL_ALL:
        with conn.cursor() as cur:
            cur.execute(ddl.format(sch))
    conn.commit()
    db_pool.putconn(conn)

DDL_ALL = [
    """
CREATE SCHEMA IF NOT EXISTS {0}
""",
    """
CREATE TABLE IF NOT EXISTS {0}.groups (
  id            TEXT    NOT NULL
, name          TEXT    NOT NULL
, note          TEXT    NOT NULL DEFAULT ''
, ver           INTEGER NOT NULL DEFAULT 1
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, updated_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (id)
, UNIQUE        (name)
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.users (
  id            TEXT    NOT NULL
, name          TEXT    NOT NULL
, note          TEXT    NOT NULL DEFAULT ''
, ver           INTEGER NOT NULL DEFAULT 1
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, updated_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (id)
, UNIQUE        (name)
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.group_role (
  name          TEXT    NOT NULL
, group_id      TEXT    NOT NULL
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (name)
, FOREIGN KEY   (group_id)
    REFERENCES {0}.groups  (id) ON DELETE CASCADE
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.sub_group (
  group_id      TEXT    NOT NULL
, sub_group_id  TEXT    NOT NULL
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (group_id, sub_group_id)
, FOREIGN KEY   (group_id)
    REFERENCES {0}.groups  (id) ON DELETE CASCADE
, FOREIGN KEY   (sub_group_id)
    REFERENCES {0}.groups  (id) ON DELETE CASCADE
)
""",
    """
CREATE INDEX IF NOT EXISTS sub_group_sub_group_id ON {0}.sub_group (
  sub_group_id
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.group_owner (
  user_id       TEXT    NOT NULL
, group_id      TEXT    NOT NULL
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (user_id, group_id)
, FOREIGN KEY   (user_id)
    REFERENCES {0}.users   (id) ON DELETE CASCADE
, FOREIGN KEY   (group_id)
    REFERENCES {0}.groups  (id) ON DELETE CASCADE
)
""",
    """
CREATE INDEX IF NOT EXISTS group_owner_group_id ON {0}.group_Owner (
  group_id
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.member (
  group_id     TEXT    NOT NULL
, user_id      TEXT    NOT NULL
, created_at   TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (group_id, user_id)
, FOREIGN KEY   (group_id)
    REFERENCES {0}.groups  (id) ON DELETE CASCADE
, FOREIGN KEY   (user_id)
    REFERENCES {0}.users   (id) ON DELETE CASCADE
)
""",
    """
CREATE INDEX IF NOT EXISTS member_user_id ON {0}.member (
  user_id
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.certs (
  user_id       TEXT    NOT NULL
, provider      TEXT    NOT NULL
, key           TEXT    NOT NULL
, secret        TEXT
, ver           INTEGER NOT NULL DEFAULT 1
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, updated_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (user_id, provider)
, UNIQUE        (key, provider)
, FOREIGN KEY   (user_id)
    REFERENCES {0}.users  (id) ON DELETE CASCADE
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.profs (
  user_id       TEXT    NOT NULL
, name          TEXT    NOT NULL
, note          TEXT
, main          BOOLEAN NOT NULL DEFAULT FALSE
, ver           INTEGER NOT NULL DEFAULT 1
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, updated_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (user_id, name)
, FOREIGN KEY   (user_id)
    REFERENCES {0}.users  (id) ON DELETE CASCADE
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.prof_privs (
  user_id       TEXT    NOT NULL
, name          TEXT    NOT NULL
, group_id      TEXT    NOT NULL
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (user_id, name, group_id)
, FOREIGN KEY   (user_id, name)
    REFERENCES {0}.profs (user_id, name) ON DELETE CASCADE
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.prof_props (
  user_id       TEXT    NOT NULL
, prof_name     TEXT    NOT NULL
, name          TEXT    NOT NULL
, value         TEXT
, ver           INTEGER NOT NULL DEFAULT 1
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, updated_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (user_id, prof_name, name)
, FOREIGN KEY   (user_id, prof_name)
    REFERENCES {0}.profs (user_id, name) ON DELETE CASCADE
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.prof_prop_privs (
  user_id       TEXT    NOT NULL
, prof_name     TEXT    NOT NULL
, name          TEXT    NOT NULL
, group_id      TEXT    NOT NULL
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (user_id, prof_name, name, group_id)
, FOREIGN KEY   (user_id, prof_name, name)
    REFERENCES {0}.prof_props  (user_id, prof_name, name) ON DELETE CASCADE
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.sess (
  id            TEXT    NOT NULL
, user_id       TEXT    NOT NULL
, provider      TEXT    NOT NULL
, is_manager    BOOLEAN NOT NULL DEFAULT FALSE
, is_admin      BOOLEAN NOT NULL DEFAULT FALSE
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, updated_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (id)
, FOREIGN KEY   (user_id)
    REFERENCES {0}.users  (id) ON DELETE CASCADE
)
""",
    """
CREATE INDEX IF NOT EXISTS sess_user_id ON {0}.sess (
  user_id
)
""",
    """
CREATE INDEX IF NOT EXISTS sess_updated_at ON {0}.sess (
  updated_at
)
""",
    """
CREATE TABLE IF NOT EXISTS {0}.sess_priv (
  sess_id       TEXT    NOT NULL
, group_id      TEXT    NOT NULL
, created_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
, PRIMARY KEY   (sess_id, group_id)
, FOREIGN KEY   (group_id)
    REFERENCES {0}.groups  (id) ON DELETE CASCADE
)
""",
]
