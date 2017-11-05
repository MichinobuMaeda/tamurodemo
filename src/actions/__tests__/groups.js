/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'
import {GROUP_ROLE, ERRORS} from '../../constants'
import {respondError} from '../../helper'
import {conf, deleteAll, throwCode} from '../../testHelper'
import {
  getGroups, getGroup, updateGroup, deleteGroup, setGroupsOfGroup
} from '../groups'

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

test('getGroups', async () => {
  let {Group} = ctx.models
  expect(await getGroups(ctx)).toEqual([])
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
    desc: 'Description 1',
  })
  expect(await getGroups(ctx)).toEqual([
    {_id: group1._id, name: group1.name, role: null},
  ])
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
    role: GROUP_ROLE.MANAGER,
    desc: 'Description 2',
  })
  let groups = await getGroups(ctx)
  expect(groups).toHaveLength(2)
  expect(groups).toEqual(
    expect.arrayContaining([
      {_id: group1._id, name: group1.name, role: null},
      {_id: group2._id, name: group2.name, role: GROUP_ROLE.MANAGER},
    ])
  )
})

test('getGroup', async () => {
  let {Group, User} = ctx.models
  {
    expect(await getGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'}
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001'},
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
  })
  {
    let body = await getGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'}
      },
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [],
      users: [],
      owners: [],
    })
  }
  await group1.addSubGroup(group2)
  await group1.addUser(user1)
  {
    let body = await getGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'}
      },
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [{_id: 'gid002', name: 'Group 2', role: null}],
      users: [{_id: 'uid001', name: 'User 1'}],
      owners: [],
    })
  }
})

test('updateGroup', async () => {
  let {Group} = ctx.models
  {
    expect(await updateGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001', ver: '1'},
        body: {name: 'Group 2'}
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', ver: 1},
    ))
  }
  {
    let group1 = await Group.create({
      _id: 'gid001',
      name: 'Group 1',
    })
    let body = await updateGroup({
      ...ctx,
      request: {
        params: {gid: group1._id, ver: group1.ver},
        body: {name: 'Group 2'}
      },
    })
    expect(body).toEqual(
      expect.objectContaining({
        _id: group1._id,
        ver: group1.ver + 1,
        name: 'Group 2',
        groups: [],
        subGroups: [],
        users: [],
        owners: [],
      })
    )
  }
  {
    let group1 = (await Group.findOne({where: {_id: 'gid001'}})).get({plain: true})
    expect(await updateGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001', ver: `${group1.ver - 1}`},
        body: {_id: group1._id, ver: group1.ver - 1, name: 'Group 3'}
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', ver: group1.ver - 1},
    ))
  }
  {
    let group1 = (await Group.findOne({where: {_id: 'gid001'}})).get({plain: true})
    await expect(updateGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001', ver: `${group1.ver}`},
        body: {_id: group1._id, ver: group1.ver, name: ''}
      },
    })).rejects.toBeDefined()
  }
})

test('deleteGroup', async () => {
  let {Group} = ctx.models
  {
    expect(await deleteGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001', ver: '1'},
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', ver: 1},
    ))
  }
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  {
    expect(await deleteGroup({
      ...ctx,
      request: {
        params: {gid: 'gid002', ver: '1'},
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid002', ver: 1},
    ))
  }
  {
    expect(await deleteGroup({
      ...ctx,
      request: {
        params: {gid: group1._id, ver: `${group1.ver + 1}`},
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: group1._id, ver: group1.ver + 1},
    ))
  }
  {
    let body = await deleteGroup({
      ...ctx,
      request: {
        params: {gid: group1._id, ver: group1.ver},
      },
    })
    expect(body).toEqual({})
  }
})

test('setGroupsOfGroup', async () => {
  let {Group} = ctx.models
  {
    expect(await setGroupsOfGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {gids: []},
      },
      throw: throwCode,
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', gids: []},
    ))
  }
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  {
    await expect(setGroupsOfGroup({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
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
    let body = await setGroupsOfGroup({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {gids: [group2._id, group3._id, group4._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [
        {_id: group2._id, name: group2.name, role: null},
        {_id: group3._id, name: group3.name, role: null},
        {_id: group4._id, name: group4.name, role: null},
      ],
      subGroups: [],
      users: [],
      owners: [],
    })
  }
  {
    let body = await setGroupsOfGroup({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {gids: [group2._id, group5._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [
        {_id: group2._id, name: group2.name, role: null},
        {_id: group5._id, name: group5.name, role: null},
      ],
      subGroups: [],
      users: [],
      owners: [],
    })
  }
})
