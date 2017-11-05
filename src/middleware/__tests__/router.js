/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {METHOD, PRIV} from '../../constants'
import {conf, throwCode} from '../../testHelper'
import router from '../router'

let middleware = router([
  {
    method: METHOD.GET,
    path: '/',
    priv: PRIV.GUEST,
    action: () => 'top',
  },
  {
    method: METHOD.GET,
    path: '/users/(:uid)',
    priv: PRIV.MEMBER,
    action: ({uid}) => uid,
  },
  {
    method: METHOD.GET,
    path: '/groups/(:gid)/users',
    priv: PRIV.MEMBER,
    action: ({gid}) => gid,
  },
  {
    method: METHOD.GET,
    path: '/groups/(:gid)/users/(:uid)',
    priv: PRIV.MEMBER,
    action: ({gid, uid}) => `${gid} ${uid}`,
  },
])

test('router', async () => {
  {
    const next = jest.fn()
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}dummy`,
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 404})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: '/dummy',
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 404})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}`,
      },
      response: {}
    }
    await middleware(ctx, () => {
      expect(ctx.request.params).toEqual({})
      expect(ctx.route.priv).toEqual(PRIV.GUEST)
      expect(ctx.route.action(ctx.request.params)).toEqual('top')
    })
  }
  {
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/`,
      },
      response: {}
    }
    await middleware(ctx, () => {
      expect(ctx.request.params).toEqual({})
      expect(ctx.route.priv).toEqual(PRIV.GUEST)
      expect(ctx.route.action(ctx.request.params)).toEqual('top')
    })
  }
  {
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/users/uid001`,
      },
      response: {}
    }
    await middleware(ctx, () => {
      expect(ctx.request.params).toEqual({uid: 'uid001'})
      expect(ctx.route.priv).toEqual(PRIV.MEMBER)
      expect(ctx.route.action(ctx.request.params)).toEqual('uid001')
    })
  }
  {
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/groups/gid001/users`,
      },
      response: {}
    }
    await middleware(ctx, () => {
      expect(ctx.request.params).toEqual({gid: 'gid001'})
      expect(ctx.route.priv).toEqual(PRIV.MEMBER)
      expect(ctx.route.action(ctx.request.params)).toEqual('gid001')
    })
  }
  {
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/groups/gid001/users/uid001`,
      },
      response: {}
    }
    await middleware(ctx, () => {
      expect(ctx.request.params).toEqual({gid: 'gid001', uid: 'uid001'})
      expect(ctx.route.priv).toEqual(PRIV.MEMBER)
      expect(ctx.route.action(ctx.request.params)).toEqual('gid001 uid001')
    })
  }
  {
    const next = jest.fn()
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/groups//users/uid001`,
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 404})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/groups/gid001/users/`,
      },
      response: {}
    }
    await middleware(ctx, () => {
      expect(ctx.request.params).toEqual({gid: 'gid001'})
      expect(ctx.route.priv).toEqual(PRIV.MEMBER)
      expect(ctx.route.action(ctx.request.params)).toEqual('gid001')
    })
  }
  {
    const next = jest.fn()
    let ctx = {
      conf,
      request: {
        method: METHOD.GET,
        path: `${conf.basePath}/users/uid001/users/uid001`,
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 404})
    )
    expect(next).not.toHaveBeenCalled()
  }
})
