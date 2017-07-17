'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import client from 'rest'
import cookie from 'cookie'

import conf from '../conf.sample'
import Api from './api.js'
import template from './template'
const api = new Api(conf)
let _server

const DebugLog = class {
  write(rec) {
    console.info(rec)
  }
}

beforeAll(async () => {
  _server = await api.init()
  api.log.addStream({
    name: 'test',
    stream: new DebugLog(),
    level: 'debug'
  })
})
beforeEach(async () => {
  await cleanupDb()
})
// afterEach(async () => {})
afterAll(async () => {
  await _server.close()
  await cleanupDb()
  await api.db.close()
})

async function cleanupDb() {
  await api.users.remove({})
  await api.groups.remove({})
  await api.prims.remove({})
  await api.creds.remove({})
  await api.sessions.remove({})
  await api.logs.remove({})
  api.prim = null
}

const user1id = shortid.generate()
const user2id = shortid.generate()
const group1id = shortid.generate()
const group2id = shortid.generate()
const cred1id = shortid.generate()
const cred2id = shortid.generate()

test('template.setupHtml', () => {
  let html = template.setupHtml()
  expect(html.match('action=""')).toBeTruthy()
  expect(html.match('name="top" value=""')).toBeTruthy()
  expect(html.match('name="admin" value=""')).toBeTruthy()
  expect(html.match('name="manager" value=""')).toBeTruthy()
  expect(html.match('name="name" value=""')).toBeTruthy()
  expect(html.match('name="authId" value=""')).toBeTruthy()
  html = template.setupHtml({
    path: '/',
    top: 'Top',
    admin: 'Admin',
    manager: 'Manager',
    name: 'User 1',
    authId: 'user1id',
  })
  expect(html.match('action="/"')).toBeTruthy()
  expect(html.match('name="top" value="Top"')).toBeTruthy()
  expect(html.match('name="admin" value="Admin"')).toBeTruthy()
  expect(html.match('name="manager" value="Manager"')).toBeTruthy()
  expect(html.match('name="name" value="User 1"')).toBeTruthy()
  expect(html.match('name="authId" value="user1id"')).toBeTruthy()
})

test('users.validate()', async () => {
  expect((await api.users.validate()).errors).toBeTruthy()
  expect(await api.users.validate({
    /* name: */
    profile: {},
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await api.users.validate({
    name: null,
    profile: {},
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await api.users.validate({
    name: '',
    profile: {},
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect((await api.users.validate({
    name: 'User 1',
    /* profile: */
  })).profile).toEqual({})
  expect((await api.users.validate({
    name: 'User 1',
    profile: null,
  })).profile).toEqual({})
  expect(await api.users.validate({
    name: 'User 1',
    profile: [],
  })).toEqual({
    errors:[ { path: 'profile', req: 'object' } ]
  })
  expect(await api.users.validate({
    name: 'User 1',
    profile: 'string',
  })).toEqual({
    errors:[ { path: 'profile', req: 'object' } ]
  })
  expect((await api.users.validate({
    name: 'User 1',
    profile: {},
  }))._id).not.toBeNull()
  expect((await api.users.validate({
    name: 'User 1',
    profile: {},
  })).createdAt).not.toBeNull()
  expect((await api.users.validate({
    name: 'User 1',
    profile: {},
  })).modifiedAt).not.toBeNull()
  const ts = new Date()
  expect((await api.users.validate({
    _id: user1id,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await api.users.validate({
    _id: user1id,
    ver: '1',
    name: 'User 1',
    profile: {},
    createdAt: ts,
  }))).toEqual({
    _id: user1id,
    ver: 1,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  })
  await api.users.save({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await api.users.validate({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await api.users.validate({
    _id: user2id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  }))).toEqual({
    errors:[ { path: 'name', req: 'unique' } ]
  })
  expect((await api.users.validate({
    _id: user2id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
  }, false))).toEqual({
    _id: user2id,
    ver: 0,
    name: 'User 1',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  })
})

test('group.validate()', async () => {
  expect((await api.groups.validate()).errors).toBeTruthy()
  expect(await api.groups.validate({
    /* name: */
    gids: [],
    uids: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await api.groups.validate({
    name: null,
    gids: [],
    uids: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect(await api.groups.validate({
    name: '',
    gids: [],
    uids: [],
  })).toEqual({
    errors:[ { path: 'name', req: 'required' } ]
  })
  expect((await api.groups.validate({
    name: 'Group 1',
    /* gids: */
    uids: [],
  })).gids).toEqual([])
  expect((await api.groups.validate({
    name: 'Group 1',
    gids: [],
    /* uids: */
  })).uids).toEqual([])
  expect(await api.groups.validate({
    name: 'Group 1',
    gids: {},
    uids: [],
  })).toEqual({
    errors:[ { path: 'gids', req: 'array' } ]
  })
  expect(await api.groups.validate({
    name: 'Group 1',
    gids: [],
    uids: {},
  })).toEqual({
    errors:[ { path: 'uids', req: 'array' } ]
  })
  expect((await api.groups.validate({
    name: 'Group 1',
    gids: [],
    uids: [],
  }))._id).not.toBeNull()
  expect((await api.groups.validate({
    name: 'Group 1',
    gids: [],
    uids: [],
  })).createdAt).not.toBeNull()
  expect((await api.groups.validate({
    name: 'Group 1',
    gids: [],
    uids: [],
  })).modifiedAt).not.toBeNull()
  const ts = new Date()
  expect((await api.groups.validate({
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
  expect((await api.groups.validate({
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
  await api.groups.save({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
    createdAt: ts,
    modifiedAt: ts,
  })
  expect((await api.groups.validate({
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
  expect((await api.groups.validate({
    _id: group2id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [],
  }))).toEqual({
    errors:[ { path: 'name', req: 'unique' } ]
  })
  expect((await api.groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [group2id],
    uids: [],
  }))).toEqual({
    errors:[ { path: 'gids', req: 'reference' } ]
  })
  expect((await api.groups.validate({
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
  await api.groups.save({
    _id: group2id,
    ver: 0,
    name: 'Group 2',
    gids: [],
    uids: [],
  })
  expect((await api.groups.validate({
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
  expect((await api.groups.validate({
    _id: group1id,
    ver: 0,
    name: 'Group 1',
    gids: [],
    uids: [user1id],
  }))).toEqual({
    errors:[ { path: 'uids', req: 'reference' } ]
  })
  expect((await api.groups.validate({
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
  await api.users.save({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profile: {},
  })
  expect((await api.groups.validate({
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

test('creds.validate()', async () => {
  expect((await api.creds.validate()).errors).toBeTruthy()
  await api.users.save({
    _id: user1id,
    ver: 0,
    name: 'User 1',
    profile: {},
  })
  expect(await api.creds.validate({
    /* uid: */
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'uid', req: 'required' } ]
  })
  expect(await api.creds.validate({
    uid: user1id,
    /* provider */
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'provider', req: 'required' } ]
  })
  expect(await api.creds.validate({
    uid: user1id,
    provider: 'password',
    /* authId: */
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'authId', req: 'required' } ]
  })
  expect(await api.creds.validate({
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    /* password: */
  })).toEqual({
    errors:[ { path: 'password', req: 'required' } ]
  })
  expect((await api.creds.validate({
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  }))._id).not.toBeNull()
  expect((await api.creds.validate({
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).createdAt).not.toBeNull()
  expect((await api.creds.validate({
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).modifiedAt).not.toBeNull()
  const ts = new Date()
  expect(await api.creds.validate({
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
  expect(await api.creds.validate({
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
  expect(await api.creds.validate({
    _id: cred1id,
    ver: '1',
    uid: user2id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'uid', req: 'reference' } ]
  })
  expect(await api.creds.validate({
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
  await api.creds.save({
    _id: cred1id,
    ver: 0,
    uid: user1id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
    createdAt: ts,
    modifiedAt: ts,
  })
  await api.users.save({
    _id: user2id,
    ver: 0,
    name: 'User 2',
    profile: {},
    createdAt: ts,
    modifiedAt: ts,
  })
  expect(await api.creds.validate({
    _id: cred2id,
    ver: 0,
    uid: user2id,
    provider: 'password',
    authId: 'user1auth',
    password: 'user1pass',
  })).toEqual({
    errors:[ { path: 'authId', req: 'unique' } ]
  })
  expect(await api.creds.validate({
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

test('GET /setup', async () => {
  let res = await client({
    method: 'GET',
    path: `http://localhost:${conf.port}${conf.prefix}/setup`,
  })
  expect(res.status).toEqual({code: 200})
  expect(res.entity).toEqual(template.setupHtml({
    path: `${conf.prefix}/setup`,
    errors: '',
    top: '',
    admin: '',
    manager: '',
    name: '',
    authId: '',
  }))
  api.prim = {}
  res = await client({
    method: 'GET',
    path: `http://localhost:${conf.port}${conf.prefix}/setup`,
  })
  expect(res.status).toEqual({code: 200})
  expect(res.entity).toEqual(template.completeHtml())
})

test('POST /setup', async () => {
  let logCount = await api.logs.count({})
  let res = await client({
    method: 'POST',
    path: `http://localhost:${conf.port}${conf.prefix}/setup`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    entity: [
      'confirm=dummy',
    ].join('&'),
  })
  expect(res.status).toEqual({code: 200})
  expect(res.entity.match('Required: Title')).not.toBeNull()
  expect(res.entity.match('Required: Admin')).not.toBeNull()
  expect(res.entity.match('Required: Manager')).not.toBeNull()
  expect(res.entity.match('Required: Your name')).not.toBeNull()
  expect(res.entity.match('Required: Your ID')).not.toBeNull()
  expect(res.entity.match('Required: Your password')).not.toBeNull()
  expect(res.entity.match('Required: Type')).not.toBeNull()

  res = await client({
    method: 'POST',
    path: `http://localhost:${conf.port}${conf.prefix}/setup`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    entity: [
      'top=Top',
      'admin=Admin',
      'manager=Manager',
      'name=User+1',
      'authId=user1auth',
      'password=user1pass',
      'confirm=user1pass',
    ].join('&'),
  })
  expect(res.status).toEqual({code: 302})
  expect(await api.users.count({})).toEqual(1)
  expect(await api.creds.count({})).toEqual(1)
  expect(await api.groups.count({})).toEqual(3)
  expect(await api.prims.count({})).toEqual(1)
  let user = await api.users.findOne({ name: 'User 1' })
  let cred = await api.creds.findOne({ authId: 'user1auth' })
  expect(cred.password).toEqual(api.digestPassword(user._id.toString(), 'user1pass'))
  
  res = await client({
    method: 'POST',
    path: `http://localhost:${conf.port}${conf.prefix}/setup`,
    entity: JSON.stringify({})
  })
  expect(res.status).toEqual({code: 404})
  expect((await api.logs.count({})) - logCount).toEqual(2)
})

test('api.getGroups()', async () => {
  let { top, admin, manager, cred1 } = await getTestPrimeObjects()
  let gids = await api.getGroups(cred1.uid)
  expect(gids).toHaveLength(3)
  expect(gids).toContain(top._id)
  expect(gids).toContain(admin._id)
  expect(gids).toContain(manager._id)

  let group1 = await api.groups.validate({name: 'Group 1'})
  let group2 = await api.groups.validate({name: 'Group 2'})
  let user2 = await api.users.validate({name: 'User 2'})
  manager.gids.push(group1._id)
  group1.gids.push(group2._id)
  group2.gids.push(manager._id)
  await api.groups.save(manager)
  await api.groups.save(group1)
  await api.groups.save(group2)
  await api.users.save(user2)
  gids = await api.getGroups(cred1.uid)
  expect(gids).toHaveLength(5)
  expect(gids).toContain(top._id)
  expect(gids).toContain(admin._id)
  expect(gids).toContain(manager._id)
  expect(gids).toContain(group1._id)
  expect(gids).toContain(group2._id)

  gids = await api.getGroups(user2._id)
  expect(gids).toHaveLength(0)

  gids = await api.getGroups()
  expect(gids).toHaveLength(0)
})

test('POST /sessions', async () => {
  // before setup
  let res = await get('/', null)
  expect(JSON.parse(res.entity)).toEqual({})

  // setup
  let { top, admin, manager, user1 } = await getTestPrimeObjects()

  // before sign in
  res = await get('/', null)
  expect(JSON.parse(res.entity)).toEqual({ name: 'Top' })

  res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user1id',
    password: 'user1pass',
  })
  let sid = res.cookies[0]
  expect(sid.SID).not.toBeNull()
  expect(sid['httponly,SID.sig']).not.toBeNull()
  expect(res.json).toEqual(top)
  let sess = await api.sessions.findOne({ _id: sid.SID })
  expect(sess.uid).toEqual(user1._id)
  expect(sess.provider).toEqual('password')
  expect(sess.gids).toHaveLength(3)
  expect(sess.gids).toContain(top._id)
  expect(sess.gids).toContain(admin._id)
  expect(sess.gids).toContain(manager._id)
  expect(sess.admin).toBeTruthy()
  expect(sess.manager).toBeTruthy()

  // after sign in
  res = await get('/', sid)
  expect(res.json).toEqual(top)

  let cred2 = {
    _id: shortid.generate(),
    ver: 0,
    uid: user1._id,
    provider: 'dummy',
    authId: 'user1id',
  }
  await api.creds.save(cred2)
  res = await post('/sessions', sid, {
    provider: 'dummy',
    authId: 'user1id',
    password: 'user1pass',
  })
  expect(res.json).toEqual({ errors: [ { path: 'provider', req: 'reference' } ]})

  res = await post('/sessions', null, {
    provider: 'password',
    authId: 'dummy',
    password: 'user1pass',
  })
  expect(res.json).toEqual({ errors: [ { path: 'authId', req: 'reference' } ]})

  res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user1id',
    password: 'dummy',
  })
  expect(res.json).toEqual({ errors: [ { path: '', req: 'auth' } ]})

  res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user1id',
  })
  expect(res.json).toEqual({ errors: [ { path: '', req: 'auth' } ]})
})

test('GET /sessions', async () => {
  await getTestPrimeObjects()

  let res = await get('/sessions', null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  let user4 = await api.users.findOne({ name: 'User 4' })
  res = await get('/sessions', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'admin' } ]})

  sid = await loginAsManager()
  let user3 = await api.users.findOne({ name: 'User 3' })
  res = await get('/sessions', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'admin' } ]})

  sid = await loginAsAdmin()
  let user2 = await api.users.findOne({ name: 'User 2' })
  res = await get('/sessions', sid)
  expect(res.json).toHaveLength(3)
  expect(res.json[0].uid).toEqual(user2._id)
  expect(res.json[1].uid).toEqual(user3._id)
  expect(res.json[2].uid).toEqual(user4._id)
})

test('DELETE /sessions', async () => {
  let { top } = await getTestPrimeObjects()
  let sid = await loginAsUser4()

  // after sign in
  let res = await get('/', sid)
  expect(res.json).toEqual(top)
  expect(await api.sessions.count({})).toEqual(1)

  res = await del('/sessions', sid)
  expect(res.json).toEqual({ name: top.name })

  // after sign out
  res = await get('/', sid)
  expect(res.json).toEqual({ name: top.name })
  expect(await api.sessions.count({})).toEqual(0)
})

test('Session timeout', async () => {
  let { top, user1 } = await getTestPrimeObjects()
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user1id',
    password: 'user1pass',
  })
  let sid = res.cookies[0]

  // before session timeout
  res = await get('/', sid)
  expect(res.json).toEqual(top)
  expect(await api.sessions.count({})).toEqual(1)

  let sess = await api.sessions.findOne({ uid: user1._id })
  sess.createdAt = new Date(new Date(sess.createdAt).getTime() - conf.expires)
  await api.sessions.findOneAndUpdate({ uid: user1._id }, sess)

  // after session timeout
  res = await get('/', sid)
  expect(res.json).toEqual({ name: top.name })
  expect(await api.sessions.count({})).toEqual(0)
})

test('GET /users', async () => {
  await getTestPrimeObjects()

  let res = await get('/users', null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await get('/users', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await get('/users', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await get('/users', sid)
  expect(res.json).toHaveLength(4)
  let user1 = await api.users.findOne({ name: 'User 1' })
  let user2 = await api.users.findOne({ name: 'User 2' })
  let user3 = await api.users.findOne({ name: 'User 3' })
  let user4 = await api.users.findOne({ name: 'User 4' })
  expect(res.json[0]._id).toEqual(user1._id)
  expect(res.json[1]._id).toEqual(user2._id)
  expect(res.json[2]._id).toEqual(user3._id)
  expect(res.json[3]._id).toEqual(user4._id)
})

test('GET /users/:uid', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await get('/users/dummy', null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await get(`/users/${shortid.generate()}`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'uid', req: 'reference' } ]})

  res = await get(`/users/${user1._id}`, sid)
  expect(res.json).toEqual(user1)
})

test('PUT /users/:uid/ver/:ver', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await put(`/users/${user1._id}/ver/0`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await put(`/users/${user1._id}/ver/0`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager|uid' } ]})

  let user4 = await api.users.findOne({ name: 'User 4' })
  user4.profile = { test: 'Test1'}
  res = await put(`/users/${user4._id}/ver/${user4.ver + 1}`, sid, user4)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  user4.name = 'User 1'
  res = await put(`/users/${user4._id}/ver/${user4.ver}`, sid, user4)
  expect(res.json).toEqual({ errors: [ { path: 'name', req: 'unique' } ]})
  user4.name = 'User 4'

  res = await put(`/users/${user4._id}/ver/${user4.ver}`, sid, user4)
  ++ user4.ver
  user4.modifiedAt = new Date(res.json.modifiedAt)
  expect(res.json).toEqual(normalize(user4))

  sid = await loginAsAdmin()
  res = await put(`/users/${user1._id}/ver/0`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager|uid' } ]})

  sid = await loginAsManager()
  user4.profile = { test: 'Test2'}
  res = await put(`/users/${user4._id}/ver/${user4.ver}`, sid, user4)
  ++ user4.ver
  user4.modifiedAt = new Date(res.json.modifiedAt)
  expect(res.json).toEqual(normalize(user4))
})

test('DELETE /users/:uid/ver/:ver', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await del(`/users/${user1._id}/ver/0`, null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await del(`/users/${user1._id}/ver/0`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await del(`/users/${user1._id}/ver/0`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await del(`/users/${user1._id}/ver/${user1.ver + 1}`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  res = await del(`/users/${user1._id}/ver/${user1.ver}`, sid)
  expect(res.json).toEqual({})
})

test('GET /groups', async () => {
  let { top, admin, manager } = await getTestPrimeObjects()

  let res = await get('/groups', null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await get('/groups', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await get('/groups', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await get('/groups', sid)
  expect(res.json).toHaveLength(3)
  expect(res.json[0]._id).toEqual(admin._id)
  expect(res.json[1]._id).toEqual(manager._id)
  expect(res.json[2]._id).toEqual(top._id)
})

test('GET /groups/:gid', async () => {
  let { top } = await getTestPrimeObjects()

  let res = await get('/groups/dummy', null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await get(`/groups/${shortid.generate()}`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'gid', req: 'reference' } ]})

  res = await get(`/groups/${top._id}`, sid)
  expect(res.json).toEqual(top)
})

test('PUT /groups/:gid/ver/:ver', async () => {
  await getTestPrimeObjects()
  let group4 = await api.groups.validate({ name: 'Group 4'})
  await api.groups.save(group4)

  let res = await put(`/groups/${group4._id}/ver/0`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await put(`/groups/${group4._id}/ver/0`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await put(`/groups/${group4._id}/ver/0`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await put(`/groups/${group4._id}/ver/${group4.ver + 1}`, sid, group4)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  group4.name = 'Admin'
  res = await put(`/groups/${group4._id}/ver/${group4.ver}`, sid, group4)
  expect(res.json).toEqual({ errors: [ { path: 'name', req: 'unique' } ]})

  group4.name = 'Group 5'
  res = await put(`/groups/${group4._id}/ver/${group4.ver}`, sid, group4)
  ++ group4.ver
  group4.modifiedAt = new Date(res.json.modifiedAt)
  expect(res.json).toEqual(normalize(group4))
})

test('DELETE /groups/:gid/ver/:ver', async () => {
  await getTestPrimeObjects()
  let group4 = await api.groups.validate({ name: 'Group 4'})
  await api.groups.save(group4)

  let res = await del(`/groups/${group4._id}/ver/0`, null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await del(`/groups/${group4._id}/ver/0`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await del(`/groups/${group4._id}/ver/0`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await del(`/groups/${group4._id}/ver/${group4.ver + 1}`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  res = await del(`/groups/${group4._id}/ver/${group4.ver}`, sid)
  expect(res.json).toEqual({})
})

test('POST /groups/:gid/users', async () => {
  let { manager } = await getTestPrimeObjects()

  let res = await post(`/groups/${manager._id}/users`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await post(`/groups/${manager._id}/users`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await post(`/groups/${manager._id}/users`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await post(`/groups/${shortid.generate()}/users`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'gid', req: 'reference' } ]})

  res = await post(`/groups/${manager._id}/users`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'name', req: 'required' } ]})

  res = await post(`/groups/${manager._id}/users`, sid, { name: 'User 5' })
  let user5 = await api.users.findOne({ name: 'User 5' })
  expect(res.json).toEqual(normalize(user5))
  manager = await api.groups.findOne({ _id: manager._id })
  expect(manager.uids).toContain(user5._id)
})

test('GET /groups/:gid/users', async () => {
  let { manager } = await getTestPrimeObjects()
  await loginAsManager()

  let res = await get(`/groups/${manager._id}/users`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await get(`/groups/${shortid.generate()}/users`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'gid', req: 'reference' } ]})

  res = await get(`/groups/${manager._id}/users`, sid)
  expect(res.json).toHaveLength(2)
  expect(res.json[0].name).toEqual('User 1')
  expect(res.json[1].name).toEqual('User 3')
})

test('POST /groups/:gid/groups', async () => {
  let { top } = await getTestPrimeObjects()

  let res = await post(`/groups/${top._id}/groups`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await post(`/groups/${top._id}/groups`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsAdmin()
  res = await post(`/groups/${top._id}/groups`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager' } ]})

  sid = await loginAsManager()
  res = await post(`/groups/${shortid.generate()}/groups`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'gid', req: 'reference' } ]})

  res = await post(`/groups/${top._id}/groups`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'name', req: 'required' } ]})

  res = await post(`/groups/${top._id}/groups`, sid, { name: 'Group 5' })
  let group5 = await api.groups.findOne({ name: 'Group 5' })
  expect(res.json).toEqual(normalize(group5))
  top = await api.groups.findOne({ _id: top._id })
  expect(top.gids).toContain(group5._id)
})

test('GET /groups/:gid/groups', async () => {
  let { top } = await getTestPrimeObjects()
  await loginAsManager()

  let res = await get(`/groups/${top._id}/groups`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsUser4()
  res = await get(`/groups/${shortid.generate()}/groups`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'gid', req: 'reference' } ]})

  res = await get(`/groups/${top._id}/groups`, sid)
  expect(res.json).toHaveLength(2)
  expect(res.json[0].name).toEqual('Admin')
  expect(res.json[1].name).toEqual('Manager')
})

test('POST /users/:uid/creds/:provider', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await post(`/users/${user1._id}/creds/password`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await post(`/users/${user1._id}/creds/password`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager|uid' } ]})

  sid = await loginAsUser4()
  let user4 = await api.users.findOne({ name: 'User 4' })
  let cred4 = await api.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await post(`/users/${cred4.uid}/creds/password`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'provider', req: 'unique' } ]})

  sid = await loginAsManager()
  res = await post(`/users/${shortid.generate()}/creds/password`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'uid', req: 'reference' } ]})

  let user5 = await api.users.validate({ name: 'User 5' })
  await api.users.save(user5)
  let cred5 = await api.creds.validate({
    uid: user5._id,
    provider: 'password',
    authId: 'user5id',
    password: 'user5pass',
  })
  cred5.authId = ''
  res = await post(`/users/${user5._id}/creds/password`, sid, cred5)
  expect(res.json).toEqual({ errors: [ { path: 'authId', req: 'required' } ]})

  cred5.authId = 'user5id'
  res = await post(`/users/${user5._id}/creds/password`, sid, cred5)
  cred5.password = ''
  expect(res.json).toEqual(normalize(cred5))
})

test('GET /users/:uid/creds/', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await get(`/users/${user1._id}/creds`, null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await get(`/users/${user1._id}/creds`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager|uid' } ]})

  sid = await loginAsUser4()
  let user4 = await api.users.findOne({ name: 'User 4' })
  let cred4 = await api.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await get(`/users/${cred4.uid}/creds`, sid)
  cred4.password = ''
  expect(res.json).toHaveLength(1)
  expect(res.json[0]).toEqual(normalize(cred4))

  sid = await loginAsManager()
  res = await get(`/users/${cred4.uid}/creds`, sid)
  expect(res.json).toHaveLength(1)
  expect(res.json[0]).toEqual(normalize(cred4))

  res = await get(`/users/${shortid.generate()}/creds`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'uid', req: 'reference' } ]})
})

test('PUT /users/:uid/creds/:provider/ver/:ver', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await put(`/users/${user1._id}/creds/password/ver/0`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await put(`/users/${user1._id}/creds/password/ver/0`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager|uid' } ]})

  sid = await loginAsUser4()
  let user4 = await api.users.findOne({ name: 'User 4' })
  let cred4 = await api.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await put(`/users/${cred4.uid}/creds/password/ver/${cred4.ver}`, sid, cred4)
  ++ cred4.ver
  cred4.modifiedAt = new Date(res.json.modifiedAt)
  let password = cred4.password
  cred4.password = ''
  expect(res.json).toEqual(normalize(cred4))
  cred4.password = password

  sid = await loginAsManager()
  res = await put(`/users/${cred4.uid}/creds/password/ver/${cred4.ver + 1}`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  res = await put(`/users/${shortid.generate()}/creds/password/ver/${cred4.ver}`, sid, cred4)
  expect(res.json).toEqual({ errors: [
    { path: 'uid', req: 'reference' },
    { path: 'authId', req: 'unique' },
  ]})

  res = await put(`/users/${cred4.uid}/creds/password/ver/${cred4.ver}`, sid, cred4)
  ++ cred4.ver
  cred4.modifiedAt = new Date(res.json.modifiedAt)
  password = cred4.password
  cred4.password = ''
  expect(res.json).toEqual(normalize(cred4))
  cred4.password = password
})

test('DELETE /users/:uid/creds/:provider/ver/:ver', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await del(`/users/${user1._id}/creds/password/ver/0`, null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await del(`/users/${user1._id}/creds/password/ver/0`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'manager|uid' } ]})

  sid = await loginAsUser4()
  let user4 = await api.users.findOne({ name: 'User 4' })
  let cred4 = await api.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await del(`/users/${cred4.uid}/creds/password/ver/${cred4.ver + 1}`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  sid = await loginAsManager()
  res = await del(`/users/${cred4.uid}/creds/password/ver/${cred4.ver}`, sid)
  expect(res.json).toEqual({})
})

async function getTestPrimeObjects() {
  await client({
    method: 'POST',
    path: `http://localhost:${conf.port}${conf.prefix}/setup`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    entity: [
      'top=Top',
      'admin=Admin',
      'manager=Manager',
      'name=User+1',
      'authId=user1id',
      'password=user1pass',
      'confirm=user1pass',
    ].join('&'),
  })

  let top = normalize(await api.groups.findOne({ name: 'Top' }))
  let admin = normalize(await api.groups.findOne({ name: 'Admin' }))
  let manager = normalize(await api.groups.findOne({ name: 'Manager' }))
  let user1 = normalize(await api.users.findOne({ name: 'User 1' }))
  let cred1 = normalize(await api.creds.findOne({
    uid: user1._id,
    provider: 'password',
  }))
  let prim = api.prim
  return { prim, top, admin, manager, user1, cred1 }
}

const post = (path, sid, obj) => request('POST', path, sid, obj)
const get  = (path, sid)      => request('GET', path, sid)
const put  = (path, sid, obj) => request('PUT', path, sid, obj)
const del  = (path, sid)      => request('DELETE', path, sid)

async function request(method, path, sid, obj) {
  let headers = obj ? { 'Content-Type': 'application/json' } : {}
  if (sid) {
    headers['Cookie'] = `SID=${sid.SID}; SID.sig=${sid['httponly,SID.sig']}`
  }
  let req = {
    method,
    path: `http://localhost:${conf.port}${conf.prefix}${path}`,
    headers,
  }
  if (obj) { req.entity = JSON.stringify(obj) }
  let res = await client(req)
  if (res.headers['Content-Type'] && res.headers['Content-Type'].match('application/json')) {
    res.json = JSON.parse(res.entity)
  }
  let cookies = res.headers['Set-Cookie']
  if (cookies && cookies.length) { res.cookies = cookies.map(c => cookie.parse(c)) }
  return res
}

async function loginAsAdmin() {
  const user2 = await api.users.validate({ name: 'User 2' })
  await api.users.save(user2)
  const admin = await api.groups.findOne({ name: 'Admin' })
  admin.uids.push(user2._id.toString())
  ++ admin.ver
  await api.groups.findOneAndUpdate({ name: 'Admin' }, admin)
  const cred2 = await api.creds.validate({
    uid: user2._id.toString(),
    provider: 'password',
    authId: 'user2id',
    password: api.digestPassword(user2._id.toString(), 'user2pass')
  })
  await api.creds.save(cred2)
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user2id',
    password: 'user2pass',
  })
  return res.cookies[0]
}

async function loginAsManager() {
  const user3 = await api.users.validate({ name: 'User 3' })
  await api.users.save(user3)
  const manager = await api.groups.findOne({ name: 'Manager' })
  manager.uids.push(user3._id.toString())
  ++ manager.ver
  await api.groups.findOneAndUpdate({ name: 'Manager' }, manager)
  const cred3 = await api.creds.validate({
    uid: user3._id.toString(),
    provider: 'password',
    authId: 'user3id',
    password: api.digestPassword(user3._id.toString(), 'user3pass')
  })
  await api.creds.save(cred3)
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user3id',
    password: 'user3pass',
  })
  return res.cookies[0]
}

async function loginAsUser4() {
  const user4 = await api.users.validate({ name: 'User 4' })
  await api.users.save(user4)
  let cred4 = await api.creds.validate({
    uid: user4._id.toString(),
    provider: 'password',
    authId: 'user4id',
    password: api.digestPassword(user4._id.toString(), 'user4pass')
  })
  await api.creds.save(cred4)
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user4id',
    password: 'user4pass',
  })
  return res.cookies[0]
}

function normalize(v)  { return JSON.parse(JSON.stringify(v)) }
