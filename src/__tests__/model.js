/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../model'
import {LOG_LEVEL, PROVIDER, PREFERENCE} from '../constants'
import {conf, deleteAll} from '../testHelper'

var models = {}

beforeAll(async () => {
  models = await model(conf)
})

beforeEach(async () => {
  await deleteAll(models)
})

afterAll(async () => {
  await deleteAll(models)
  await models.db.close()
})

test('Group', async () => {
  const {Group} = models
  expect((await Group.count())).toEqual(0)
  await expect(Group.create({})).rejects.toBeDefined()
  await expect(Group.create({_id: null})).rejects.toBeDefined()
  await expect(Group.create({_id: 'id0001'})).rejects.toBeDefined()
  await expect(Group.create({_id: 'id0001', name: null})).rejects.toBeDefined()
  let group1 = await Group.create({
    _id: 'id0001',
    name: 'Group 1',
  })
  expect(group1.createdAt).toBeDefined()
  expect(group1.updatedAt).toBeDefined()
  {
    let {_id, name, ver} = group1.get({plain: true})
    expect({_id, name, ver}).toEqual({
      _id: 'id0001',
      name: 'Group 1',
      ver: 1,
    })
  }
  await expect(Group.create({_id: 'id0001', name: 'Group 2'})).rejects.toBeDefined()
  await expect(Group.create({_id: 'id0002', name: 'Group 1'})).rejects.toBeDefined()
  let group2 = await Group.create({
    _id: 'id0002',
    name: 'Group 2',
    ver: 2,
  })
  {
    let {_id, name, ver} = group2.get({plain: true})
    expect({_id, name, ver}).toEqual({
      _id: 'id0002',
      name: 'Group 2',
      ver: 2,
    })
  }
  await group1.addSubGroup(group2)
  {
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(1)
    let {name} = members1[0]
    expect(name).toEqual(group2.name)
  }
  await group1.removeSubGroup(group2)
  {
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(0)
  }
  await group1.addSubGroup(group2._id)
  {
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(1)
    let {name} = members1[0]
    expect(name).toEqual(group2.name)
  }
  await group1.removeSubGroup(group2._id)
  {
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(0)
  }
  let group3 = await Group.create({
    _id: 'id0003',
    name: 'Group 3',
  })
  await group1.addSubGroups([group2, group3])
  {
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(2)
  }
  await group1.createSubGroup({
    _id: 'id0004',
    name: 'Group 4',
  })
  {
    let members1 = await group1.getSubGroups({
      attributes: ['_id', 'name'],
      order: ['_id'],
    })
    expect(members1.map(rec => {
      let {_id, name} = rec.get({plain: true})
      return {_id, name}
    })).toEqual([
      {_id: 'id0002', name: 'Group 2'},
      {_id: 'id0003', name: 'Group 3'},
      {_id: 'id0004', name: 'Group 4'},
    ])
  }
  let group4 = await Group.findById('id0004')
  {
    let {_id, name, ver} = group4.get({plain: true})
    expect({_id, name, ver}).toEqual({
      _id: 'id0004',
      name: 'Group 4',
      ver: 1,
    })
  }
  await group2.addSubGroup(group4)
  {
    let members2 = await group2.getSubGroups()
    expect(members2.length).toEqual(1)
    let groups = await group4.getGroups()
    expect(groups.length).toEqual(2)
  }
  await group4.destroy()
  {
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(2)
    let members2 = await group2.getSubGroups()
    expect(members2.length).toEqual(0)
  }
  let group5 = await Group.create({
    _id: 'id0005',
    name: 'Group 5',
  })
  await group5.addGroup(group1)
  await group5.addGroup(group2)
  {
    let groups = await group5.getGroups()
    expect(groups.length).toEqual(2)
    let members1 = await group1.getSubGroups()
    expect(members1.length).toEqual(3)
    let members2 = await group2.getSubGroups()
    expect(members2.length).toEqual(1)
  }
  {
    let res = await Group.update({
      desc: 'abc',
      ver: (group5.ver + 2)
    }, {
      fields: ['desc', 'ver'],
      where: {_id: 'id0005', ver: (group5.ver + 1)},
      returning: true,
    })
    expect(res[0]).toEqual(0)
  }
  {
    let res = await Group.update({
      desc: 'abc',
      ver: (group5.ver + 1)
    }, {
      fields: ['desc', 'ver'],
      where: {_id: 'id0005', ver: group5.ver},
      returning: true,
    })
    expect(res[0]).toEqual(1)
    let {_id, ver, name, desc} = res[1][0].get({plain: true})
    expect({_id, ver, name, desc}).toEqual({
      _id: 'id0005',
      ver: (group5.ver + 1),
      name: 'Group 5',
      desc: 'abc',
    })
  }
})

test('User', async () => {
  const {Group, User} = models
  expect((await User.count())).toEqual(0)
  await expect(User.create({})).rejects.toBeDefined()
  await expect(User.create({_id: null})).rejects.toBeDefined()
  await expect(User.create({_id: 'id0001'})).rejects.toBeDefined()
  await expect(User.create({_id: 'id0001', name: null})).rejects.toBeDefined()
  let user1 = await User.create({
    _id: 'id0001',
    name: 'User 1',
  })
  expect(user1.createdAt).toBeDefined()
  expect(user1.updatedAt).toBeDefined()
  {
    let {_id, name, ver} = user1.get({plain: true})
    expect({_id, name, ver}).toEqual({
      _id: 'id0001',
      name: 'User 1',
      ver: 1,
    })
  }
  await expect(User.create({_id: 'id0001', name: 'User 2'})).rejects.toBeDefined()
  await expect(User.create({_id: 'id0002', name: 'User 1'})).rejects.toBeDefined()
  let user2 = await User.create({
    _id: 'id0002',
    name: 'User 2',
    ver: 2,
  })
  {
    let {_id, name, ver} = user2.get({plain: true})
    expect({_id, name, ver}).toEqual({
      _id: 'id0002',
      name: 'User 2',
      ver: 2,
    })
  }

  let group1 = await Group.create({
    _id: 'id0001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'id0002',
    name: 'Group 2',
  })

  await group1.addUser(user2)
  {
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(1)
    let {name} = members1[0]
    expect(name).toEqual(user2.name)
  }
  await group1.removeUser(user2)
  {
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(0)
  }
  await group1.addUser(user2._id)
  {
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(1)
    let {name} = members1[0]
    expect(name).toEqual(user2.name)
  }
  await group1.removeUser(user2._id)
  {
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(0)
  }
  let user3 = await User.create({
    _id: 'id0003',
    name: 'User 3',
  })
  await group1.addUsers([user2, user3])
  {
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(2)
  }

  await group1.createUser({
    _id: 'id0004',
    name: 'User 4',
    ver: 1,
  })
  {
    let members1 = await group1.getUsers({
      attributes: ['_id', 'name'],
      order: ['_id'],
    })
    expect(members1.map(rec => {
      let {_id, name} = rec.get({plain: true})
      return {_id, name}
    })).toEqual([
      {_id: 'id0002', name: 'User 2'},
      {_id: 'id0003', name: 'User 3'},
      {_id: 'id0004', name: 'User 4'},
    ])
  }
  let user4 = await User.findById('id0004')
  {
    let {_id, name, ver} = user4.get({plain: true})
    expect({_id, name, ver}).toEqual({
      _id: 'id0004',
      name: 'User 4',
      ver: 1,
    })
  }
  await group2.addUser(user4)
  {
    let members2 = await group2.getUsers()
    expect(members2.length).toEqual(1)
    let groups = await user4.getGroups()
    expect(groups.length).toEqual(2)
  }
  await user4.destroy()
  {
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(2)
    let members2 = await group2.getUsers()
    expect(members2.length).toEqual(0)
  }
  let user5 = await User.create({
    _id: 'id0005',
    name: 'User 5',
  })
  await user5.addGroup(group1)
  await user5.addGroup(group2)
  {
    let groups = await user5.getGroups()
    expect(groups.length).toEqual(2)
    let members1 = await group1.getUsers()
    expect(members1.length).toEqual(3)
    let members2 = await group2.getUsers()
    expect(members2.length).toEqual(1)
  }
  {
    let res = await User.update({
      desc: 'abc',
      ver: (user5.ver + 2)
    }, {
      fields: ['desc', 'ver'],
      where: {_id: 'id0005', ver: (user5.ver + 1)},
      returning: true,
    })
    expect(res[0]).toEqual(0)
  }
  {
    let res = await User.update({
      desc: 'abc',
      profiles: {a: 'X', b: 'Y'},
      ver: (user5.ver + 1)
    }, {
      fields: ['desc', 'profiles', 'ver'],
      where: {_id: 'id0005', ver: user5.ver},
      returning: true,
    })
    expect(res[0]).toEqual(1)
    let {_id, ver, name, desc, profiles} = res[1][0].get({plain: true})
    expect({_id, ver, name, desc, profiles}).toEqual({
      _id: 'id0005',
      ver: (user5.ver + 1),
      name: 'User 5',
      desc: 'abc',
      profiles: {a: 'X', b: 'Y'},
    })
  }

  await group1.addOwner(user1)
  {
    let owners1 = await group1.getOwners()
    expect(owners1.length).toEqual(1)
    let {name} = owners1[0]
    expect(name).toEqual(user1.name)
  }
  await group1.removeOwner(user1)
  {
    let owners1 = await group1.getOwners()
    expect(owners1.length).toEqual(0)
  }
  await group1.addOwner(user1._id)
  {
    let owners1 = await group1.getOwners()
    expect(owners1.length).toEqual(1)
    let {name} = owners1[0]
    expect(name).toEqual(user1.name)
  }
  await group1.removeOwner(user1._id)
  {
    let owners1 = await group1.getOwners()
    expect(owners1.length).toEqual(0)
  }
  await group1.addOwners([user1, user2])
  {
    let owners1 = await group1.getOwners()
    expect(owners1.length).toEqual(2)
  }
  await group1.removeOwners([user1, user2])
  {
    let owners1 = await group1.getOwners()
    expect(owners1.length).toEqual(0)
  }

  await user1.addOwnedGroup(group1)
  {
    let owned1 = await user1.getOwnedGroups()
    expect(owned1.length).toEqual(1)
    let {name} = owned1[0]
    expect(name).toEqual(group1.name)
  }
  await user1.removeOwnedGroup(group1)
  {
    let owned1 = await user1.getOwnedGroups()
    expect(owned1.length).toEqual(0)
  }
  await user1.addOwnedGroup(group1._id)
  {
    let owned1 = await user1.getOwnedGroups()
    expect(owned1.length).toEqual(1)
    let {name} = owned1[0]
    expect(name).toEqual(group1.name)
  }
  await user1.removeOwnedGroup(group1._id)
  {
    let owned1 = await user1.getOwnedGroups()
    expect(owned1.length).toEqual(0)
  }
  await user1.addOwnedGroups([group1, group2])
  {
    let owned1 = await user1.getOwnedGroups()
    expect(owned1.length).toEqual(2)
  }
  await user1.removeOwnedGroups([group1, group2])
  {
    let owned1 = await user1.getOwnedGroups()
    expect(owned1.length).toEqual(0)
  }
})

test('Cert', async () => {
  const {Cert, User} = models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  expect((await Cert.count())).toEqual(0)
  await expect(Cert.create({})).rejects.toBeDefined()
  await expect(Cert.create({
    uid: null,
  })).rejects.toBeDefined()
  await expect(Cert.create({
    uid: 'dummy',
  })).rejects.toBeDefined()
  await expect(Cert.create({
    uid: user1._id,
  })).rejects.toBeDefined()
  await expect(Cert.create({
    uid: user1._id,
    provider: null,
  })).rejects.toBeDefined()
  await expect(Cert.create({
    uid: user1._id,
    provider: 'dummy',
  })).rejects.toBeDefined()
  await expect(Cert.create({
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
  })).rejects.toBeDefined()
  await expect(Cert.create({
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
    key: null,
  })).rejects.toBeDefined()
  let cred1 = await Cert.create({
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
    key: 'key01',
    secret: 'password01'
  })
  expect(cred1).toBeDefined()
  {
    let {_id, uid, provider, key, secret} = cred1.get({plain: true})
    expect({_id, uid, provider, key, secret}).toEqual({
      uid: user1._id,
      provider: PROVIDER.PASSWORD,
      key: 'key01',
      secret: 'password01'
    })
  }
  expect((await Cert.count())).toEqual(1)
  await expect(user1.createCert({
    provider: PROVIDER.PASSWORD,
    key: 'key02',
  })).rejects.toBeDefined()
  let cred2 = await user1.createCert({
    provider: PROVIDER.GOOGLE,
    key: 'key02',
  })
  {
    let {_id, uid, provider, key, secret} = cred2.get({plain: true})
    expect({_id, uid, provider, key, secret}).toEqual({
      uid: user1._id,
      provider: PROVIDER.GOOGLE,
      key: 'key02',
      secret: null,
    })
  }
  expect((await Cert.count())).toEqual(2)
  await user1.destroy()
  expect((await Cert.count())).toEqual(0)
})

test('Session', async () => {
  const {Session, User} = models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  expect((await Session.count())).toEqual(0)
  await expect(Session.create({})).rejects.toBeDefined()
  await expect(Session.create({
    _id: null,
  })).rejects.toBeDefined()
  await expect(Session.create({
    _id: 'sess01',
  })).rejects.toBeDefined()
  await expect(Session.create({
    _id: 'sess01',
    uid: null,
  })).rejects.toBeDefined()
  await expect(Session.create({
    _id: 'sess01',
    uid: 'dummy',
  })).rejects.toBeDefined()
  await expect(Session.create({
    _id: 'sess01',
    uid: user1._id,
  })).rejects.toBeDefined()
  await expect(Session.create({
    _id: 'sess01',
    uid: user1._id,
    provider: null,
  })).rejects.toBeDefined()
  await expect(Session.create({
    _id: 'sess01',
    uid: user1._id,
    provider: 'dummy',
  })).rejects.toBeDefined()
  let sess1 = await Session.create({
    _id: 'sess01',
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
  })
  expect(sess1.gids).toEqual([])
  expect(sess1.oids).toEqual([])
  expect(sess1.manager).toBeFalsy()
  expect(sess1.admin).toBeFalsy()
  expect(sess1.createdAt).toBeDefined()
  expect(sess1.updatedAt).toBeDefined()
  expect((await Session.count())).toEqual(1)
  let sess2 = await user1.createSession({
    _id: 'sess02',
    provider: PROVIDER.GOOGLE,
  })
  expect(sess2.uid).toEqual(user1._id)
  expect(sess2.gids).toEqual([])
  expect(sess2.manager).toBeFalsy()
  expect(sess2.admin).toBeFalsy()
  expect(sess2.createdAt).toBeDefined()
  expect(sess2.updatedAt).toBeDefined()
  expect((await Session.count())).toEqual(2)
  await user1.destroy()
  expect((await Session.count())).toEqual(0)
})

test('Log', async () => {
  const {Log} = models
  expect((await Log.count())).toEqual(0)
  await expect(Log.create({})).rejects.toBeDefined()
  await expect(Log.create({_id: null})).rejects.toBeDefined()
  expect((await Log.create({
    _id: 'id0001',
    createdAt: new Date('2020-12-31T23:59:59.000Z'),
  })).get({plain: true})).toEqual({
    _id: 'id0001',
    level: LOG_LEVEL.INFO,
    createdAt: new Date('2020-12-31T23:59:59.000Z'),
    sid: null,
    rec: {},
  })
  await expect(Log.create({_id: 'id0001'})).rejects.toBeDefined()
  expect((await Log.create({
    _id: 'id0002',
    level: LOG_LEVEL.INFO,
    createdAt: new Date('2020-12-31T23:59:59.000Z'),
    sid: 'sid001',
    rec: {a: 'X'},
  })).get({plain: true})).toEqual({
    _id: 'id0002',
    level: LOG_LEVEL.INFO,
    createdAt: new Date('2020-12-31T23:59:59.000Z'),
    sid: 'sid001',
    rec: {a: 'X'}
  })
})

test('Preference', async () => {
  const {Preference} = models
  expect((await Preference.count())).toEqual(0)
  await expect(Preference.create({})).rejects.toBeDefined()
  await expect(Preference.create({_id: null})).rejects.toBeDefined()
  await expect(Preference.create({
    pid: null,
  })).rejects.toBeDefined()
  await expect(Preference.create({
    pid: 'dummy',
  })).rejects.toBeDefined()
  await expect(Preference.create({
    pid: PREFERENCE.HELP_GUEST,
    val: null,
  })).rejects.toBeDefined()
  expect((await Preference.create({
    pid: PREFERENCE.HELP_GUEST,
  })).get({plain: true})).toEqual(
    expect.objectContaining({
      pid: PREFERENCE.HELP_GUEST,
      val: '',
    })
  )
  await expect(Preference.create({
    pid: PREFERENCE.HELP_GUEST,
    val: '',
  })).rejects.toBeDefined()
  expect((await Preference.create({
    pid: PREFERENCE.HELP_MEMBER,
    val: '',
  })).get({plain: true})).toEqual(
    expect.objectContaining({
      pid: PREFERENCE.HELP_MEMBER,
      val: '',
    })
  )
})
