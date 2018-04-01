"""The server"""
import os
import sys
import json
from tamuro.server import init_app

with open(sys.argv[1] if len(sys.argv) > 1
          else os.path.join(os.path.dirname(__file__), 'config.json'), 'r') as f:
    APP, POOL = init_app(json.load(f))
    APP.run()
