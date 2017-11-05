/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'
import {LOG_LEVEL, PROVIDER, ERRORS} from '../../constants'
import {respondError} from '../../helper'
import {sleep, conf, deleteAll, log} from '../../testHelper'
import sessionStore from '../sessionStore'

const middleware = sessionStore()
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

test('sessionStore', async () => {
  const {User, Session} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  {
    const next = jest.fn()
    let opt = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: (key, options) => {
          opt = options
          return key === conf.sid ? null : 'error'        
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, next)
    expect(ctx0.session).toEqual({})
    expect(log.count()).toEqual(0)
    expect(opt).not.toBeDefined()
    expect(next).toHaveBeenCalled()
  }
  let sess1 = await user1.createSession({
    _id: 'sid001',
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
  })
  {
    const next = jest.fn()
    let opt = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: (key, options) => {
          opt = options
          return key === conf.sid ? null : 'error'        
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, next)
    expect(ctx0.session).toEqual({})
    expect(log.count()).toEqual(0)
    expect(opt).not.toBeDefined()
    expect(next).toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let opt = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: (key, options) => {
          opt = options
          return key === conf.sid ? 'sid002' : 'error'        
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, next)
    expect(ctx0.session).toEqual({})
    expect(log.count()).toEqual(1)
    expect(log.last()).toEqual({
      level: LOG_LEVEL.WARN,
      rec : {
        function: 'restoreSession',
        action: 'failed to restore',
        sid: 'sid002',
      }
    })
    log.clear()
    expect(opt).toEqual({signed: true})
    expect(next).toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let opt = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: (key, options) => {
          opt = options
          return key === conf.sid ? sess1._id : 'error'        
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, next)
    expect(ctx0.session).toEqual(sess1.get({plain: true}))
    expect(log.count()).toEqual(0)
    expect(opt).toEqual({signed: true})
    expect(next).toHaveBeenCalled()
  }
  await sleep(conf.expires + 1)
  {
    const next = jest.fn()
    let opt = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: (key, options) => {
          opt = options
          return key === conf.sid ? sess1._id : 'error'        
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, next)
    expect(ctx0.session).toEqual({})
    expect(log.count()).toEqual(1)
    expect(log.last()).toEqual({
      level: LOG_LEVEL.WARN,
      rec : {
        function: 'restoreSession',
        action: 'delete expired',
        sid: sess1._id,
      }
    })
    log.clear()
    expect(await Session.count({})).toEqual(0)
    expect(opt).toEqual({signed: true})
    expect(next).not.toHaveBeenCalled()
    expect(ctx0.response.body).toEqual(respondError(ERRORS.SESSION_EXPIRED))
  }
  {
    let opt = {}
    let res = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: key => key === conf.sid ? null : 'error',
        set: (key, sid, options) => {
          opt = options
          res = key === conf.sid ? sid : 'error'
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, () => {ctx0.session._id = 'sid001'})
    expect(ctx0.session).toEqual({_id: 'sid001'})
    expect(log.count()).toEqual(1)
    expect(log.last()).toEqual({
      level: LOG_LEVEL.INFO,
      rec: {
        function: 'sessionStore',
        action: 'return sid',
        sid: 'sid001',
      }
    })
    log.clear()
    expect(opt).toEqual({signed: true, overwrite: true})
    expect(res).toEqual('sid001')
  }
  let sess2 = await user1.createSession({
    _id: 'sid002',
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
  })
  {
    let opt = {}
    let res = {}
    let ctx0 = {
      ...ctx,
      cookies: {
        get: key => key === conf.sid ? sess2._id : 'error',
        set: (key, sid, options) => {
          opt = options
          res = key === conf.sid ? sid : 'error'
        }
      },
      log,
      session: {},
      response: {},
    }
    await middleware(ctx0, () => {ctx0.session = {}})
    expect(ctx0.session).toEqual({})
    expect(log.count()).toEqual(1)
    expect(log.last()).toEqual({
      level: LOG_LEVEL.INFO,
      rec: {
        function: 'sessionStore',
        action: 'return sid',
        sid: '',
      }
    })
    log.clear()
    expect(opt).toEqual({signed: true, overwrite: true})
    expect(res).toEqual('')
  }
})
