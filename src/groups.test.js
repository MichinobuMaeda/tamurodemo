'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { MongoClient } from 'mongodb'
import shortid from 'shortid'

import usersFactory from './users'
import groupsFactory from './groups'

let db = null
let users = null
let groups = null
const user1id = shortid.generate()
const group1id = shortid.generate()
const group2id = shortid.generate()

beforeAll(async () => {
  db = await MongoClient.connect('mongodb://127.0.0.1:27017/tamuro_api')
  users = await usersFactory(db)
  groups = await groupsFactory(db)
})
beforeEach(async () => {
  await users.remove({})
  await groups.remove({})
})
// afterEach(async () => {})
afterAll(async () => {
  await users.remove({})
  await groups.remove({})
  await db.close()
})

test('group.validate()', async () => {
  expect((await groups.validate()).errors).toBeTruthy()
  expect(await groups.validate({
    /* name: */
    gids: [],
    uids: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await groups.validate({
    name: null,
    gids: [],
    uids: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await groups.validate({
    name: '',
    gids: [],
    uids: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect((await groups.validate({
    name: 'Group 1',
    /* gids: */
    uids: [],
  })).gids).toEqual([])
  expect((await groups.validate({
    name: 'Group 1',
    gids: [],
    /* uids: */
  })).uids).toEqual([])
  expect(await groups.validate({
    name: 'Group 1',
    gids: {},
    uids: [],
  })).toEqual({
    errors:[ { path: 'gids', req: 'array' } ]
  })
  expect(await groups.validate({
    name: 'Group 1',
    gids: [],
    uids: {},
  })).toEqual({
    errors:[ { path: 'uids', req: 'array' } ]
  })
  expect((await groups.validate({
    name: 'Group 1',
    gids: [],
    uids: [],
  }))._id).not.toBeNull()
  expect((await groups.validate({
    name: 'Group 1',
    gids: [],
    uids: [],
  })).createdAt).not.toBeNull()
  expect((await groups.validate({
    name: 'Group 1',
    gids: [],
    uids: [],
  })).modifiedAt).not.toBeNull()
  const ts = new Date()
  expect((await groups.validate({
    _id: group1id,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await groups.validate({
    _id: group1id,
    ver: '1',
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
  }))).toEqual({
    _id: group1id,
    ver: 1,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  await groups.save({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await groups.validate({
    _id: group2id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
  }))).toEqual({
    errors:[ { path: 'name', req: 'unique' } ]
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [group2id],
    uids: [],
  }))).toEqual({
    errors:[ { path: 'gids', req: 'reference' } ]
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [group2id],
    uids: [],
    createdAt: ts,
  }, false))).toEqual({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [group2id],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  await groups.save({
    _id: group2id,
    ver: 0,
    name: 'Group 2',
    gids: [],
    uids: [],
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [group2id],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [group2id],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [user1id],
  }))).toEqual({
    errors:[ { path: 'uids', req: 'reference' } ]
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [user1id],
    createdAt: ts,
  }, false))).toEqual({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [user1id],
    createdAt: ts,
    modifiedAt: ts,
  })
  await db.collection('users').save({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profiles: [],
  })
  expect((await groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [user1id],
    createdAt: ts,
  }))).toEqual({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [user1id],
    createdAt: ts,
    modifiedAt: ts,
  })
})

test('groups.getAncestors()', async () => {
  let top = { _id: shortid.generate(), name: 'Top', gids: [], uids: [] }
  let admin = { _id: shortid.generate(), name: 'Admin', gids: [], uids: [] }
  let manager = { _id: shortid.generate(), name: 'Manager', gids: [], uids: [] }
  let user1 = { _id: shortid.generate(), name: 'User 1' }
  top.gids = [ admin._id, manager._id ]
  admin.uids = [ user1._id ]
  manager.uids = [ user1._id ]
  await groups.save(top)
  await groups.save(admin)
  await groups.save(manager)
  await users.save(user1)

  let gids = await groups.getAncestors(user1._id)
  expect(gids).toHaveLength(3)
  expect(gids).toContain(top._id)
  expect(gids).toContain(admin._id)
  expect(gids).toContain(manager._id)

  let group1 = await groups.validate({name: 'Group 1'})
  let group2 = await groups.validate({name: 'Group 2'})
  let user2 = await users.validate({name: 'User 2'})
  manager.gids.push(group1._id)
  group1.gids.push(group2._id)
  group2.gids.push(manager._id)
  await groups.save(manager)
  await groups.save(group1)
  await groups.save(group2)
  await users.save(user2)
  gids = await groups.getAncestors(user1._id)
  expect(gids).toHaveLength(5)
  expect(gids).toContain(top._id)
  expect(gids).toContain(admin._id)
  expect(gids).toContain(manager._id)
  expect(gids).toContain(group1._id)
  expect(gids).toContain(group2._id)

  gids = await groups.getAncestors(user2._id)
  expect(gids).toHaveLength(0)

  gids = await groups.getAncestors()
  expect(gids).toHaveLength(0)
})
