/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {PRIV} from '../../constants'
import {model} from '../../model'
import {conf, throwCode, deleteAll} from '../../testHelper'
import actionRunner from '../actionRunner'

const middleware = actionRunner()
var ctx = {}

beforeAll(async () => {
  let models = await model(conf)
  ctx = {conf, models}
})

beforeEach(async () => {
  await deleteAll(ctx.models)
})

afterAll(async () => {
  await deleteAll(ctx.models)
  await ctx.models.db.close()
})

test('actionRunner', async () => {
  {
    const next = jest.fn()
    let ctx0 = {
      ...ctx,
      route: {
        params: {},
        priv: PRIV.ADMIN,
      },
      session: {},
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx0, next)).rejects.toEqual(
      expect.objectContaining({status: 404})
    )
    expect(next).not.toHaveBeenCalled()
  }
  let {Group} = ctx.models
  expect((await Group.count())).toEqual(0)
  {
    const next = jest.fn()
    let ctx0 = {
      ...ctx,
      route: {
        params: {},
        priv: PRIV.ADMIN,
        action: async ctx => {
          let {Group} = ctx.models
          let group1 = await Group.create({
            _id: 'id0001',
            name: 'Group 1',
          })
          return group1.get({plain: true})
        },
      },
      session: {},
      response: {},
      throw: throwCode,
    }
    await middleware(ctx0, next)
    expect(ctx0.response.body._id).toEqual('id0001')
    expect(next).not.toHaveBeenCalled()
  }
  expect((await Group.count())).toEqual(1)
  {
    const next = jest.fn()
    let ctx0 = {
      ...ctx,
      route: {
        params: {},
        priv: PRIV.ADMIN,
        action: async ctx => {
          let {Group} = ctx.models
          let group1 = await Group.findOne({where: {_id: 'id0001'}})
          return group1.get({plain: true})
        },
      },
      session: {},
      response: {},
      throw: throwCode,
    }
    await middleware(ctx0, next)
    expect(ctx0.response.body._id).toEqual('id0001')
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx0 = {
      ...ctx,
      route: {
        params: {},
        priv: PRIV.ADMIN,
        action: async ctx => {
          let {Group} = ctx.models
          await Group.create({
            _id: 'id0002',
            name: 'Group 2',
          })
          let group1 = await Group.create({
            _id: 'id0001',
            name: 'Group 1',
          })
          return group1.get({plain: true})
        },
      },
      session: {},
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx0, next)).rejects.toBeDefined()
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx0 = {
      ...ctx,
      route: {
        params: {},
        priv: PRIV.ADMIN,
        action: ctx => {
          ctx.throw(409)
        }
      },
      session: {},
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx0, next)).rejects.toEqual(
      expect.objectContaining({status: 409})
    )
    expect(next).not.toHaveBeenCalled()
  }
  expect((await Group.count())).toEqual(1)
})
