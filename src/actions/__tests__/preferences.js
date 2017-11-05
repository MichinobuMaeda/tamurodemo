/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {model} from '../../model'
import {PREFERENCE, ERRORS} from '../../constants'
import {respondError} from '../../helper'
import {conf, deleteAll} from '../../testHelper'
import {getHelps, updateHelp, updateTitle} from '../preferences'

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

test('getHelps', async () => {
  let {Preference} = ctx.models
  {
    let body = await getHelps({
      ...ctx,
      request: {},
    })
    expect(body).toHaveLength(0)
  }
  await Preference.create({pid: PREFERENCE.HELP_GUEST})
  await Preference.create({pid: PREFERENCE.HELP_MEMBER})
  await Preference.create({pid: PREFERENCE.HELP_MANAGER})
  await Preference.create({pid: PREFERENCE.HELP_ADMIN})
  {
    let body = await getHelps({
      ...ctx,
      request: {},
      session: {uid: 'uid001', isManager: true, isAdmin: true}
    })
    expect(body).toHaveLength(4)
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pid: PREFERENCE.HELP_GUEST,
          val: '',
          ver: 1,
        }),
        expect.objectContaining({pid: PREFERENCE.HELP_MEMBER}),
        expect.objectContaining({pid: PREFERENCE.HELP_MANAGER}),
        expect.objectContaining({pid: PREFERENCE.HELP_ADMIN}),
      ])
    )
  }
  {
    let body = await getHelps({
      ...ctx,
      request: {},
      session: {uid: 'uid001', isManager: true, isAdmin: false}
    })
    expect(body).toHaveLength(3)
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pid: PREFERENCE.HELP_GUEST,
          val: '',
          ver: 1,
        }),
        expect.objectContaining({pid: PREFERENCE.HELP_MEMBER}),
        expect.objectContaining({pid: PREFERENCE.HELP_MANAGER}),
      ])
    )
  }
  {
    let body = await getHelps({
      ...ctx,
      request: {},
      session: {uid: 'uid001', isManager: false, isAdmin: false}
    })
    expect(body).toHaveLength(2)
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pid: PREFERENCE.HELP_GUEST,
          val: '',
          ver: 1,
        }),
        expect.objectContaining({pid: PREFERENCE.HELP_MEMBER}),
      ])
    )
  }
  {
    let body = await getHelps({
      ...ctx,
      request: {},
      session: {}
    })
    expect(body).toHaveLength(1)
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pid: PREFERENCE.HELP_GUEST,
          val: '',
          ver: 1,
        }),
      ])
    )
  }
  {
    let body = await getHelps({
      ...ctx,
      request: {},
    })
    expect(body).toHaveLength(1)
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pid: PREFERENCE.HELP_GUEST,
          val: '',
          ver: 1,
        }),
      ])
    )
  }
})

test('updateHelp', async () => {
  let {Preference} = ctx.models
  await Preference.create({pid: PREFERENCE.HELP_GUEST})
  await Preference.create({pid: PREFERENCE.HELP_MEMBER})
  await Preference.create({pid: PREFERENCE.HELP_MANAGER})
  await Preference.create({pid: PREFERENCE.HELP_ADMIN})
  {
    let body = await updateHelp({
      ...ctx,
      request: {
        params: {
          pid: PREFERENCE.HELP_GUEST,
          ver: '1',
        },
        body: {
          val: 'Text 1',
        },
      },
    })
    expect(body).toEqual(
      expect.objectContaining({
        pid: PREFERENCE.HELP_GUEST,
        val: 'Text 1',
        ver: 2
      }),
    )
  }
  {
    let body = await updateHelp({
      ...ctx,
      request: {
        params: {
          pid: PREFERENCE.HELP_GUEST,
          ver: '1',
        },
        body: {
          val: 'Text 1',
        },
      },
    })
    expect(body).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {
        pid: PREFERENCE.HELP_GUEST,
        ver: 1,
      },
    ))
  }
})

test('updateTitle', async () => {
  let {Preference} = ctx.models
  await Preference.create({pid: PREFERENCE.TITLE})
  {
    let body = await updateTitle({
      ...ctx,
      request: {
        params: {
          ver: '1',
        },
        body: {
          val: 'Text 1',
        },
      },
    })
    expect(body).toEqual(
      expect.objectContaining({
        val: 'Text 1',
        ver: 2
      }),
    )
  }
  {
    let body = await updateTitle({
      ...ctx,
      request: {
        params: {
          ver: '1',
        },
        body: {
          val: 'Text 1',
        },
      },
    })
    expect(body).toEqual(respondError(
      ERRORS.DATA_REVISED,
      {
        pid: PREFERENCE.TITLE,
        ver: 1,
      },
    ))
  }
})
