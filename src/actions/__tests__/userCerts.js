/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'
import {PROVIDER, ERRORS} from '../../constants'
import {respondError} from '../../helper'
import {conf, deleteAll, throwCode, testProviders} from '../../testHelper'
import {createUserCert, updateUserCert, deleteUserCert} from '../userCerts'

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

test('createUserCert', async () => {
  let {User, Cert} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  expect(await createUserCert({
    ...ctx,
    request: {
      params: {uid: 'uid001'},
      body: {
        provider: 'dummy',
        id: 'id0001',
        password: 'password01',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.CERT_MISSED,
    {uid: 'uid001', provider: 'dummy'},
  ))
  expect(await createUserCert({
    ...ctx,
    request: {
      params: {uid: 'uid002'},
      body: {
        provider: PROVIDER.PASSWORD,
        id: 'key001',
        password: 'password01',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.CERT_MISSED,
    {uid: 'uid002', provider: PROVIDER.PASSWORD},
  ))
  expect(await createUserCert({
    ...ctx,
    request: {
      params: {uid: 'uid002'},
      body: {
        provider: PROVIDER.PASSWORD,
        id: 'key001',
        password: '',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.CERT_MISSED,
    {uid: 'uid002', provider: PROVIDER.PASSWORD},
  ))
  expect(await createUserCert({
    ...ctx,
    request: {
      params: {uid: user1._id},
      body: {
        provider: PROVIDER.PASSWORD,
        id: 'key001',
        password: 'password01',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(
    expect.objectContaining({
      certs: [
        {provider: PROVIDER.PASSWORD, id: 'key001', ver: 1},
      ]
    })
  )
  expect(await Cert.count({uid: user1._id})).toEqual(1)
  expect(await Cert.find({where: {uid: user1._id, provider: PROVIDER.PASSWORD}}))
    .toEqual(
      expect.objectContaining({
        key: 'key001',
        secret: 'encrypted:password01'
      })
    )
  expect(await createUserCert({
    ...ctx,
    request: {
      params: {uid: user1._id},
      body: {
        provider: PROVIDER.PASSWORD,
        id: 'key001',
        password: 'password01',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.CERT_MISSED,
    {uid: user1._id, provider: PROVIDER.PASSWORD},
  ))
  expect(await createUserCert({
    ...ctx,
    request: {
      params: {uid: user1._id},
      body: {
        provider: PROVIDER.GOOGLE,
        token: 'token001',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(
    expect.objectContaining({
      certs: expect.arrayContaining([
        {provider: PROVIDER.PASSWORD, id: 'key001', ver: 1},
        {provider: PROVIDER.GOOGLE, ver: 1},
      ])
    })
  )
  expect(await Cert.count({uid: user1._id})).toEqual(2)
  expect(await Cert.find({where: {uid: user1._id, provider: PROVIDER.GOOGLE}}))
    .toEqual(
      expect.objectContaining({
        key: 'user id of token:token001',
      })
    )
})

test('updateUserCert', async () => {
  let {User, Cert} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let cert1 = await Cert.create({
    _id: 'cid001',
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
    key: 'key001',
    secret: 'password01',
  })
  expect(await updateUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: 'dummy', ver: cert1.ver},
      body: {
        id: 'id0001',
        password: 'password02',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.CERT_MISSED,
    {uid: cert1.uid, provider: 'dummy'},
  ))
  expect(await updateUserCert({
    ...ctx,
    request: {
      params: {uid: 'dummy', provider: cert1.provider, ver: cert1.ver},
      body: {
        id: 'id0001',
        password: 'password02',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: 'dummy', provider: cert1.provider, ver: cert1.ver},
  ))
  expect(await updateUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver},
      body: {
        id: 'id0001',
        password: '',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.CERT_MISSED,
    {uid: cert1.uid, provider: cert1.provider},
  ))
  expect(await updateUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver + 1},
      body: {
        id: 'id0001',
        password: 'password02',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver + 1},
  ))
  let res = await updateUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver},
      body: {
        id: 'key001',
        password: 'password02',
      },
    },
    throw: throwCode,
    providers: testProviders,
  })
  expect(res.certs).toHaveLength(1)
  expect(res.certs[0]).toEqual(
    {provider: cert1.provider, id: cert1.key, ver: cert1.ver + 1},
  )
  expect(await Cert.count({uid: user1._id})).toEqual(1)
  expect(await Cert.find({where: {uid: user1._id, provider: cert1.provider}}))
    .toEqual(
      expect.objectContaining({
        key: cert1.key,
        secret: 'encrypted:password02'
      })
    )
})

test('deleteUserCert', async () => {
  let {User, Cert} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let cert1 = await Cert.create({
    _id: 'cid001',
    uid: user1._id,
    provider: PROVIDER.PASSWORD,
    key: 'key001',
    secret: 'password01',
  })
  expect(await deleteUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: 'dummy', ver: cert1.ver},
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: cert1.uid, provider: 'dummy', ver: cert1.ver},
  ))
  expect(await deleteUserCert({
    ...ctx,
    request: {
      params: {uid: 'dummy', provider: cert1.provider, ver: cert1.ver},
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: 'dummy', provider: cert1.provider, ver: cert1.ver},
  ))
  expect(await deleteUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver + 1},
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver + 1},
  ))
  expect(await deleteUserCert({
    ...ctx,
    request: {
      params: {uid: 'dummy', provider: cert1.provider, ver: cert1.ver + 1},
    },
    throw: throwCode,
    providers: testProviders,
  })).toEqual(respondError(
    ERRORS.DATA_REVISED,
    {uid: 'dummy', provider: cert1.provider, ver: cert1.ver + 1},
  ))
  let res = await deleteUserCert({
    ...ctx,
    request: {
      params: {uid: cert1.uid, provider: cert1.provider, ver: cert1.ver},
    },
    throw: throwCode,
    providers: testProviders,
  })
  expect(res.certs).toHaveLength(0)
})
