/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'

import {PROVIDER, GROUP_ROLE, ERRORS, PREFERENCE} from '../../constants'
import {respondError} from '../../helper'
import {conf, deleteAll, testProviders} from '../../testHelper'
import {
  getSessions, getGids, getUserPriv, hasGroupRole,
  createSessionFromCert, createSession, deleteSession, deleteMySession,
  revokeManager, revokeAdmin,
} from '../sessions'

var ctx = {}

beforeAll(async () => {
  let models = await model(conf)
  ctx = {conf, models,}
})

beforeEach(async () => {
  await deleteAll(ctx.models)
})

afterAll(async () => {
  await deleteAll(ctx.models)
  await ctx.models.db.close()
})

test('getSessions', async () => {
  let {User} = ctx.models
  {
    let body = await getSessions({
      ...ctx,
      request: {
        params: {
          from: new Date().getTime() - 1000,
          to: new Date().getTime() + 1000,
        }
      },
    })
    expect(body).toHaveLength(0)
  }
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  await user1.createSession({
    _id: 'sess01',
    provider: PROVIDER.GOOGLE,
  })
  await user1.createSession({
    _id: 'sess02',
    provider: PROVIDER.GOOGLE,
  })
  {
    let body = await getSessions({
      ...ctx,
      request: {
        params: {
          from: new Date().getTime() - 1000,
          to: new Date().getTime() + 1000,
        }
      },
    })
    expect(body).toHaveLength(2)
  }
  {
    let body = await getSessions({
      ...ctx,
      request: {
        params: {
          from: new Date().getTime() - 2000,
          to: new Date().getTime() - 1000,
        }
      },
    })
    expect(body).toHaveLength(0)
  }
  {
    let body = await getSessions({
      ...ctx,
      request: {
        params: {
          from: new Date().getTime() + 1000,
          to: new Date().getTime() + 2000,
        }
      },
    })
    expect(body).toHaveLength(0)
  }
})

test('getGids', async () => {
  let {SubGroup, Group} = ctx.models
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
  })
  let group3 = await Group.create({
    _id: 'gid003',
    name: 'Group 3',
  })
  let group4 = await Group.create({
    _id: 'gid004',
    name: 'Group 4',
  })
  let group5 = await Group.create({
    _id: 'gid005',
    name: 'Group 5',
  })
  let group6 = await Group.create({
    _id: 'gid006',
    name: 'Group 6',
  })
  expect(await getGids(SubGroup, null)).toEqual(null)
  expect(await getGids(SubGroup, [])).toEqual([])
  expect(await getGids(SubGroup, [group1._id])).toEqual(
    [group1._id]
  )
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id]
  )
  await group1.addGroup(group3)
  expect((await getGids(SubGroup, [group1._id])).sort()).toEqual(
    [group1._id, group3._id]
  )
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id]
  )
  await group1.addSubGroup(group4)
  expect((await getGids(SubGroup, [group1._id])).sort()).toEqual(
    [group1._id, group3._id]
  )
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id]
  )
  await group2.addGroup(group3)
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id]
  )
  await group2.addGroup(group4)
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id, group4._id]
  )
  await group4.addGroup(group5)
  expect((await getGids(SubGroup, [group1._id])).sort()).toEqual(
    [group1._id, group3._id]
  )
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id, group4._id, group5._id]
  )
  await group4.addSubGroup(group6)
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id, group4._id, group5._id]
  )
  // Looped
  await group4.addGroup(group1)
  expect((await getGids(SubGroup, [group1._id, group2._id])).sort()).toEqual(
    [group1._id, group2._id, group3._id, group4._id, group5._id]
  )
})

test('getUserPriv', async () => {
  let {SubGroup, User, Group} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
  })
  let group3 = await Group.create({
    _id: 'gid003',
    name: 'Group 3',
  })
  let group4 = await Group.create({
    _id: 'gid004',
    name: 'Group 4',
  })
  await group1.addGroup(group4)
  await group2.addGroup(group3)
  await group3.addGroup(group4)
  expect((await getUserPriv(user1, SubGroup)).sort()).toEqual([])
  await user1.addGroup(group1)
  expect((await getUserPriv(user1, SubGroup)).sort()).toEqual(
    [group1._id, group4._id]
  )
  await user1.addGroup(group2)
  expect((await getUserPriv(user1, SubGroup)).sort()).toEqual(
    [group1._id, group2._id, group3._id, group4._id]
  )
})

test('hasGroupRole', async () => {
  let {Group} = ctx.models
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
  })
  expect(await hasGroupRole(Group, null, GROUP_ROLE.ADMIN)).toEqual(false)
  expect(await hasGroupRole(Group, null, GROUP_ROLE.MANAGER)).toEqual(false)
  expect(await hasGroupRole(Group, [], GROUP_ROLE.ADMIN)).toEqual(false)
  expect(await hasGroupRole(Group, [], GROUP_ROLE.MANAGER)).toEqual(false)
  expect(await hasGroupRole(Group, [group1._id], GROUP_ROLE.ADMIN)).toEqual(false)
  expect(await hasGroupRole(Group, [group1._id], GROUP_ROLE.MANAGER)).toEqual(false)
  expect(await hasGroupRole(Group, [group1._id, group2._id], GROUP_ROLE.ADMIN)).toEqual(false)
  expect(await hasGroupRole(Group, [group1._id, group2._id], GROUP_ROLE.MANAGER)).toEqual(false)
  await Group.update({
    role: GROUP_ROLE.ADMIN,
  }, {
    fields: ['role'],
    where: {_id: group1._id},
  })
  expect(await hasGroupRole(Group, [group1._id, group2._id], GROUP_ROLE.ADMIN)).toEqual(true)
  expect(await hasGroupRole(Group, [group1._id, group2._id], GROUP_ROLE.MANAGER)).toEqual(false)
  await Group.update({
    role: GROUP_ROLE.MANAGER,
  }, {
    fields: ['role'],
    where: {_id: group1._id},
  })
  expect(await hasGroupRole(Group, [group1._id, group2._id], GROUP_ROLE.ADMIN)).toEqual(false)
  expect(await hasGroupRole(Group, [group1._id, group2._id], GROUP_ROLE.MANAGER)).toEqual(true)
})

test('createSessionFromCert', async () => {
  let {SubGroup, User, Group, Session} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
  })
  await user1.addGroup(group1)
  await user1.addOwnedGroup(group2)
  let cert1 = {uid: user1._id, provider: PROVIDER.PASSWORD}
  expect(await createSessionFromCert({SubGroup, User, Group, Session}, cert1)).toEqual(
    expect.objectContaining({
      uid: user1._id,
      provider: PROVIDER.PASSWORD,
      gids: [group1._id],
      oids: [group2._id],
      isAdmin: false,
      isManager: false,
    })
  )
  await Group.update({
    role: GROUP_ROLE.ADMIN,
  }, {
    fields: ['role'],
    where: {_id: group1._id},
  })
  expect(await createSessionFromCert({SubGroup, User, Group, Session}, cert1)).toEqual(
    expect.objectContaining({
      uid: user1._id,
      provider: PROVIDER.PASSWORD,
      gids: [group1._id],
      oids: [group2._id],
      isAdmin: true,
      isManager: false,
    })
  )
  await Group.update({
    role: GROUP_ROLE.MANAGER,
  }, {
    fields: ['role'],
    where: {_id: group1._id},
  })
  expect(await createSessionFromCert({SubGroup, User, Group, Session}, cert1)).toEqual(
    expect.objectContaining({
      uid: user1._id,
      provider: PROVIDER.PASSWORD,
      gids: [group1._id],
      oids: [group2._id],
      isAdmin: false,
      isManager: true,
    })
  )
})

test('createSession', async () => {
  let {Group, User, Preference} = ctx.models
  await Preference.create({
    _id: '_id001',
    pid: PREFERENCE.TITLE,
    val: 'Title',
  })
  await Group.create({
    _id: 'gid001',
    name: 'Group 1',
    role: GROUP_ROLE.TOP,
  })
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let cert1 = await user1.createCert({
    _id: 'cer001',
    provider: PROVIDER.PASSWORD,
    key: 'key001',
    secret: 'encrypted:pass001'
  })
  {
    expect(await createSession({
      ...ctx,
      providers: testProviders,
      request: {
        body: {
          provider: 'dummy',
          id: 'key001',
          password: 'pass001',
        }
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.CERT_MISSED,
      {provider: 'dummy', id: 'key001', token: undefined}
    ))
  }
  {
    let ctx0 = {
      ...ctx,
      providers: testProviders,
      request: {
        body: {
          provider: PROVIDER.PASSWORD,
          id: 'key002',
          password: 'pass001',
        }
      },
      session: {uid: 'uid001'},
    }
    expect(await createSession(ctx0)).toEqual(respondError(
      ERRORS.CERT_MISSED,
      {provider: PROVIDER.PASSWORD, id: 'key002', token: undefined}
    ))
    expect(ctx0.session).toEqual({})
  }
  {
    let ctx0 = {
      ...ctx,
      providers: testProviders,
      request: {
        body: {
          provider: PROVIDER.PASSWORD,
          id: cert1.key,
          password: 'pass001',
        }
      },
      session: {uid: 'uid001'},
    }
    let body = await createSession(ctx0)
    expect(body.session).toEqual(
      expect.objectContaining({
        uid: user1._id,
        provider: cert1.provider,
        gids: [],
        oids: [],
      })
    )
    expect(body.top).toBeDefined()
    expect(ctx0.session).toEqual(
      expect.objectContaining({
        uid: user1._id,
        provider: cert1.provider,
        gids: [],
      })
    )
  }
})

test('deleteSession', async () => {
  let {User, Session} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let sess1 = await user1.createSession({
    _id: 'sess01',
    gids: [],
    provider: PROVIDER.PASSWORD,
  })
  let sess2 = await user1.createSession({
    _id: 'sess02',
    gids: [],
    provider: PROVIDER.PASSWORD,
  })
  {
    let ctx0 = {
      ...ctx,
      request: {
        params: {sid: sess2._id}
      },
      session: sess1
    }
    let body = await deleteSession(ctx0)
    expect(body).toEqual({})
    expect(ctx0.session).toEqual(sess1)
    expect(await Session.count({})).toEqual(1)
  }
  {
    let ctx0 = {
      ...ctx,
      request: {
        params: {sid: sess1._id}
      },
      session: sess1
    }
    let body = await deleteSession(ctx0)
    expect(body).toEqual({})
    expect(ctx0.session).toEqual({})
    expect(await Session.count({})).toEqual(0)
  }
})

test('deleteMySession', async () => {
  let {Group, User, Preference} = ctx.models
  let title = await Preference.create({
    _id: '_id001',
    pid: PREFERENCE.TITLE,
    val: 'Title',
  })
  let top = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
    role: GROUP_ROLE.TOP,
  })
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let sess1 = await user1.createSession({
    _id: 'sess01',
    gids: [],
    oids: [],
    provider: PROVIDER.PASSWORD,
  })
  {
    let ctx0 = {
      ...ctx,
      request: {},
      session: sess1.get({plain: true})
    }
    let body = await deleteMySession(ctx0)
    expect(body).toEqual({
      title: {val: title.val},
      top: {name: top.name},
      session: {},
    })
    expect(ctx0.session).toEqual({})
  }
})

test('revokeManager', async () => {
  let {Group, User, Session, Preference} = ctx.models
  await Preference.create({
    _id: '_id001',
    pid: PREFERENCE.TITLE,
    val: 'Title',
  })
  await Group.create({
    _id: 'gid001',
    name: 'Group 1',
    role: GROUP_ROLE.TOP,
  })
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let sess1 = await user1.createSession({
    _id: 'sess01',
    isManager: true,
    isAdmin: true,
    gids: [],
    provider: PROVIDER.PASSWORD,
  })
  expect(await revokeManager({
    ...ctx,
    session: {_id: 'sess02'},
  })).toEqual(
    respondError(ERRORS.DATA_REVISED, {sid: 'sess02'})
  )
  let ctx0 = {
    ...ctx,
    session: sess1.get({plain: true}),
  }
  expect(await revokeManager(ctx0)).toEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        isManager: false,
        isAdmin: true,
      })
    })
  )
  expect(ctx0).toEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        isManager: false,
        isAdmin: true,
      })
    })
  )
  expect(
    await Session.findOne({where: {_id: sess1._id} })
  ).toEqual(
    expect.objectContaining({
      isManager: false,
      isAdmin: true,
    })
  )
})

test('revokeAdmin', async () => {
  let {Group, User, Session, Preference} = ctx.models
  await Preference.create({
    _id: '_id001',
    pid: PREFERENCE.TITLE,
    val: 'Title',
  })
  await Group.create({
    _id: 'gid001',
    name: 'Group 1',
    role: GROUP_ROLE.TOP,
  })
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let sess1 = await user1.createSession({
    _id: 'sess01',
    isManager: true,
    isAdmin: true,
    gids: [],
    provider: PROVIDER.PASSWORD,
  })
  expect(await revokeAdmin({
    ...ctx,
    session: {_id: 'sess02'},
  })).toEqual(
    respondError(ERRORS.DATA_REVISED, {sid: 'sess02'})
  )
  let ctx0 = {
    ...ctx,
    session: sess1.get({plain: true}),
  }
  expect(await revokeAdmin(ctx0)).toEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        isManager: true,
        isAdmin: false,
      })
    })
  )
  expect(ctx0).toEqual(
    expect.objectContaining({
      session: expect.objectContaining({
        isManager: true,
        isAdmin: false,
      })
    })
  )
  expect(
    await Session.findOne({where: {_id: sess1._id} })
  ).toEqual(
    expect.objectContaining({
      isManager: true,
      isAdmin: false,
    })
  )
})
