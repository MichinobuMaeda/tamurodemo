'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { MongoClient } from 'mongodb'
import shortid from 'shortid'

import usersFactory from './users'

let db = null
let users = null
const user1id = shortid.generate()
const user2id = shortid.generate()

beforeAll(async () => {
  db = await MongoClient.connect('mongodb://127.0.0.1:27017/tamuro_api')
  users = await usersFactory(db)
})
beforeEach(async () => {
  await users.remove({})
})
// afterEach(async () => {})
afterAll(async () => {
  await users.remove({})
  await db.close()
})

test('users.validate()', async () => {
  expect((await users.validate()).errors).toBeTruthy()
  expect(await users.validate({
    /* name: */
    profiles: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await users.validate({
    name: null,
    profiles: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await users.validate({
    name: '',
    profiles: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect((await users.validate({
    name: 'User 1',
    /* profiles: */
  })).profiles).toEqual([])
  expect((await users.validate({
    name: 'User 1',
    profiles: null,
  })).profiles).toEqual([])
  expect(await users.validate({
    name: 'User 1',
    profiles: {},
  })).toEqual({
    errors:[ { path: 'profiles', req: 'array' } ]
  })
  expect(await users.validate({
    name: 'User 1',
    profiles: 'string',
  })).toEqual({
    errors:[ { path: 'profiles', req: 'array' } ]
  })
  expect((await users.validate({
    name: 'User 1',
    profiles: [],
  }))._id).not.toBeNull()
  expect((await users.validate({
    name: 'User 1',
    profiles: [],
  })).createdAt).not.toBeNull()
  expect((await users.validate({
    name: 'User 1',
    profiles: [],
  })).modifiedAt).not.toBeNull()
  const ts = new Date()
  expect((await users.validate({
    _id: user1id,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await users.validate({
    _id: user1id,
    ver: '1',
    name: 'User 1',
    profiles: [],
    createdAt: ts,
  }))).toEqual({
    _id: user1id,
    ver: 1,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  await users.save({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await users.validate({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await users.validate({
    _id: user2id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    errors:[ { path: 'name', req: 'unique' } ]
  })
  expect((await users.validate({
    _id: user2id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
  }, false))).toEqual({
    _id: user2id,
    ver: 0,
    name: 'User 1',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  })
})
