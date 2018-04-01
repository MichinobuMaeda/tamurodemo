"""Test models"""
import os
from flask import json
from tamuro.database import create_pool, init_db

def test_init_db():
    """Drops all tables and return the test database connection bool and the schema name."""
    with open(os.path.dirname(__file__) + '/../config_test.json', 'r') as f:
        config = json.load(f)
        pool = create_pool(config['database'])
    sch = 'test'
    conn = pool.getconn()
    with conn.cursor() as cur:
        cur.execute("""
SELECT table_name FROM information_schema.tables
 WHERE table_schema='%s'""" % sch)
        cur.execute("""
TRUNCATE TABLE %s CASCADE""" % ', '.join(['%s.%s' % (sch, row[0]) for row in cur.fetchall()]))
    conn.commit()
    pool.putconn(conn)
    init_db(pool, sch)
    return pool, sch
