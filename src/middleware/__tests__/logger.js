/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {LOG_LEVEL} from '../../constants'
import {model} from '../../model'
import {conf, deleteAll, throwCode} from '../../testHelper'
import logger from '../logger'

const middleware = logger()
var ctx0 = {}

beforeAll(async () => {
  let models = await model(conf)
  ctx0 = {conf, models}
})

beforeEach(async () => {
  await deleteAll(ctx0.models)
})

afterAll(async () => {
  await deleteAll(ctx0.models)
  await ctx0.models.db.close()
})

test('logger', async () => {
  const {Log} = ctx0.models
  expect((await Log.count())).toEqual(0)
  
  await middleware({
    ...ctx0,
    request: {
      method: 'GET',
      path: '/test',
    },
    response: {},
    cookies: {get: sid => sid === conf.sid ? 'sid001' : 'error'},
  }, () => null)
  let count = 0
  expect((await Log.count())).toEqual(count)

  {
    await middleware({
      ...ctx0,
      request: {
        method: 'POST',
        path: '/test',
      },
      response: {},
      cookies: {get: sid => sid === conf.sid ? 'sid001' : 'error'},
    }, () => null)
    expect((await Log.count())).toEqual(++count)
    let log = await Log.findOne({order: [['createdAt', 'DESC']]})
    expect(log.level).toEqual(LOG_LEVEL.INFO)
    expect(log.sid).toEqual('sid001')
    expect(log.rec).toEqual({
      method: 'POST',
      path: '/test',
    })
  }

  {
    let ctx = {
      ...ctx0,
      request: {
        method: 'GET',
        path: '/test',
      },
      response: {},
      cookies: {get: sid => sid === conf.sid ? null : 'error'},
    }
    await middleware(ctx, () => {
      ctx.response['body'] = {errors: [{path: 'uid', req: 'reference'}]}
    })
    expect((await Log.count())).toEqual(++count)
    let log = await Log.findOne({order: [['createdAt', 'DESC']]})
    expect(log.level).toEqual(LOG_LEVEL.ERROR)
    expect(log.sid).toEqual('unknown')
    expect(log.rec).toEqual({
      errors: [{path: 'uid', req: 'reference'}]
    })
  }

  {
    let ctx = {
      ...ctx0,
      request: {method: 'GET'},
      response: {body: {}},
      cookies: {get: sid => sid === conf.sid ? 'sid003' : 'error'},
    }
    await middleware(ctx, () => ctx.log.info({a: 'x'}))
    expect((await Log.count())).toEqual(++count)
    let log = await Log.findOne({order: [['createdAt', 'DESC']]})
    expect(log.level).toEqual(LOG_LEVEL.INFO)
    expect(log.sid).toEqual('sid003')
    expect(log.rec).toEqual({a: 'x'})
  }
  
  {
    let ctx = {
      ...ctx0,
      request: {method: 'GET'},
      response: {body: {}},
      cookies: {get: sid => sid === conf.sid ? 'sid003' : 'error'},
    }
    await middleware(ctx, () => ctx.log.warn({b: 'y'}))
    expect((await Log.count())).toEqual(++count)
    let log = await Log.findOne({order: [['createdAt', 'DESC']]})
    expect(log.level).toEqual(LOG_LEVEL.WARN)
    expect(log.sid).toEqual('sid003')
    expect(log.rec).toEqual({b: 'y'})
  }

  {
    let ctx = {
      ...ctx0,
      request: {method: 'GET'},
      response: {body: {}},
      cookies: {get: sid => sid === conf.sid ? 'sid003' : 'error'},
    }
    await middleware(ctx, () => ctx.log.error({c: 'z'}))
    expect((await Log.count())).toEqual(++count)
    let log = await Log.findOne({order: [['createdAt', 'DESC']]})
    expect(log.level).toEqual(LOG_LEVEL.ERROR)
    expect(log.sid).toEqual('sid003')
    expect(log.rec).toEqual({c: 'z'})
  }

  {
    let ctx = {
      ...ctx0,
      request: {method: 'GET'},
      response: {body: {}},
      cookies: {get: sid => sid === conf.sid ? 'sid003' : 'error'},
      throw: throwCode,
    }
    await expect(middleware(ctx, () => Log.create({}))).rejects.toEqual(
      expect.objectContaining({status: 500})
    )
    expect((await Log.count())).toEqual(++count)
    let log = await Log.findOne({order: [['createdAt', 'DESC']]})
    expect(log.level).toEqual(LOG_LEVEL.ERROR)
    expect(log.sid).toEqual('sid003')
  }
})
