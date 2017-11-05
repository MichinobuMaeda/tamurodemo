/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'

import {PROVIDER, GROUP_ROLE, ERRORS} from '../../constants'
import {respondError} from '../../helper'
import {conf, deleteAll} from '../../testHelper'
import {createToken, getInvitees, getToken} from '../token'

var ctx = {}

const tokenUrl = (conf, sid) => `${conf.appUrl.replace(/\/$/, '')}${conf.basePath}/token/${sid}`

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

test('createToken', async () => {
  let {User, Session} = ctx.models
  expect(await createToken({
    ...ctx,
    request: {
      body: {uid: 'uid001'},
    },
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: 'uid001'}
  ))
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let res = await createToken({
    ...ctx,
    request: {
      body: {uid: user1._id},
    },
  })
  let sess1 = await Session.findOne({where: {uid: user1._id} })
  expect(res).toEqual({url: tokenUrl(conf, sess1._id)})
  await user1.createCert({
    _id: 'cert01',
    provider: PROVIDER.PASSWORD,
    key: 'dummy',
  })
  expect(await createToken({
    ...ctx,
    request: {
      body: {uid: user1._id},
    },
  })).toEqual(respondError(
    ERRORS.CERT_CREATED,
    {uid: 'uid001'}
  ))
})

test('getInvitees', async () => {
  let {User} = ctx.models
  expect(await getInvitees(ctx)).toEqual([])
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
    desc: 'Description 1',
  })
  let user2 = await User.create({
    _id: 'uid002',
    name: 'User 2',
    desc: 'Description 2',
  })
  expect(await getInvitees(ctx)).toEqual([
    {_id: user1._id, name: user1.name, token: null},
    {_id: user2._id, name: user2.name, token: null},
  ])
  await user1.createCert({
    provider: PROVIDER.TOKEN,
    key: 'key001',
  })
  await user2.createSession({
    _id: 'sid001',
    provider: PROVIDER.TOKEN,
  })
  expect(await getInvitees(ctx)).toEqual([
    {_id: user2._id, name: user2.name, token: tokenUrl(conf, 'sid001')},
  ])
})

test('getToken', async () => {
  let {Group, User, Session} = ctx.models
  {
    const redirect = jest.fn()
    expect(await getToken({
      ...ctx,
      request: {
        params: {token: 'sid001'},
      },
      redirect,
      session: {}
    })).toEqual(
      respondError(ERRORS.SESSION_EXPIRED, {sid: 'sid001'})
    )
    expect(redirect).not.toHaveBeenCalled()
  }
  await Group.create({
    _id: 'gid001',
    name: 'Group 1',
    role: GROUP_ROLE.TOP,
  })
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let sess1 = await Session.create({
    _id: 'sid001',
    uid: user1._id,
    provider: PROVIDER.TOKEN,
    gids: [],
    oids: [],
    isAdmin: false,
    isManager: false,
  })
  {
    const redirect = jest.fn()
    expect(await getToken({
      ...ctx,
      request: {
        params: {token: sess1._id},
      },
      redirect,
      session: {}
    })).toEqual({})
    expect(redirect.mock.calls.length).toBe(1)
    expect(redirect.mock.calls[0][0]).toEqual(ctx.conf.appUrl)
  }
  await user1.createCert({
    _id: 'cert01',
    provider: PROVIDER.PASSWORD,
    key: 'dummy',
  })
  {
    const redirect = jest.fn()
    expect(await getToken({
      ...ctx,
      request: {
        params: {token: 'sid001'},
      },
      redirect,
      session: {}
    })).toEqual(
      respondError(ERRORS.CERT_CREATED, {sid: sess1._id, uid: user1._id})
    )
    expect(redirect).not.toHaveBeenCalled()
  }
})
