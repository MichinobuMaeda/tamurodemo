/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS, GROUP_ROLE} from '../../constants'
import {respondError} from '../../helper'
import {model} from '../../model'
import {conf, deleteAll, throwCode} from '../../testHelper'
import {createSubGroup, setSubGroups} from '../subGroups'

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

test('createSubGroup', async () => {
  let {Group} = ctx.models
  {
    expect(await createSubGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {name: 'Group 2'}
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
  {
    let body = await createSubGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {name: 'Group 2', role: GROUP_ROLE.MANAGER}
      },
    })
    expect(body._id).toBeDefined()
    let group2 = await Group.findOne({where: {name: 'Group 2'}})
    expect(body).toEqual(
      expect.objectContaining({
        ...group1.get({plain: true}),
        groups: [],
        subGroups: [{_id: group2._id , name: 'Group 2', role: GROUP_ROLE.MANAGER}],
        users: [],
        owners: [],
      })
    )
  }
  {
    expect(await createSubGroup({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {name: 'Group 2'}
      },
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001'},
    ))
  }
})

test('setSubGroups', async () => {
  let {Group} = ctx.models
  {
    expect(await setSubGroups({
      ...ctx,
      request: {
        params: {gid: 'gid001'},
        body: {sids: []},
      },
      throw: throwCode,
    })).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {gid: 'gid001', sids: []},
    ))
  }
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  {
    await expect(setSubGroups({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {sids: ['gid002']},
      },
      throw: throwCode,
    })).rejects.toBeDefined()
  }
  let group2 = await Group.create({_id: 'gid002', name: 'Group 2'})
  let group3 = await Group.create({_id: 'gid003', name: 'Group 3'})
  let group4 = await Group.create({_id: 'gid004', name: 'Group 4'})
  let group5 = await Group.create({_id: 'gid005', name: 'Group 5'})
  {
    let body = await setSubGroups({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {sids: [group2._id, group3._id, group4._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [
        {_id: group2._id, name: group2.name, role: null},
        {_id: group3._id, name: group3.name, role: null},
        {_id: group4._id, name: group4.name, role: null},
      ],
      users: [],
      owners: [],
    })
  }
  {
    let body = await setSubGroups({
      ...ctx,
      request: {
        params: {gid: `${group1._id}`},
        body: {sids: [group2._id, group5._id]},
      },
      throw: throwCode,
    })
    expect(body).toEqual({
      ...group1.get({plain: true}),
      groups: [],
      subGroups: [
        {_id: group2._id, name: group2.name, role: null},
        {_id: group5._id, name: group5.name, role: null},
      ],
      users: [],
      owners: [],
    })
  }
})
