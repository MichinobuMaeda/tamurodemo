/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {PRIV} from '../../constants'
import {throwCode} from '../../testHelper'
import authorizer from '../authorizer'

const middleware = authorizer()

test('authorizer PRIV.ADMIN', async () => {
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.ADMIN,
      },
      session: {},
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.ADMIN,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.ADMIN,
      },
      session: {
        uid: 'uid001',
        isAdmin: true,
        isManager: false,
      },
      request: {
        params: {},
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
})

test('authorizer PRIV.MANAGER', async () => {
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.MANAGER,
      },
      session: {},
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.MANAGER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.MANAGER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: true,
      },
      request: {
        params: {},
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
})

test('authorizer PRIV.OWNER', async () => {
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.OWNER,
      },
      session: {},
      request: {
        params: {
          uid: 'uid001',
          oids: [],
        },
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.OWNER,
      },
      session: {
        uid: 'uid001',
        oids: ['gid001'],
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.OWNER,
      },
      session: {
        uid: 'uid001',
        oids: [],
        isAdmin: false,
        isManager: true,
      },
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.OWNER,
      },
      session: {
        uid: 'uid001',
        oids: ['gid002'],
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {
          gid: 'gid001',
        },
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.OWNER,
      },
      session: {
        uid: 'uid001',
        oids: ['gid001'],
        isAdmin: false,
        isManager: true,
      },
      request: {
        params: {
          uid: 'uid02'
        },
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
  {
    let ctx = {
      route: {
        priv: PRIV.OWNER,
      },
      session: {
        uid: 'uid001',
        oids: ['gid001'],
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {
          gid: 'gid001'
        },
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
})

test('authorizer PRIV.USER', async () => {
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.USER,
      },
      session: {},
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.USER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.USER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: true,
      },
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.USER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {
          uid: 'uid002'
        },
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.USER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: true,
      },
      request: {
        params: {
          uid: 'uid02'
        },
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
  {
    let ctx = {
      route: {
        priv: PRIV.USER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {
          uid: 'uid001'
        },
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
})

test('authorizer PRIV.MEMBER', async () => {
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: PRIV.MEMBER,
      },
      session: {},
      request: {
        params: {},
      },
      response: {},
      throw: throwCode,
    }
    await expect(middleware(ctx, next)).rejects.toEqual(
      expect.objectContaining({status: 403})
    )
    expect(next).not.toHaveBeenCalled()
  }
  {
    let ctx = {
      route: {
        priv: PRIV.MEMBER,
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {},
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
})

test('authorizer PRIV.GUEST', async () => {
  {
    let ctx = {
      route: {
        priv: PRIV.GUEST,
      },
      session: {},
      request: {
        params: {},
      },
      response: {},
    }
    await middleware(ctx, () => {ctx.response.body = {}})
    expect(ctx.response).toEqual({
      body: {},
    })
  }
})

test('authorizer other', async () => {
  {
    const next = jest.fn()
    let ctx = {
      route: {
        priv: 'dummy',
      },
      session: {
        uid: 'uid001',
        isAdmin: false,
        isManager: false,
      },
      request: {
        params: {},
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
