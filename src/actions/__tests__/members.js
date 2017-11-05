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
import {createMember, setMembers} from '../members'

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

test('createMember', async () => {
  let {Group, User} = ctx.models
  {
    expect(await createMember({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {name: 'User 1'}
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001'},
    ))
  }
  await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  {
    let body = await createMember({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {name: 'User 1'}
      },
    })
    expect(body._id).toBeDefined()
    let user1 = await User.findOne({name: 'User 1'})
    expect(body).toEqual(
      expect.objectContaining({
        name: 'Group 1',
        groups: [],
        users: [{_id: user1._id, name: 'User 1'}],
        subGroups: [],
      })
    )
  }
  {
    expect(await createMember({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {name: 'User 1'}
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001'},
    ))
  }
})

test('setMembers', async () => {
  let {Group, User} = ctx.models
  {
    expect(await setMembers({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {uids: []},
      },
      throw: throwCode,
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', uids: []},
    ))
  }
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  {
    await expect(setMembers({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {uids: ['uid001']},
      },
      throw: throwCode,
    })).rejects.toBeDefined()
  }
  let user1 = await User.create({_id: 'uid001', name: 'User 1'})
  let user2 = await User.create({_id: 'uid002', name: 'User 2'})
  let user3 = await User.create({_id: 'uid003', name: 'User 3'})
  let user4 = await User.create({_id: 'uid004', name: 'User 4'})
  {
    let body = await setMembers({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {uids: [user1._id, user2._id, user3._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [],
      users: [
        {_id: user1._id, name: user1.name},
        {_id: user2._id, name: user2.name},
        {_id: user3._id, name: user3.name},
      ],
      owners: [],
    })
  }
  {
    let body = await setMembers({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {uids: [user1._id, user4._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [],
      users: [
        {_id: user1._id, name: user1.name},
        {_id: user4._id, name: user4.name},
      ],
      owners: [],
    })
  }
})
  