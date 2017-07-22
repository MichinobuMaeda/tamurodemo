'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { MongoClient } from 'mongodb'
import shortid from 'shortid'

import usersFactory from './users'
import credsFactory from './credentials'

let db = null
let users = null
let creds = null
const user1id = shortid.generate()
const user2id = shortid.generate()
const cred1id = shortid.generate()
const cred2id = shortid.generate()

beforeAll(async () => {
  db = await MongoClient.connect('mongodb://127.0.0.1:27017/tamuro_api')
  users = await usersFactory(db)
  creds = await credsFactory(db)
})
beforeEach(async () => {
  await users.remove({})
  await creds.remove({})
})
// afterEach(async () => {})
afterAll(async () => {
  await users.remove({})
  await creds.remove({})
  await db.close()
})


test('creds.validate()', async () => {
  expect((await creds.validate()).errors).toBeTruthy()
  await users.save({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profiles: [],
  })
  expect(await creds.validate({
    /* uid: */
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'uid', req: 'required' } ]
  })
  expect(await creds.validate({
    uid: user1id,
    /* provider */
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'provider', req: 'required' } ]
  })
  expect(await creds.validate({
    uid: user1id,
    provider: 'password',
    /* authId: */
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'authId', req: 'required' } ]
  })
  expect(await creds.validate({
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    /* password: */
  })).toEqual({
    errors:[ { path: 'password', req: 'required' } ]
  })
  expect((await creds.validate({
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  }))._id).not.toBeNull()
  expect((await creds.validate({
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).createdAt).not.toBeNull()
  expect((await creds.validate({
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).modifiedAt).not.toBeNull()
  const ts = new Date()
  expect(await creds.validate({
    _id: cred1id,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
    modifiedAt: ts,
  })).toEqual({
    _id: cred1id,
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
    modifiedAt: ts,
  })
  expect(await creds.validate({
    _id: cred1id,
    ver: '1',
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
  })).toEqual({
    _id: cred1id,
    ver: 1,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
    modifiedAt: ts,
  })
  expect(await creds.validate({
    _id: cred1id,
    ver: '1',
    uid: user2id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'uid', req: 'reference' } ]
  })
  expect(await creds.validate({
    _id: cred1id,
    ver: '1',
    uid: user2id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
  }, false)).toEqual({
    _id: cred1id,
    ver: 1,
    uid: user2id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
    modifiedAt: ts,
  })
  await creds.save({
    _id: cred1id,
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
    modifiedAt: ts,
  })
  await users.save({
    _id: user2id,
    ver: 0,
    name: 'User 2',
    profiles: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect(await creds.validate({
    _id: cred2id,
    ver: 0,
    uid: user2id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'authId', req: 'unique' } ]
  })
  expect(await creds.validate({
    _id: cred2id,
    ver: 0,
    uid: user2id,
    provider: 'password',
    authId: 'user2auth',
    password: 'user2pass',
    createdAt: ts,
  })).toEqual({
    _id: cred2id,
    ver: 0,
    uid: user2id,
    provider: 'password',
    authId: 'user2auth',
    password: 'user2pass',
    createdAt: ts,
    modifiedAt: ts,
  })
})
