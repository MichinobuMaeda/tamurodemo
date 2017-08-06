'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import users from './users'
import groups from './groups'
import creds from './credentials'
import logger from './logger'

const store = async db => {
  let st = {
    users: await users(db),
    groups: await groups(db),
    creds: await creds(db),
    prims: db.collection('prims'),
    sessions: db.collection('sessions'),
    logs: db.collection('logs'),
  }
  await st.sessions.createIndex({ createdAt: 1 })
  await st.logs.createIndex({ time: -1 })
  st.log = logger(st.logs)
  st.prim = await st.prims.findOne({})
  return st
}

export default store
