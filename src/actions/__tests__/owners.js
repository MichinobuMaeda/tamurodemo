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
import {setOwners} from '../owners'

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

test('setOwners', async () => {
  let {Group, User} = ctx.models
  {
    expect(await setOwners({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {oids: []},
      },
      throw: throwCode,
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', oids: []},
    ))
  }
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  {
    await expect(setOwners({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {oids: ['uid001']},
      },
      throw: throwCode,
    })).rejects.toBeDefined()
  }
  let user1 = await User.create({_id: 'uid001', name: 'User 1'})
  let user2 = await User.create({_id: 'uid002', name: 'User 2'})
  let user3 = await User.create({_id: 'uid003', name: 'User 3'})
  let user4 = await User.create({_id: 'uid004', name: 'User 4'})
  {
    let body = await setOwners({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {oids: [user1._id, user2._id, user3._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [],
      users: [],
      owners: [
        {_id: user1._id, name: user1.name},
        {_id: user2._id, name: user2.name},
        {_id: user3._id, name: user3.name},
      ],
    })
  }
  {
    let body = await setOwners({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {oids: [user1._id, user4._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [],
      users: [],
      owners: [
        {_id: user1._id, name: user1.name},
        {_id: user4._id, name: user4.name},
      ],
    })
  }
})
