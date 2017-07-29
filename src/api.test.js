'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import rp from 'request-promise'
const client = rp.defaults({
  resolveWithFullResponse: true,
  simple: false,
})
import cookie from 'cookie'

import { digestPassword } from './helper'
import { api, st } from './api.js'
import setup from './setup'

const conf = {
  mongoUri: 'mongodb://127.0.0.1:27017/tamuro_api',
  prefix: '/api',
  port: '3001',
  appKey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  seed: '01234567890123456789012345678901234567890123456789',
  expires: 10 * 24 * 60 * 60 * 1000,
}

let srv = {}

const DebugLog = class {
  write(rec) {
    console.info(rec)
  }
}

beforeAll(async () => {
  srv = await api(conf)
  st.log.addStream({
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
  await srv.http.close()
  await cleanupDb()
  await srv.db.close()
})

async function cleanupDb() {
  await st.users.remove({})
  await st.groups.remove({})
  await st.prims.remove({})
  await st.creds.remove({})
  await st.sessions.remove({})
  await st.logs.remove({})
  st.prim = null
}

test('setup.setupHtml', () => {
  let html = setup.setupHtml()
  expect(html.match('action=""')).toBeTruthy()
  expect(html.match('name="top" value=""')).toBeTruthy()
  expect(html.match('name="admin" value=""')).toBeTruthy()
  expect(html.match('name="manager" value=""')).toBeTruthy()
  expect(html.match('name="name" value=""')).toBeTruthy()
  expect(html.match('name="authId" value=""')).toBeTruthy()
  html = setup.setupHtml('/', '', {
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

test('GET /setup', async () => {
  let res = await client({
    method: 'GET',
    uri: `http://localhost:${conf.port}${conf.prefix}/setup`,
  })
  expect(res.statusCode).toEqual(200)
  expect(res.body).toEqual(setup.setupHtml(
    `${conf.prefix}/setup`, '',
    {
      top: '',
      admin: '',
      manager: '',
      name: '',
      authId: '',
    }
  ))
  st.prim = {}
  res = await client({
    method: 'GET',
    uri: `http://localhost:${conf.port}${conf.prefix}/setup`,
  })
  expect(res.statusCode).toEqual(200)
  expect(res.body).toEqual(setup.completeHtml())
})

test('POST /setup', async () => {
  let logCount = await st.logs.count({})
  let res = await client({
    method: 'POST',
    uri: `http://localhost:${conf.port}${conf.prefix}/setup`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: [
      'confirm=dummy',
    ].join('&'),
  })
  expect(res.statusCode).toEqual(200)
  expect(res.body.match('Required: Title')).not.toBeNull()
  expect(res.body.match('Required: Admin')).not.toBeNull()
  expect(res.body.match('Required: Manager')).not.toBeNull()
  expect(res.body.match('Required: Your name')).not.toBeNull()
  expect(res.body.match('Required: Your ID')).not.toBeNull()
  expect(res.body.match('Required: Your password')).not.toBeNull()
  expect(res.body.match('Required: Type')).not.toBeNull()

  res = await client({
    method: 'POST',
    uri: `http://localhost:${conf.port}${conf.prefix}/setup`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: [
      'top=Top',
      'admin=Admin',
      'manager=Manager',
      'name=User+1',
      'authId=user1auth',
      'password=user1pass',
      'confirm=user1pass',
    ].join('&'),
  })
  expect(res.statusCode).toEqual(302)
  expect(await st.users.count({})).toEqual(1)
  expect(await st.creds.count({})).toEqual(1)
  expect(await st.groups.count({})).toEqual(3)
  expect(await st.prims.count({})).toEqual(1)
  let user = await st.users.findOne({ name: 'User 1' })
  let cred = await st.creds.findOne({ authId: 'user1auth' })
  expect(cred.password).toEqual(digestPassword(user._id.toString(), 'user1pass', conf.seed))
  
  res = await client({
    method: 'POST',
    uri: `http://localhost:${conf.port}${conf.prefix}/setup`,
    body: '{}',
  })
  expect(res.statusCode).toEqual(404)
  expect((await st.logs.count({})) - logCount).toEqual(2)
})

test('POST /sessions', async () => {
  // before setup
  let res = await get('/', null)
  expect(res.json).toEqual({})

  // setup
  let { top, admin, manager, user1 } = await getTestPrimeObjects()

  // before sign in
  res = await get('/', null)
  expect(res.json).toEqual({ name: 'Top' })

  res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user1id',
    password: 'user1pass',
  })
  let sid = res.cookies[0]
  expect(sid.SID).not.toBeNull()
  expect(sid['httponly,SID.sig']).not.toBeNull()
  expect(res.json).toEqual(top)
  let sess = await st.sessions.findOne({ _id: sid.SID })
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
  await st.creds.save(cred2)
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
  let user4 = await st.users.findOne({ name: 'User 4' })
  res = await get('/sessions', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'admin' } ]})

  sid = await loginAsManager()
  let user3 = await st.users.findOne({ name: 'User 3' })
  res = await get('/sessions', sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'admin' } ]})

  sid = await loginAsAdmin()
  let user2 = await st.users.findOne({ name: 'User 2' })
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
  expect(await st.sessions.count({})).toEqual(1)

  res = await del('/sessions', sid)
  expect(res.json).toEqual({ name: top.name })

  // after sign out
  res = await get('/', sid)
  expect(res.json).toEqual({ name: top.name })
  expect(await st.sessions.count({})).toEqual(0)
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
  expect(await st.sessions.count({})).toEqual(1)

  let sess = await st.sessions.findOne({ uid: user1._id })
  sess.createdAt = new Date(new Date(sess.createdAt).getTime() - conf.expires)
  await st.sessions.findOneAndUpdate({ uid: user1._id }, sess)

  // after session timeout
  res = await get('/', sid)
  expect(res.json).toEqual({ name: top.name })
  expect(await st.sessions.count({})).toEqual(0)
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
  let user1 = await st.users.findOne({ name: 'User 1' })
  let user2 = await st.users.findOne({ name: 'User 2' })
  let user3 = await st.users.findOne({ name: 'User 3' })
  let user4 = await st.users.findOne({ name: 'User 4' })
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
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'managerOrSelf' } ]})

  let user4 = await st.users.findOne({ name: 'User 4' })
  user4.profiles = [{ test: 'Test1'}]
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
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'managerOrSelf' } ]})

  sid = await loginAsManager()
  user4.profiles = [{ test: 'Test2'}]
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
  let group4 = await st.groups.validate({ name: 'Group 4'})
  await st.groups.save(group4)

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
  let group4 = await st.groups.validate({ name: 'Group 4'})
  await st.groups.save(group4)

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
  let user5 = await st.users.findOne({ name: 'User 5' })
  expect(res.json).toEqual(normalize(user5))
  manager = await st.groups.findOne({ _id: manager._id })
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
  let group5 = await st.groups.findOne({ name: 'Group 5' })
  expect(res.json).toEqual(normalize(group5))
  top = await st.groups.findOne({ _id: top._id })
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

test('POST /users/:uid/provider/:provider', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await post(`/users/${user1._id}/provider/password`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await post(`/users/${user1._id}/provider/password`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'managerOrSelf' } ]})

  sid = await loginAsUser4()
  let user4 = await st.users.findOne({ name: 'User 4' })
  let cred4 = await st.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await post(`/users/${cred4.uid}/provider/password`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'provider', req: 'unique' } ]})

  sid = await loginAsManager()
  res = await post(`/users/${shortid.generate()}/provider/password`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'uid', req: 'reference' } ]})

  let user5 = await st.users.validate({ name: 'User 5' })
  await st.users.save(user5)
  let cred5 = await st.creds.validate({
    uid: user5._id,
    provider: 'password',
    authId: 'user5id',
    password: 'user5pass',
  })
  cred5.authId = ''
  res = await post(`/users/${user5._id}/provider/password`, sid, cred5)
  expect(res.json).toEqual({ errors: [ { path: 'authId', req: 'required' } ]})

  cred5.authId = 'user5id'
  res = await post(`/users/${user5._id}/provider/password`, sid, cred5)
  cred5.password = ''
  expect(res.json).toEqual(normalize(cred5))
})

test('GET /users/:uid/provider/', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await get(`/users/${user1._id}/creds`, null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await get(`/users/${user1._id}/creds`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'managerOrSelf' } ]})

  sid = await loginAsUser4()
  let user4 = await st.users.findOne({ name: 'User 4' })
  let cred4 = await st.creds.findOne({ uid: user4._id, provider: 'password' })
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

test('PUT /users/:uid/provider/:provider/ver/:ver', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await put(`/users/${user1._id}/provider/password/ver/0`, null, {})
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await put(`/users/${user1._id}/provider/password/ver/0`, sid, {})
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'managerOrSelf' } ]})

  sid = await loginAsUser4()
  let user4 = await st.users.findOne({ name: 'User 4' })
  let cred4 = await st.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await put(`/users/${cred4.uid}/provider/password/ver/${cred4.ver}`, sid, cred4)
  ++ cred4.ver
  cred4.modifiedAt = new Date(res.json.modifiedAt)
  let password = cred4.password
  cred4.password = ''
  expect(res.json).toEqual(normalize(cred4))
  cred4.password = password

  sid = await loginAsManager()
  res = await put(`/users/${cred4.uid}/provider/password/ver/${cred4.ver + 1}`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  res = await put(`/users/${shortid.generate()}/provider/password/ver/${cred4.ver}`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'uid', req: 'reference' } ]})

  let authId = cred4.authId
  cred4.authId = 'user1id'
  res = await put(`/users/${cred4.uid}/provider/password/ver/${cred4.ver}`, sid, cred4)
  expect(res.json).toEqual({ errors: [ { path: 'authId', req: 'unique' } ]})
  cred4.authId = authId

  res = await put(`/users/${cred4.uid}/provider/password/ver/${cred4.ver}`, sid, cred4)
  ++ cred4.ver
  cred4.modifiedAt = new Date(res.json.modifiedAt)
  password = cred4.password
  cred4.password = ''
  expect(res.json).toEqual(normalize(cred4))
  cred4.password = password
})

test('DELETE /users/:uid/provider/:provider/ver/:ver', async () => {
  let { user1 } = await getTestPrimeObjects()

  let res = await del(`/users/${user1._id}/provider/password/ver/0`, null)
  expect(res.json).toEqual({ errors: [ { path: '', req: 'signin' } ]})

  let sid = await loginAsAdmin()
  res = await del(`/users/${user1._id}/provider/password/ver/0`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'priv', req: 'managerOrSelf' } ]})

  sid = await loginAsUser4()
  let user4 = await st.users.findOne({ name: 'User 4' })
  let cred4 = await st.creds.findOne({ uid: user4._id, provider: 'password' })
  res = await del(`/users/${cred4.uid}/provider/password/ver/${cred4.ver + 1}`, sid)
  expect(res.json).toEqual({ errors: [ { path: 'ver', req: 'latest' } ]})

  sid = await loginAsManager()
  res = await del(`/users/${cred4.uid}/provider/password/ver/${cred4.ver}`, sid)
  expect(res.json).toEqual({})
})

async function getTestPrimeObjects() {
  await client({
    method: 'POST',
    uri: `http://localhost:${conf.port}${conf.prefix}/setup`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: [
      'top=Top',
      'admin=Admin',
      'manager=Manager',
      'name=User+1',
      'authId=user1id',
      'password=user1pass',
      'confirm=user1pass',
    ].join('&'),
  })

  let top = normalize(await st.groups.findOne({ name: 'Top' }))
  let admin = normalize(await st.groups.findOne({ name: 'Admin' }))
  let manager = normalize(await st.groups.findOne({ name: 'Manager' }))
  let user1 = normalize(await st.users.findOne({ name: 'User 1' }))
  let cred1 = normalize(await st.creds.findOne({
    uid: user1._id,
    provider: 'password',
  }))
  let prim = st.prim
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
    uri: `http://localhost:${conf.port}${conf.prefix}${path}`,
    headers,
  }
  if (obj) { req.body = JSON.stringify(obj) }
  let res = await client(req)
  if (res.headers['content-type'] && res.headers['content-type'].match('application/json')) {
    res.json = JSON.parse(res.body)
  }
  let cookies = res.headers['set-cookie']
  if (cookies && cookies.length) { res.cookies = cookies.map(c => cookie.parse(c)) }
  return res
}

async function loginAsAdmin() {
  const user2 = await st.users.validate({ name: 'User 2' })
  await st.users.save(user2)
  const admin = await st.groups.findOne({ name: 'Admin' })
  admin.uids.push(user2._id.toString())
  ++ admin.ver
  await st.groups.findOneAndUpdate({ name: 'Admin' }, admin)
  const cred2 = await st.creds.validate({
    uid: user2._id.toString(),
    provider: 'password',
    authId: 'user2id',
    password: digestPassword(user2._id.toString(), 'user2pass', conf.seed)
  })
  await st.creds.save(cred2)
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user2id',
    password: 'user2pass',
  })
  return res.cookies[0]
}

async function loginAsManager() {
  const user3 = await st.users.validate({ name: 'User 3' })
  await st.users.save(user3)
  const manager = await st.groups.findOne({ name: 'Manager' })
  manager.uids.push(user3._id.toString())
  ++ manager.ver
  await st.groups.findOneAndUpdate({ name: 'Manager' }, manager)
  const cred3 = await st.creds.validate({
    uid: user3._id.toString(),
    provider: 'password',
    authId: 'user3id',
    password: digestPassword(user3._id.toString(), 'user3pass', conf.seed)
  })
  await st.creds.save(cred3)
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user3id',
    password: 'user3pass',
  })
  return res.cookies[0]
}

async function loginAsUser4() {
  const user4 = await st.users.validate({ name: 'User 4' })
  await st.users.save(user4)
  let cred4 = await st.creds.validate({
    uid: user4._id.toString(),
    provider: 'password',
    authId: 'user4id',
    password: digestPassword(user4._id.toString(), 'user4pass', conf.seed)
  })
  await st.creds.save(cred4)
  let res = await post('/sessions', null, {
    provider: 'password',
    authId: 'user4id',
    password: 'user4pass',
  })
  return res.cookies[0]
}

function normalize(v)  { return JSON.parse(JSON.stringify(v)) }
