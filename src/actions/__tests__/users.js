/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS} from '../../constants'
import {respondError} from '../../helper'
import {model} from '../../model'
import {conf, deleteAll, throwCode} from '../../testHelper'
import {
  getUsers, getUser, updateUser, deleteUser, setGroupsOfUser, filterUser
} from '../users'

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

test('getUsers', async () => {
  let {User} = ctx.models
  expect(await getUsers(ctx)).toEqual([])
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
    desc: 'Description 1',
  })
  expect(await getUsers(ctx)).toEqual([
    {_id: user1._id, name: user1.name},
  ])
  let user2 = await User.create({
    _id: 'uid002',
    name: 'User 2',
    desc: 'Description 2',
  })
  let users = await getUsers(ctx)
  expect(users).toHaveLength(2)
  expect(users).toEqual(
    expect.arrayContaining([
      {_id: user1._id, name: user1.name},
      {_id: user2._id, name: user2.name},
    ])
  )
})

test('getUser', async () => {
  let {Group, User} = ctx.models
  {
    expect(await getUser({
      ...ctx,
      request: {
        params: {uid: 'uid001'}
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: 'uid001'},
    ))
  }
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
  })
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        p: ['gid001'],
        item1: {v: 'Item 1', p: ['gid001']},
        item2: {v: 'Item 2', p: []},
      },
      {
        title: 'Profile 1',
        p: [],
        item1: {v: 'Item 1', p: []},
      },
    ],
  })
  await group1.addUser(user1)
  await group2.addOwner(user1)
  {
    let body = await getUser({
      ...ctx,
      request: {
        params: {uid: user1._id}
      },
      session: {uid: 'uid001', isManager: true},
    })
    expect(body).toEqual({
      ...user1.get({plain: true}),
      groups: [{_id: 'gid001', name: 'Group 1', role: null}],
      ownedGroups: [{_id: 'gid002', name: 'Group 2', role: null}],
      certs: [],
    })
  }
  {
    let body = await getUser({
      ...ctx,
      request: {
        params: {uid: user1._id}
      },
      session: {uid: 'uid002', gids: ['gid001']},
    })
    expect(body).toEqual({
      ...user1.get({plain: true}),
      groups: [{_id: 'gid001', name: 'Group 1', role: null}],
      ownedGroups: [{_id: 'gid002', name: 'Group 2', role: null}],
      certs: [],
      profiles: [
        {
          title: 'Profile 1',
          item1: {v: 'Item 1'},
        },
      ],
    })
  }
  let user2 = await group1.createUser({
    _id: 'uid002',
    name: 'User 2',
  })
  {
    let body = await getUser({
      ...ctx,
      request: {
        params: {uid: user2._id}
      },
      session: {uid: 'uid001', gids: ['gid001']},
    })
    expect(body).toEqual({
      ...user2.get({plain: true}),
      groups: [{_id: 'gid001', name: 'Group 1', role: null}],
      ownedGroups: [],
      certs: [],
      profiles: [],
    })
  }
})

test('updateUser', async () => {
  let {User} = ctx.models
  {
    expect(await updateUser({
      ...ctx,
      request: {
        params: {uid: 'uid001', ver: '1'},
        body: {_id: 'uid001', ver: 1, name: 'User 2'}
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: 'uid001', ver: 1},
    ))
  }
  {
    let user1 = await User.create({
      _id: 'uid001',
      name: 'User 1',
    })
    let body = await updateUser({
      ...ctx,
      request: {
        params: {uid: user1._id, ver: `${user1.ver}`},
        body: {_id: user1._id, ver: user1.ver, name: 'User 2'}
      },
      session: {uid: user1._id},
    })
    expect(body).toEqual(
      expect.objectContaining({
        _id: user1._id,
        ver: user1.ver + 1,
        name: 'User 2',
        groups: [],
        ownedGroups: [],
      })
    )
  }
  {
    let user1 = (await User.findOne({where: {_id: 'uid001'}})).get({plain: true})
    expect(await updateUser({
      ...ctx,
      request: {
        params: {uid: 'uid001', ver: `${user1.ver - 1}`},
        body: {_id: user1._id, ver: user1.ver - 1, name: 'User 3'}
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: 'uid001', ver: user1.ver - 1},
    ))
  }
  {
    let user1 = (await User.findOne({where: {_id: 'uid001'}})).get({plain: true})
    await expect(updateUser({
      ...ctx,
      request: {
        params: {uid: 'uid001', ver: `${user1.ver}`},
        body: {_id: user1._id, ver: user1.ver, name: ''}
      },
      session: {uid: 'uid001'},
    })).rejects.toBeDefined()
  }
})

test('deleteUser', async () => {
  let {User} = ctx.models
  {
    expect(await deleteUser({
      ...ctx,
      request: {
        params: {uid: 'uid001', ver: '1'},
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: 'uid001', ver: 1},
    ))
  }
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  {
    expect(await deleteUser({
      ...ctx,
      request: {
        params: {uid: 'uid002', ver: '1'},
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: 'uid002', ver: 1},
    ))
  }
  {
    expect(await deleteUser({
      ...ctx,
      request: {
        params: {uid: user1._id, ver: `${user1.ver + 1}`},
      },
      session: {uid: 'uid001'},
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: user1._id, ver: user1.ver + 1},
    ))
  }
  {
    let body = await deleteUser({
      ...ctx,
      request: {
        params: {uid: user1._id, ver: `${user1.ver}`},
      },
      session: {uid: 'uid001'},
    })
    expect(body).toEqual({})
  }
})

test('filterUser', () => {
  expect(filterUser({
    _id: 'uid001',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        p: ['gid001', 'gid002'],
        item1: {v: 'Item 1', p: ['gid001', 'gid002']},
        item2: {v: 'Item 2', p: ['gid002']},
        item3: {v: 'Item 3', p: []},
      },
      {
        title: 'Profile 2',
        p: [],
        item1: {v: 'item 1', p: []},
      },
    ],
  },
  {
    uid: 'uid001',
    gids: ['gid001'],
    isManager: false
  })).toEqual({
    _id: 'uid001',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        p: ['gid001', 'gid002'],
        item1: {v: 'Item 1', p: ['gid001', 'gid002']},
        item2: {v: 'Item 2', p: ['gid002']},
        item3: {v: 'Item 3', p: []},
      },
      {
        title: 'Profile 2',
        p: [],
        item1: {v: 'item 1', p: []},
      },
    ],
  })
  expect(filterUser({
    _id: 'uid001',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        p: ['gid001', 'gid002'],
        item1: {v: 'Item 1', p: ['gid001', 'gid002']},
        item2: {v: 'Item 2', p: ['gid002']},
        item3: {v: 'Item 3', p: []},
      },
      {
        title: 'Profile 2',
        p: [],
        item1: {v: 'item 1', p: []},
      },
    ],
  },
  {
    uid: 'uid002',
    gids: ['gid001'],
    isManager: true
  })).toEqual({
    _id: 'uid001',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        p: ['gid001', 'gid002'],
        item1: {v: 'Item 1', p: ['gid001', 'gid002']},
        item2: {v: 'Item 2', p: ['gid002']},
        item3: {v: 'Item 3', p: []},
      },
      {
        title: 'Profile 2',
        p: [],
        item1: {v: 'item 1', p: []},
      },
    ],
  })
  expect(filterUser({
    _id: 'uid001',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        p: ['gid001', 'gid002'],
        item1: {v: 'Item 1', p: ['gid001', 'gid002']},
        item2: {v: 'Item 2', p: ['gid002']},
        item3: {v: 'Item 3', p: []},
      },
      {
        title: 'Profile 2',
        p: [],
        item1: {v: 'item 1', p: []},
      },
    ],
  },
  {
    uid: 'uid002',
    gids: ['gid001'],
    isManager: false
  })).toEqual({
    _id: 'uid001',
    desc: 'Description 1',
    profiles: [
      {
        title: 'Profile 1',
        item1: {v: 'Item 1'},
      },
    ],
  })
})

test('setGroupsOfUser', async () => {
  let {User, Group} = ctx.models
  {
    expect(await setGroupsOfUser({
      ...ctx,
      request: {
        params: {uid: 'uid001'},
        body: {gids: []},
      },
      throw: throwCode,
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {uid: 'uid001', gids: []},
    ))
  }
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  {
    await expect(setGroupsOfUser({
      ...ctx,
      request: {
        params: {uid: `${user1._id}`},
        body: {gids: ['gid002']},
      },
      throw: throwCode,
    })).rejects.toBeDefined()
  }
  let group2 = await Group.create({_id: 'gid002', name: 'Group 2'})
  let group3 = await Group.create({_id: 'gid003', name: 'Group 3'})
  let group4 = await Group.create({_id: 'gid004', name: 'Group 4'})
  let group5 = await Group.create({_id: 'gid005', name: 'Group 5'})
  {
    let body = await setGroupsOfUser({
      ...ctx,
      request: {
        params: {uid: `${user1._id}`},
        body: {gids: [group2._id, group3._id, group4._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...user1.get({plain: true}),
      groups: [
        {_id: group2._id, name: group2.name, role: null},
        {_id: group3._id, name: group3.name, role: null},
        {_id: group4._id, name: group4.name, role: null},
      ],
      certs: [],
      ownedGroups: [],
    })
  }
  {
    let body = await setGroupsOfUser({
      ...ctx,
      request: {
        params: {uid: `${user1._id}`},
        body: {gids: [group2._id, group5._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...user1.get({plain: true}),
      groups: [
        {_id: group2._id, name: group2.name, role: null},
        {_id: group5._id, name: group5.name, role: null},
      ],
      certs: [],
      ownedGroups: [],
    })
  }
})
