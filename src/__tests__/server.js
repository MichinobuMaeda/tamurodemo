/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import superagent from 'superagent'
import prefix from 'superagent-prefix'
import shortid from 'shortid'

import {PROVIDER, GROUP_ROLE, ERRORS, PREFERENCE} from '../constants'
import {model} from '../model'
import {conf, deleteAll, testProviders} from '../testHelper'
import server from '../server'

conf.expires = 1000 * 1000

var models = null
var servers = null

beforeAll(async () => {
  models = await model(conf)
  servers = await server(conf, testProviders, models)
})

beforeEach(async () => {
  await deleteAll(models)
})

afterAll(async () => {
  await servers.http.close()
  await deleteAll(models)
  await models.db.close()
})

test('server', async () => {
  const {Group, User, Session, Cert, Preference} = models
  const baseUrl = prefix(`http://localhost:${conf.port}${conf.basePath}`)
  const agent = superagent.agent()

  console.warn('Before setup')
  expect(
    (await agent.get('/').use(baseUrl)).body
  ).toEqual({})
  
  console.warn('Invalid path')
  await expect(
    agent.get('/dummy').use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 404})
  )
  
  console.warn('Set up')
  await setup(models)
  let title = await Preference.findOne({where: {pid: PREFERENCE.TITLE} })
  let top = await Group.findOne({where: {role: GROUP_ROLE.TOP} })
  let manager = await Group.findOne({where: {role: GROUP_ROLE.MANAGER} })
  let admin = await Group.findOne({where: {role: GROUP_ROLE.ADMIN} })
  let user1 = await User.findOne({})
  let tokenSession = await Session.findOne({})
  
  console.warn('After setup')
  expect(
    (await agent.get('/').use(baseUrl)).body
  ).toEqual({
    title: {val: title.val},
    top: {name: top.name},
    session: {},
  })
  
  console.warn('Access with token')
  var redirectTo = null
  try {
    await agent.get(`/token/${tokenSession._id}`).use(baseUrl).redirects(0)
  } catch (e) {
    expect(e.status).toEqual(302)
    redirectTo = e.response.header.location
  }
  expect(redirectTo).toEqual(conf.appUrl)

  console.warn('Add password')
  expect(
    (await agent.post(`/users/${user1._id}/certs`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.PASSWORD,
        id: '',
        password: 'password',
      })
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.CERT_MISSED})
  )
  expect(
    (await agent.post(`/users/${user1._id}/certs`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.PASSWORD,
        id: 'id',
        password: '',
      })
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.CERT_MISSED})
  )
  expect(
    (await agent.post(`/users/${user1._id}/certs`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.PASSWORD,
        id: 'id',
        password: 'password',
      })
    ).body
  ).toEqual(
    expect.objectContaining({
      certs: expect.arrayContaining([
        {
          provider: PROVIDER.PASSWORD,
          id: 'id',
          ver: 1,
        },
      ])
    })
  )

  console.warn('Sign in')
  {
    let res = await agent.post('/sessions').use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.PASSWORD,
        id: 'id',
        password: 'password'
      })
    let sess = await Session.findOne({})
    expect(res.body.top._id).toEqual(top._id)
    expect(res.body.session.uid).toEqual(sess.uid)
    expect((await agent.get('/').use(baseUrl)).body).toEqual(res.body)
  }
  let sess1 = await Session.findOne({})
  let cert1 = await Cert.findOne({
    where: {
      uid: sess1.uid,
      provider: PROVIDER.PASSWORD
    }
  })
  
  console.warn('Change password')
  expect(
    (await agent.put(`/users/${sess1.uid}/certs/${cert1.provider}/ver/${cert1.ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        id: '',
        password: 'password01',
      })
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.CERT_MISSED})
  )
  expect(
    (await agent.put(`/users/${sess1.uid}/certs/${cert1.provider}/ver/${cert1.ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        id: 'id01',
        password: '',
      })
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.CERT_MISSED})
  )
  expect(
    (await agent.put(`/users/${sess1.uid}/certs/${cert1.provider}/ver/${cert1.ver - 1}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        id: 'id01',
        password: 'password01',
      })
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.DATA_REVISED})
  )
  expect(
    (await agent.put(`/users/${sess1.uid}/certs/${cert1.provider}/ver/${cert1.ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        id: 'id01',
        password: 'password01',
      })
    ).body
  ).toEqual(
    expect.objectContaining({
      certs: [
        {
          provider: cert1.provider,
          id: 'id01',
          ver: cert1.ver + 1,
        },
      ]
    })
  )
  expect(
    await Cert.findOne({where: {uid: user1._id, provider: PROVIDER.PASSWORD}})
  ).toEqual(
    expect.objectContaining({
      key: 'id01',
      secret: 'encrypted:password01',
      ver: cert1.ver + 1,
    })
  )

  console.warn('Sign out')
  {
    let res = await agent.delete('/sessions/me').use(baseUrl)
    expect(await Session.count({})).toEqual(0)
    expect(res.body).toEqual({
      title: {val: title.val},
      top: {name: top.name},
      session: {},
    })
  }
  console.warn('Add google id')
  await agent.post('/sessions').use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      provider: PROVIDER.PASSWORD,
      id: 'id01',
      password: 'password01'
    })
  expect(
    (await agent.post(`/users/${user1._id}/certs`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.GOOGLE,
        token: '',
      })
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.CERT_MISSED})
  )
  expect(
    (await agent.post(`/users/${user1._id}/certs`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.GOOGLE,
        token: 'token01',
      })
    ).body
  ).toEqual(
    expect.objectContaining({
      certs: expect.arrayContaining([
        {
          provider: cert1.provider,
          id: 'id01',
          ver: cert1.ver + 1,
        },
        {
          provider: PROVIDER.GOOGLE,
          ver: 1,
        },
      ])
    })
  )
  expect(await Cert.findAll({where: {uid: user1._id}}))
    .toHaveLength(2)
  expect(
    await Cert.findOne({where: {uid: user1._id, provider: PROVIDER.GOOGLE}})
  ).toEqual(
    expect.objectContaining({
      key: 'user id of token:token01',
      ver: 1,
    })
  )
  
  console.warn('Delete password')
  expect(
    (await agent.delete(`/users/${user1._id}/certs/${cert1.provider}/ver/${cert1.ver - 1}`).use(baseUrl)
    ).body.errors[0]
  ).toEqual(
    expect.objectContaining({error: ERRORS.DATA_REVISED})
  )
  expect(
    (await agent.delete(`/users/${user1._id}/certs/${cert1.provider}/ver/${cert1.ver + 1}`).use(baseUrl)
    ).body.certs
  ).toHaveLength(1)
  await agent.delete('/sessions/me').use(baseUrl)
  expect(await Session.count({})).toEqual(0)
  await user1.createSession({
    _id: 'sid001',
    provider: PROVIDER.PASSWORD,
  })
  await agent.post('/sessions').use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      provider: PROVIDER.GOOGLE,
      token: 'token01',
    })

  console.warn('Get sessions')
  let now = new Date().getTime()
  let from = new Date(now - 10000).toISOString()
  let to = new Date(now).toISOString()
  expect(
    (await agent.get(`/sessions/${from}/to/${to}`).use(baseUrl)).body
  ).toHaveLength(2)
  
  console.warn('Get logs')
  expect(
    (await agent.get(`/logs/${from}/to/${to}`).use(baseUrl)).body
  ).toBeTruthy()

  console.warn('Post member group')
  {
    let res = (await agent.post(`/groups/${top._id}/subgroups`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        name: 'Group New',
      }))
    expect(
      res.body.subGroups
    ).toEqual(
      expect.arrayContaining([
        expect. objectContaining({
          name: 'Group New',
        })
      ])
    )
    expect(res.body.subGroups).toHaveLength(3)
  }
  
  console.warn('Put member groups')
  let group4 = await Group.findOne({where : {name: 'Group New'} })
  expect(
    (await agent.put(`/groups/${admin._id}/subgroups`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        sids: [group4._id]
      })).body.subGroups
  ).toEqual(
    expect.arrayContaining([
      expect. objectContaining({
        _id: group4._id,
      })
    ])
  )
  await agent.put(`/groups/${admin._id}/subgroups`).use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      sids: []
    })

  console.warn('Put upper groups')
  expect(
    (await agent.put(`/groups/${admin._id}/groups`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        gids: [top._id, group4._id]
      })).body.groups
  ).toEqual(
    expect.arrayContaining([
      expect. objectContaining({
        _id: group4._id,
      })
    ])
  )
  await agent.put(`/groups/${admin._id}/groups`).use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      gids: [top._id]
    })
  
  console.warn('Put group')
  expect(
    (await agent.put(`/groups/${group4._id}/ver/${group4.ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        ...(group4.get({plain: true})),
        name: 'Group 4',
      })).body
  ).toEqual(
    expect. objectContaining({
      name: 'Group 4',
      ver: group4.ver + 1
    })
  )

  console.warn('Post member user')
  {
    let res = (await agent.post(`/groups/${group4._id}/users`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        name: 'User New',
      }))
    expect(
      res.body.users
    ).toEqual(
      expect.arrayContaining([
        expect. objectContaining({
          name: 'User New',
        })
      ])
    )
    expect(res.body.users).toHaveLength(1)
  }
  let user2 = await User.findOne({where : {name: 'User New'} })
  expect(
    (await agent.get('/invitees').use(baseUrl)).body
  ).toEqual([{_id: user2._id, name: user2.name, token: null}])
  
  console.warn('Put member users')
  expect(
    (await agent.put(`/groups/${admin._id}/users`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        uids: [user1._id, user2._id]
      })).body.users
  ).toEqual(
    expect.arrayContaining([
      expect. objectContaining({
        _id: user2._id,
      })
    ])
  )
  await agent.put(`/groups/${admin._id}/users`).use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      uids: [user1._id]
    })

  console.warn('Put owners')
  expect(
    (await agent.put(`/groups/${admin._id}/owners`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        oids: [user2._id]
      })).body.owners
  ).toEqual(
    expect.arrayContaining([
      expect. objectContaining({
        _id: user2._id,
      })
    ])
  )
  await agent.put(`/groups/${admin._id}/owners`).use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      oids: []
    })

  console.warn('Put user')
  expect(
    (await agent.put(`/users/${user2._id}/ver/${user2.ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        ...(user2.get({plain: true})),
        name: 'User 2',
      })).body
  ).toEqual(
    expect. objectContaining({
      name: 'User 2',
      ver: user2.ver + 1
    })
  )
  expect(
    (await agent.get('/groups').use(baseUrl)).body
  ).toHaveLength(4)
  expect(
    (await agent.get(`/groups/${group4._id}`).use(baseUrl)).body
  ).toEqual(
    expect.objectContaining({
      _id: group4._id,
    })
  )
  expect(
    (await agent.get('/users').use(baseUrl)).body
  ).toHaveLength(2)
  expect(
    (await agent.get(`/users/${user2._id}`).use(baseUrl)).body
  ).toEqual(
    expect.objectContaining({
      _id: user2._id,
    })
  )

  console.warn('Put groups')
  expect(
    (await agent.put(`/users/${user2._id}/groups`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        gids: [admin._id, group4._id]
      })).body.groups
  ).toEqual(
    expect.arrayContaining([
      expect. objectContaining({
        _id: admin._id,
      })
    ])
  )
  await agent.put(`/users/${user2._id}/groups`).use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      gids: [group4._id]
    })

  console.warn('Get helps')
  let helps = (await agent.get('/helps').use(baseUrl)).body
  expect(helps).toEqual(
    expect.arrayContaining([
      expect.objectContaining({pid: PREFERENCE.HELP_GUEST}),
      expect.objectContaining({pid: PREFERENCE.HELP_MEMBER}),
      expect.objectContaining({pid: PREFERENCE.HELP_MANAGER}),
      expect.objectContaining({pid: PREFERENCE.HELP_ADMIN}),
    ])
  )

  console.warn('Update help')
  expect(
    (await agent.put(`/helps/${helps[0].pid}/ver/${helps[0].ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        val: 'Text 1',
      })).body
  ).toEqual(
    expect.objectContaining({
      pid: helps[0].pid,
      val: 'Text 1',
      ver: helps[0].ver + 1,
    })
  )

  console.warn('Sign in as user2')
  await agent.post(`/users/${user2._id}/certs`).use(baseUrl)
    .set('Content-Type', 'application/json')
    .send({
      provider: PROVIDER.GOOGLE,
      token: 'token02',
    })
  expect(
    (await agent.get('/invitees').use(baseUrl)).body
  ).toEqual([])
  await agent.delete('/sessions/me').use(baseUrl)
  expect(
    (await agent.post('/sessions').use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.GOOGLE,
        token: 'token02',
      })).body.session
  ).toEqual(
    expect.objectContaining({
      uid: user2._id
    })
  )

  expect(
    (await agent.get(`/groups/${manager._id}`).use(baseUrl)).body
  ).toEqual(
    expect.objectContaining({
      _id: manager._id,
    })
  )
  expect(
    (await agent.get(`/users/${user1._id}`).use(baseUrl)).body
  ).toEqual(
    expect.objectContaining({
      _id: user1._id,
    })
  )
  expect(
    (await agent.get('/groups').use(baseUrl)).body
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({_id: top._id})
    ])
  )

  console.warn('No priv')
  await expect(
    agent.get(`/sessions/${from}/to/${to}`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.get(`/logs/${from}/to/${to}`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.get('/users').use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.post(`/groups/${group4._id}/subgroups`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.post(`/groups/${group4._id}/users`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.put(`/helps/${helps[0]._id}/ver/${helps[0].ver}`).use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        val: 'Text 1',
      })
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.put(`/groups/${group4._id}/groups`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.put(`/groups/${group4._id}/subgroups`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.put(`/groups/${group4._id}/owners`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.put(`/users/${user1._id}/groups`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )
  await expect(
    agent.get('/invitees').use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )

  console.warn('Sign in as user1')
  await agent.delete('/sessions/me').use(baseUrl)
  expect(
    (await agent.post('/sessions').use(baseUrl)
      .set('Content-Type', 'application/json')
      .send({
        provider: PROVIDER.GOOGLE,
        token: 'token01',
      })).body.session
  ).toEqual(
    expect.objectContaining({
      uid: user1._id
    })
  )

  console.warn('Delete user')
  expect(
    (await agent.delete(`/users/${user2._id}/ver/${user2.ver + 1}`).use(baseUrl)).body
  ).toEqual({})
  
  console.warn('Delete group')
  expect(
    (await agent.delete(`/groups/${group4._id}/ver/${group4.ver + 1}`).use(baseUrl)).body
  ).toEqual({})
  
  console.warn('Revoke manager')
  expect(
    (await agent.put('/sessions/me/revoke/manager').use(baseUrl)
    ).body.session
  ).toEqual(
    expect.objectContaining({
      isManager: false,
      isAdmin: true,
    })
  )
  await expect(
    agent.get('/users').use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )

  console.warn('Revoke admin')
  expect(
    (await agent.put('/sessions/me/revoke/admin').use(baseUrl)
    ).body.session
  ).toEqual(
    expect.objectContaining({
      isManager: false,
      isAdmin: false,
    })
  )
  await expect(
    agent.get(`/sessions/${from}/to/${to}`).use(baseUrl)
  ).rejects.toEqual(
    expect.objectContaining({status: 403})
  )

  // console.warn(
  //   (await agent.get(`/logs/${from}/to/${new Date().toISOString()}`).use(baseUrl))
  //     .body.map(log => JSON.stringify(log))
  // )
})

const setup = async models => {
  const {Group, Session, Preference} = models
  let top = await Group.create({
    _id: shortid.generate(),
    name: 'Title',
    role: GROUP_ROLE.TOP,
  })
  let manager = await top.createSubGroup({
    _id: shortid.generate(),
    name: 'User Manager',
    role: GROUP_ROLE.MANAGER,
  })
  let admin = await top.createSubGroup({
    _id: shortid.generate(),
    name: 'System Administrator',
    role: GROUP_ROLE.ADMIN,
  })
  let user = await manager.createUser({
    _id: shortid.generate(),
    name: 'Primary User',
  })
  await admin.addUser(user)
  await Session.create({
    _id: shortid.generate(),
    uid: user._id,
    provider: PROVIDER.TOKEN,
    gids: [],
    oids: [],
    isAdmin: false,
    isManager: false,
  })
  await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.TITLE,
    val: 'Title',
  })
  await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_GUEST,
  })
  await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_MEMBER,
  })
  await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_MANAGER,
  })
  await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_ADMIN,
  })
}
