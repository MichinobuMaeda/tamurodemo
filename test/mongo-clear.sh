mongo <<EOS
use tamuro_api
db.users.remove({})
db.groups.remove({})
db.prims.remove({})
db.creds.remove({})
db.sessions.remove({})
db.logs.remove({})
EOS
