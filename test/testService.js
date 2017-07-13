'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const crypto = require('crypto')
const chai = require('chai')
const expect = chai.expect
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const { log, mongoose, User, Group, Prim, Cred, Session, Log } = require('../lib/model')

const DebugLog = class {
  write(rec) {
    let obj = JSON.parse(rec)
    console.warn(`${obj.time}:${obj.level}:${obj.msg}${obj.attr ? JSON.stringify(obj.attr) : ''}`)
  }
}

log.addStream({
  name: 'test',
  stream: new DebugLog(),
  level: 'debug'
})

const conf = require('../conf.sample.js')
const Service = require('../lib/service')
const srv = new Service.default(conf)

const api = `http://localhost:${conf.port}${conf.prefix}`

describe('Service', function() {
  before(() => {
    return srv.init()
  })
  beforeEach(() => {
    srv.prim = null
    return mongoose.connection.db.dropDatabase()
  })
  afterEach(() => null)
  after(async () => {
    await mongoose.disconnect()
  })
  describe('#init()', () => {
    it('should connect mongoose ODM.', async () => {
      expect(await User.count({})).to.equal(0)
      expect(await Group.count({})).to.equal(0)
      expect(await Prim.count({})).to.equal(0)
      expect(await Cred.count({})).to.equal(0)
      expect(await Session.count({})).to.equal(0)
      expect(await Log.count({})).to.equal(0)
    })
    it('should start the http server.', async () => {
      let res = await chai.request(api).get('/')
      expect(res).to.have.status(200)
      expect(JSON.parse(res.text)).to.deep.equal({})
    })
  })
  describe('#appendNestedErrors()', () => {
    it('should append errors of nested nodes.', () => {
      expect(srv.appendNestedErrors([], [], 'top')).to.have.deep.members([])
      expect(srv.appendNestedErrors([
        { path: 'name', error: 'required' },
        { path: 'gids', error: 'array' },
      ], [], 'top')).to.have.deep.members([
        { path: 'name', error: 'required' },
        { path: 'gids', error: 'array' },
      ])
      expect(srv.appendNestedErrors([
        { path: 'name', error: 'required' },
        { path: 'gids', error: 'array' },
      ], null, 'top')).to.have.deep.members([
        { path: 'name', error: 'required' },
        { path: 'gids', error: 'array' },
      ])
      expect(srv.appendNestedErrors([
        { path: 'name', error: 'required' },
        { path: 'gids', error: 'array' },
      ], [
        { path: 'name', error: 'string' },
        { path: 'uids', error: 'array' },
      ], 'top')).to.have.deep.members([
        { path: 'name', error: 'required' },
        { path: 'gids', error: 'array' },
        { path: 'top.name', error: 'string' },
        { path: 'top.uids', error: 'array' },
      ])
      expect(srv.appendNestedErrors(null, [
        { path: 'name', error: 'string' },
        { path: 'uids', error: 'array' },
      ], 'top')).to.have.deep.members([
        { path: 'top.name', error: 'string' },
        { path: 'top.uids', error: 'array' },
      ])
    })
  })
  describe('POST /', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).post('/').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('GET /', () => {
    it('should return empty object if no data.', async () => {
      let res = await chai.request(api).get('/')
      expect(JSON.parse(res.text)).to.deep.equal({})
    })
    it('should return top group name only if no session after setup.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/')
      expect(JSON.parse(res.text)).to.deep.equal({ name: 'Top' })
    })
    it('should return top group name only if session expired.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      let list = await Session.find({}).exec()
      list.map(async sess => {
        sess.createdAt = new Date(sess.createdAt.getTime() - srv.conf.expires - 1)
        await sess.save()
      })
      let res = await agent.get('/')
      expect(JSON.parse(res.text)).to.deep.equal({ name: 'Top' })
    })
    it('should return top group object if has session after setup.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      let res = await agent.get('/')
      expect(JSON.parse(res.text)).to.have.keys(['_id', 'ver', 'name', 'gids', 'uids'])
    })
  })
  describe('PUT /', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).put('/').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('DELETE /', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).del('/').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('#setup()', () => {
    it('should create primary gids, a user and a credential.', async () => {
      let setup = getSetupData()
      await srv.setup(setup)
      expect(await User.count({})).to.equal(1)
      expect(await Group.count({})).to.equal(3)
      expect(await Prim.count({})).to.equal(1)
      expect(await Cred.count({})).to.equal(1)
    })
    it('should not create primary gids, a user and a credential if error.', async () => {
      let setup = getSetupData()
      setup.top.name = ''
      let ret = await srv.setup(setup)
      expect(ret).to.deep.equal({
        errors: [{ path: 'top.name', error: 'required' }]
      })
      setup = getSetupData()
      setup.admin.name = ''
      ret = await srv.setup(setup)
      expect(ret).to.deep.equal({
        errors: [{ path: 'admin.name', error: 'required' }]
      })
      setup = getSetupData()
      setup.manager.name = ''
      ret = await srv.setup(setup)
      expect(ret).to.deep.equal({
        errors: [{ path: 'manager.name', error: 'required' }]
      })
      setup = getSetupData()
      setup.user.name = ''
      ret = await srv.setup(setup)
      expect(ret).to.deep.equal({
        errors: [{ path: 'user.name', error: 'required' }]
      })
      setup = getSetupData()
      setup.cred.provider = ''
      ret = await srv.setup(setup)
      expect(ret).to.deep.equal({
        errors: [{ path: 'cred.provider', error: 'required' }]
      })
      setup = getSetupData()
      setup.cred.attr.password = null
      ret = await srv.setup(setup)
      expect(ret).to.deep.equal({
        errors: [{ path: 'cred.attr.password', error: 'required' }]
      })
      expect(await User.count({})).to.equal(0)
      expect(await Group.count({})).to.equal(0)
      expect(await Prim.count({})).to.equal(0)
      expect(await Cred.count({})).to.equal(0)
    })
  })
  describe('POST /setup', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).post('/setup').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('GET /setup', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).get('/setup').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('PUT /setup', () => {
    it('should create primary gids, a user and a credential.', async () => {
      let setup = getSetupData()
      let res = await chai.request(api).put('/setup').type('json').send(setup)
      expect(res).to.have.status(200)
      let top = JSON.parse(res.text)
      expect(top).to.deep.equal({ name: setup.top.name })
      top = JSON.parse((await chai.request(api).get('/')).text)
      expect(top).to.deep.equal({ name: setup.top.name })
    })
    it('should not create primary gids, a user and a credential if error.', async () => {
      let setup = getSetupData()
      setup.top.name = ''
      let res = await chai.request(api).put('/setup').type('json').send(setup)
      expect(res).to.have.status(200)
      let top = JSON.parse(res.text)
      expect(top).to.deep.equal({
        errors: [ { path: 'top.name', error: 'required' } ]
      })
      top = JSON.parse((await chai.request(api).get('/')).text)
      expect(top).to.deep.equal({})
    })
    it('should not create again.', async () => {
      let setup = getSetupData()
      await chai.request(api).put('/setup').type('json').send(setup)
      let res = await chai.request(api).put('/setup').type('json').send(setup)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'prim', error: 'conflict' } ]
      })
    })
  })
  describe('DELETE /setup', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).del('/setup').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('POST /sessions', () => {
    it('should save session for valid sign in request.', async () => {
      let setup = getSetupData()
      await chai.request(api).put('/setup').type('json').send(setup)
      let manager = await Group.findById(srv.prim.manager)
      const agent1 = chai.request.agent(api)

      // before sign in
      let res = await agent1.get('/')
      expect(JSON.parse(res.text)).to.deep.equal({ name: 'Top' })

      res = await agent1.post('/sessions').type('json').send({
        provider: 'password',
        authId: 'user1id',
        password: 'user1pass',
      })
      expect(JSON.parse(res.text)._id).to.equal(srv.prim.top)
      await new Promise(resolve => setTimeout(resolve, 100))
      let sess = await Session.findOne({})
      expect(sess.uid).to.equal(manager.uids[0])
      expect(sess.provider).to.equal('password')
      expect(sess.gids).to.have.members(
        [srv.prim.top, srv.prim.admin, srv.prim.manager]
      )
      expect(sess.admin).is.true
      expect(sess.manager).is.true

      // after sign in
      res = await agent1.get('/')
      expect(JSON.parse(res.text)._id).to.equal(srv.prim.top)
    })
    it('should not save a session for invalid sign in request.', async () => {
      let setup = getSetupData()
      await chai.request(api).put('/setup').type('json').send(setup)
      let manager = await Group.findById(srv.prim.manager)
      const agent1 = chai.request.agent(api)
      let res = await agent1.post('/sessions').type('json').send({
        provider: 'password',
        authId: 'dummy',
        password: 'user1pass',
      })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'auth' } ]
      })
      res = await agent1.post('/sessions').type('json').send({
        provider: 'password',
        authId: 'user1id',
        password: 'dummy',
      })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'auth' } ]
      })
      let cred4 = await new Cred({
        uid: manager.uids[0],
        provider: 'test',
        authId: 'user1id',
      })
      cred4.save()
      res = await agent1.post('/sessions').type('json').send({
        provider: 'test',
        authId: 'user1id',
      })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'auth' } ]
      })
      expect(await Session.count({})).to.equal(0)
    })
  })
  describe('GET /sessions', () => {
    it('should return sessions for a admin.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsAdmin()
      let res = await agent.get('/sessions')
      let list = JSON.parse(res.text)
      expect(list).to.have.length(1)
      expect(list[0].admin).is.true
      await loginAsUser4()
      res = await agent.get('/sessions')
      list = JSON.parse(res.text)
      expect(list).to.have.length(2)
      expect(list[0].admin).is.false
      expect(list[1].admin).is.true
    })
    it('should reject except admins.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/sessions')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.get('/sessions')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'admin', error: 'priv' } ]
      })
      agent = await loginAsManager()
      res = await agent.get('/sessions')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'admin', error: 'priv' } ]
      })
    })
  })
  describe('PUT /sessions', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).put('/sessions').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('DELETE /sessions', () => {
    it('should remove the session.', async () => {
      let setup = getSetupData()
      await chai.request(api).put('/setup').type('json').send(setup)
      let manager = await Group.findById(srv.prim.manager)
      const agent1 = chai.request.agent(api)
      let res = await agent1.post('/sessions').type('json').send({
        provider: 'password',
        authId: 'user1id',
        password: 'user1pass',
      })

      // before sign out
      res = await agent1.get('/')
      expect(JSON.parse(res.text)._id).to.equal(srv.prim.top)

      let sess = await Session.findOne({})
      expect(await Session.count({})).to.equal(1)
      expect(sess.uid).to.equal(manager.uids[0])

      res = await agent1.del('/sessions').type('json').send({})
      let top = await Group.findById(srv.prim.top)
      expect(JSON.parse(res.text)).to.deep.equal({ name: top.name })

      // after sign out
      res = await agent1.get('/')
      expect(JSON.parse(res.text)).to.deep.equal({ name: 'Top' })

      expect(await Session.count({})).to.equal(0)

      res = await agent1.del('/sessions').type('json').send({})
      expect(JSON.parse(res.text)).to.deep.equal({ name: top.name })
    })
  })
  describe('POST /users', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).post('/users').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('GET /users', () => {
    it('should return user list for a manager.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsManager()
      let res = await agent.get('/users')
      let list = JSON.parse(res.text)
      expect(list).to.have.length(2)
      expect(list[0].name).to.equals('User 1')
      expect(list[1].name).to.equals('User 3')
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.get('/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.get('/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
  })
  describe('GET /users/:uid', () => {
    it('should return a user for a member.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      let user4 = await User.findOne({ name: 'User 4' }).exec()
      let res = await agent.get(`/users/${user4._id.toString()}`)
      expect(JSON.parse(res.text)._id).to.equal(user4._id.toString())
    })
    it('should reject except members.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/users/id')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
    })
  })
  describe('PUT /users/:uid', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).put('/users/id').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('PUT /users/:uid/ver/:ver', () => {
    it('should update a user for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsUser4()
      let user4 = await User.findOne({ name: 'User 4' })
      const agent = await loginAsManager()
      let res = await agent.put(`/users/${user4._id.toString()}/ver/${user4.ver}`)
        .type('json').send({
          _id: user4._id.toString(),
          ver: user4.ver,
          name: user4.name,
          profile: { tel: '01-2345-6789' }
        })
      res = JSON.parse(res.text)
      expect(res.ver).to.equal(user4.ver + 1)
      expect(res.profile).to.deep.equal({ tel: '01-2345-6789' })
    })
    it('should update a user for the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      let user4 = await User.findOne({ name: 'User 4' })
      let res = await agent.put(`/users/${user4._id.toString()}/ver/${user4.ver}`)
        .type('json').send({
          _id: user4._id.toString(),
          ver: user4.ver,
          name: user4.name,
          profile: { tel: '01-2345-6789' }
        })
      res = JSON.parse(res.text)
      expect(res.ver).to.equal(user4.ver + 1)
      expect(res.profile).to.deep.equal({ tel: '01-2345-6789' })
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).put('/users/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.put('/users/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.put('/users/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })
    })
  })
  describe('DEL /users/:uid', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).del('/users/id').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('DEL /users/:uid/ver/:ver', () => {
    it('should delete a user for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsUser4()
      let user4 = await User.findOne({ name: 'User 4' })
      const agent = await loginAsManager()
      let res = await agent.del(`/users/${user4._id.toString()}/ver/${user4.ver}`)
      expect(JSON.parse(res.text)).to.deep.equal({})
    })
    it('should not delete with invalid ver.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsUser4()
      let user4 = await User.findOne({ name: 'User 4' })
      const agent = await loginAsManager()
      let res = await agent.del(`/users/${user4._id.toString()}/ver/${user4.ver - 1}`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).del('/users/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.del('/users/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.del('/users/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
  })
  describe('POST /groups', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).post('/groups').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('GET /groups', () => {
    it('should return group list for a manager.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsManager()
      let res = await agent.get('/groups')
      let list = JSON.parse(res.text)
      expect(list).to.have.length(3)
      expect(list[0].name).to.equals('Admin')
      expect(list[1].name).to.equals('Manager')
      expect(list[2].name).to.equals('Top')
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.get('/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.get('/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
  })
  describe('GET /groups/:gid', () => {
    it('should return a group for a member.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      let manager = await Group.findOne({ name: 'Manager' }).exec()
      let res = await agent.get(`/groups/${manager._id.toString()}`)
      expect(JSON.parse(res.text)._id).to.equal(manager._id.toString())
    })
    it('should reject except members.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/groups/id')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
    })
  })
  describe('PUT /groups/:gid', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).put('/groups/id').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('PUT /groups/:gid/ver/:ver', () => {
    it('should update a user for a manager.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await Group.create({ name: 'Group 4' })
      let group4 = await Group.findOne({ name: 'Group 4' })
      let user1 = await User.findOne({ name: 'User 1' })
      const agent = await loginAsManager()
      let res = await agent.put(`/groups/${group4._id.toString()}/ver/${group4.ver}`)
        .type('json').send({
          _id: group4._id.toString(),
          ver: group4.ver,
          name: group4.name,
          uids: [user1._id.toString()]
        })
      res = JSON.parse(res.text)
      expect(res.ver).to.equal(group4.ver + 1)
      expect(res.uids).to.have.members([user1._id.toString()])
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).put('/groups/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.put('/groups/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.put('/groups/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
  })
  describe('DEL /groups/:gid', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).del('/groups/id').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('DEL /groups/:gid/ver/:ver', () => {
    it('should delete a user for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await Group.create({ name: 'Group 4' })
      let group4 = await Group.findOne({ name: 'Group 4' })
      const agent = await loginAsManager()
      let res = await agent.del(`/groups/${group4._id.toString()}/ver/${group4.ver}`)
      expect(JSON.parse(res.text)).to.deep.equal({})
    })
    it('should not delete with invalid ver.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await Group.create({ name: 'Group 4' })
      let group4 = await Group.findOne({ name: 'Group 4' })
      const agent = await loginAsManager()
      let res = await agent.del(`/groups/${group4._id.toString()}/ver/${group4.ver - 1}`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'ver', error: 'match' } ]
      })
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).del('/groups/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.del('/groups/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.del('/groups/id/ver/1')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
  })
  describe('POST /groups/:gid/users', () => {
    it('should create a user for a manager.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsManager()
      let res = await agent.post(`/groups/${srv.prim.manager}/users`)
        .type('json').send({
          name: 'User 4',
          profile: { tel: '01-2345-6789' }
        })
      res = JSON.parse(res.text)
      expect(res.ver).to.equal(0)
      expect(res.name).to.equal('User 4')
      expect(res.profile).to.deep.equal({ tel: '01-2345-6789' })
      let manager = await Group.findById(srv.prim.manager)
      let user1 = await User.findOne({ name: 'User 1' })
      let user3 = await User.findOne({ name: 'User 3' })
      let user4 = await User.findOne({ name: 'User 4' })
      expect(manager.uids).to.have.deep.members([
        user1._id.toString(),
        user3._id.toString(),
        user4._id.toString(),
      ])
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).post('/groups/id/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.post('/groups/id/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.post('/groups/id/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
    it('should reject invalid gid.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const group5 = await Group.create({ name: 'Group 5' })
      const gid = group5._id.toString()
      await Group.delete(group5)
      const agent = await loginAsManager()
      let res = await agent.post(`/groups/${gid}/users`)
        .type('json').send({
          name: 'User 4',
          profile: { tel: '01-2345-6789' }
        })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'gid', error: 'reference' } ]
      })
    })
  })
  describe('GET /groups/:gid/users', () => {
    it('should return user list of a group for a member.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsManager()
      const agent = await loginAsUser4()
      let manager = await Group.findOne({ name: 'Manager' }).exec()
      let res = await agent.get(`/groups/${manager._id.toString()}/users`)
      let list = JSON.parse(res.text)
      expect(list).to.have.length(2)
      expect(list[0].name).to.equal('User 1')
      expect(list[1].name).to.equal('User 3')
    })
    it('should reject except members.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/groups/id/users')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
    })
    it('should reject invalid gid.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const group5 = await Group.create({ name: 'Group 5' })
      const gid = group5._id.toString()
      await Group.delete(group5)
      const agent = await loginAsManager()
      let res = await agent.get(`/groups/${gid}/users`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'gid', error: 'reference' } ]
      })
    })
  })
  describe('PUT /groups/:gid/users', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).put('/groups/id/users').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('DELETE /groups/:gid/users', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).del('/groups/id/users').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('POST /groups/:gid/groups', () => {
    it('should create a group for a manager.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsManager()
      let res = await agent.post(`/groups/${srv.prim.top}/groups`)
        .type('json').send({
          name: 'Group 4',
        })
      res = JSON.parse(res.text)
      expect(res.ver).to.equal(0)
      expect(res.name).to.equal('Group 4')
      let top = await Group.findById(srv.prim.top)
      let group4 = await Group.findOne({ name: 'Group 4' })
      expect(top.gids).to.have.deep.members([
        srv.prim.admin,
        srv.prim.manager,
        group4._id.toString(),
      ])
    })
    it('should reject except managers.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).post('/groups/id/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
      let agent = await loginAsUser4()
      res = await agent.post('/groups/id/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
      agent = await loginAsAdmin()
      res = await agent.post('/groups/id/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager', error: 'priv' } ]
      })
    })
    it('should reject invalid gid.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const group5 = await Group.create({ name: 'Group 5' })
      const gid = group5._id.toString()
      await Group.delete(group5)
      const agent = await loginAsManager()
      let res = await agent.post(`/groups/${gid}/groups`)
        .type('json').send({
          name: 'Group 4',
        })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'gid', error: 'reference' } ]
      })
    })
  })
  describe('GET /groups/:gid/groups', () => {
    it('should return gids list of a group for a member.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      let top = await Group.findOne({ name: 'Top' }).exec()
      let res = await agent.get(`/groups/${top._id.toString()}/groups`)
      let list = JSON.parse(res.text)
      expect(list).to.have.length(2)
      expect(list[0].name).to.equal('Admin')
      expect(list[1].name).to.equal('Manager')
    })
    it('should reject except members.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let res = await chai.request(api).get('/groups/id/groups')
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })
    })
    it('should reject invalid gid.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const group5 = await Group.create({ name: 'Group 5' })
      const gid = group5._id.toString()
      await Group.delete(group5)
      const agent = await loginAsManager()
      let res = await agent.get(`/groups/${gid}/groups`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'gid', error: 'reference' } ]
      })
    })
  })
  describe('PUT /groups/:gid/groups', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).put('/groups/id/groups').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('DELETE /groups/:gid/groups', () => {
    it('should return status 404 Not Found.', async () => {
      try {
        await chai.request(api).del('/groups/id/groups').type('json').send({})
        expect.fail()
      } catch (e) {
        expect(e).to.have.status(404) // Not Found
      }
    })
  })
  describe('POST /users/:uid/creds/:provider', () => {
    it('should create a credential for a manager.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsManager()
      const user4 = await User.create({ name: 'User 4' })
      let res = await agent.post(`/users/${user4._id.toString()}/creds/password`)
        .type('json').send({
          uid: user4._id.toString(),
          provider: 'password',
          authId: 'user4id',
          attr: { password: 'user4pass' },
        })
      let cred4 = JSON.parse(res.text)
      expect(cred4.ver).to.equal(0)
      expect(cred4.authId).to.equal('user4id')
      expect(cred4.attr.password).is.null
    })
    it('should create a credential for the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsUser4()
      const user4 = await User.findOne({ name: 'User 4' })
      let res = await agent.post(`/users/${user4._id.toString()}/creds/password`)
        .type('json').send({
          uid: user4._id.toString(),
          provider: 'password',
          authId: 'user4id',
          attr: { password: 'user4pass' },
        })
      let cred4 = JSON.parse(res.text)
      expect(cred4.ver).to.equal(0)
      expect(cred4.authId).to.equal('user4id')
      expect(cred4.attr.password).is.null
    })
    it('should reject except managers and the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const user1 = await User.findOne({ name: 'User 1' })

      let res = await chai.request(api).post(`/users/${user1._id.toString()}/creds/password`)
        .type('json').send({
          uid: user1._id.toString(),
          provider: 'password',
          authId: 'user1id',
          attr: { password: 'user1pass' },
        })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: '', error: 'signin' } ]
      })

      const agent = await loginAsUser4()
      res = await agent.post(`/users/${user1._id.toString()}/creds/password`)
        .type('json').send({
          uid: user1._id.toString(),
          provider: 'password',
          authId: 'user1id',
          attr: { password: 'user1pass' },
        })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })

      res = await (await loginAsAdmin()).post(`/users/${user1._id.toString()}/creds/password`)
        .type('json').send({
          uid: user1._id.toString(),
          provider: 'password',
          authId: 'user1id',
          attr: { password: 'user1pass' },
        })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })
    })
  })
  describe('GET /users/:uid/creds', () => {
    it('should return credential list for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let agent = await loginAsUser4()
      const user4 = await User.findOne({ name: 'User 4' })
      let res = await agent.get(`/users/${user4._id.toString()}/creds`)
      let list = JSON.parse(res.text)
      expect(list).to.have.length(1)
      expect(list[0].ver).to.equal(0)
      expect(list[0].uid).to.equal(user4._id.toString())
      expect(list[0].attr.password).is.null

      agent = await loginAsManager()
      res = await agent.get(`/users/${user4._id.toString()}/creds`)
      list = JSON.parse(res.text)
      expect(list).to.have.length(1)
      expect(list[0].ver).to.equal(0)
      expect(list[0].uid).to.equal(user4._id.toString())
      expect(list[0].attr.password).is.null
    })
    it('should reject except managers and the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      const agent = await loginAsAdmin()
      const user4 = await User.create({ name: 'User 4' })
      let res = await agent.post(`/users/${user4._id.toString()}/creds/password`)
        .type('json').send({
          uid: user4._id.toString(),
          provider: 'password',
          authId: 'user4id',
          attr: { password: 'user4pass' },
        })
      res = await agent.get(`/users/${user4._id.toString()}/creds`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })
    })
    it('should reject for invalid uid.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let agent = await loginAsUser4()
      const user4 = await User.findOne({ name: 'User 4' })
      const uid = user4._id.toString()
      await User.findOneAndRemove({ name: 'User 4' })
      let res = await agent.get(`/users/${uid}/creds`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'uid', error: 'reference' } ]
      })
    })
  })
  describe('PUT /users/:uid/creds/:provider/ver/:ver', () => {
    it('should update a credential for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let agent = await loginAsUser4()
      const user4 = await User.findOne({ name: 'User 4' })
      let cred4 = await Cred.findOne({ uid: user4._id.toString(),provider: 'password' })
      let res = await agent.put(`/users/${user4._id.toString()}/creds/password/ver/0`)
        .type('json').send({
          _id: cred4._id.toString(),
          ver: cred4.ver,
          uid: cred4.uid,
          provider: cred4.provider,
          authId: cred4.authId,
          attr: { password: 'dummy' },
        })
      cred4 = JSON.parse(res.text)
      expect(cred4.ver).to.equal(1)
      expect(cred4.authId).to.equal('user4id')
      expect(cred4.attr.password).is.null

      agent = await loginAsManager()
      res = await agent.put(`/users/${user4._id.toString()}/creds/password/ver/1`)
        .type('json').send({
          _id: cred4._id.toString(),
          ver: cred4.ver,
          uid: cred4.uid,
          provider: cred4.provider,
          authId: cred4.authId,
          attr: { password: 'user4pass' },
        })
      cred4 = JSON.parse(res.text)
      expect(cred4.ver).to.equal(2)
      expect(cred4.authId).to.equal('user4id')
      expect(cred4.attr.password).is.null
    })
    it('should reject except managers and the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsUser4()
      let agent = await loginAsAdmin()
      const user4 = await User.findOne({ name: 'User 4' })
      let cred4 = await Cred.findOne({ uid: user4._id.toString(), provider: 'password' })
      let res = await agent.put(`/users/${user4._id.toString()}/creds/password/ver/0`)
        .type('json').send({
          _id: cred4._id.toString(),
          ver: cred4.ver,
          uid: cred4.uid,
          provider: cred4.provider,
          authId: cred4.authId,
          attr: { password: 'dummy' },
        })
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })
    })
  })
  describe('DELETE /users/:uid/creds/:provider/ver/:ver', () => {
    it('should update a credential for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsUser4()
      let agent = await loginAsManager()
      const user4 = await User.findOne({ name: 'User 4' })
      let res = await agent.delete(`/users/${user4._id.toString()}/creds/password/ver/0`)
      expect(JSON.parse(res.text)).to.deep.equal({})
    })
    it('should update a credential for a manager or the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      let agent = await loginAsUser4()
      const user4 = await User.findOne({ name: 'User 4' })
      let res = await agent.delete(`/users/${user4._id.toString()}/creds/password/ver/0`)
      expect(JSON.parse(res.text)).to.deep.equal({})
    })
    it('should reject except managers and the user.', async () => {
      await chai.request(api).put('/setup').type('json').send(getSetupData())
      await loginAsUser4()
      let agent = await loginAsAdmin()
      const user4 = await User.findOne({ name: 'User 4' })
      let res = await agent.delete(`/users/${user4._id.toString()}/creds/password/ver/0`)
      expect(JSON.parse(res.text)).to.deep.equal({
        errors: [ { path: 'manager|uid', error: 'priv' } ]
      })
    })
  })
})

function getSetupData() {
  return {
    top: { name: 'Top' },
    admin: { name: 'Admin' },
    manager: { name: 'Manager' },
    user: { name: 'User 1' },
    cred: {
      provider: 'password',
      authId: 'user1id',
      attr: { password: 'user1pass' },
    }
  }
}

async function loginAsAdmin() {
  const user2 = await User.create({ name: 'User 2' })
  const manager = await Group.findOne({ name: 'Admin' }).exec()
  manager.uids.push(user2._id.toString())
  await manager.save()
  await Cred.create({
    uid: user2._id.toString(),
    provider: 'password',
    authId: 'user2id',
    attr: { password: digestPassword(user2._id.toString(), 'user2pass') }
  })
  const agent = chai.request.agent(api)
  await agent.post('/sessions').type('json').send({
    provider: 'password',
    authId: 'user2id',
    password: 'user2pass',
  })
  return agent
}

async function loginAsManager() {
  const user3 = await User.create({ name: 'User 3' })
  const manager = await Group.findOne({ name: 'Manager' }).exec()
  manager.uids.push(user3._id.toString())
  await manager.save()
  await Cred.create({
    uid: user3._id.toString(),
    provider: 'password',
    authId: 'user3id',
    attr: { password: digestPassword(user3._id.toString(), 'user3pass') }
  })
  const agent = chai.request.agent(api)
  await agent.post('/sessions').type('json').send({
    provider: 'password',
    authId: 'user3id',
    password: 'user3pass',
  })
  return agent
}

async function loginAsUser4() {
  const user4 = await User.create({ name: 'User 4' })
  await Cred.create({
    uid: user4._id.toString(),
    provider: 'password',
    authId: 'user4id',
    attr: { password: digestPassword(user4._id.toString(), 'user4pass') }
  })
  const agent = chai.request.agent(api)
  await agent.post('/sessions').type('json').send({
    provider: 'password',
    authId: 'user4id',
    password: 'user4pass',
  })
  return agent
}

function digestPassword(uid, password) {
  let hash = crypto.createHash('sha256')
  hash.update(`${uid}:${conf.seed}:${password}`)
  return hash.digest('hex')
}
