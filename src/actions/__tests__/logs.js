/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'
import {conf, deleteAll} from '../../testHelper'
import {getLogs} from '../logs'

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

test('getLogs', async () => {
  let {Log} = ctx.models
  {
    let body = await getLogs({
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
  await Log.create({_id: 'lid001',})
  await Log.create({_id: 'lid002',})
  {
    let body = await getLogs({
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
    let body = await getLogs({
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
    let body = await getLogs({
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
