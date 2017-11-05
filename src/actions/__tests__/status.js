/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {GROUP_ROLE, PREFERENCE} from '../../constants'
import {model} from '../../model'
import {conf, deleteAll} from '../../testHelper'
import {getStatus} from '../status'

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

test('getStatus', async () => {
  let {Group, User, Preference} = ctx.models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1'
  })
  let session = {
    _id: user1._id,
    uid: 'uid001'
  }
  {
    let body = await getStatus({...ctx, session})
    expect(body).toEqual({})
  }
  let title = await Preference.create({
    _id: '_id001',
    pid: PREFERENCE.TITLE,
    val: 'Title',
  })
  let top = await Group.create({
    _id: 'gid001',
    name: 'Top Group',
    role: GROUP_ROLE.TOP,
  })
  {
    let body = await getStatus({...ctx, session})
    expect(body).toEqual({
      top: {
        _id: top._id,
        name: top.name,
        role: GROUP_ROLE.TOP,
      },
      title: {
        ver: 1,
        val: title.val,
      },
      session: {
        _id: null,
        uid: 'uid001'
      },
    })
  }
  {
    let body = await getStatus({...ctx, session: {}})
    expect(body).toEqual({
      title: {val: title.val},
      top: {name: top.name},
      session: {},
    })
  }
  {
    let body = await getStatus({...ctx})
    expect(body).toEqual({
      title: {val: title.val},
      top: {name: top.name},
      session: {},
    })
  }
})
