/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {LOG_LEVEL, PROVIDER} from '../constants'
import {model} from '../model'
import {conf, log, deleteAll} from '../testHelper'
import {getGroupWithDepends, getUserWithDepends} from '../helper'

var models = {}

beforeAll(async () => {
  models = await model(conf)
})

beforeEach(async () => {
  await deleteAll(models)
})

afterAll(async () => {
  await deleteAll(models)
  await models.db.close()
})

test('log', () => {
  expect(log.count()).toEqual(0)

  log.info({a: 'x'})
  expect(log.count()).toEqual(1)
  expect(log.last()).toEqual({
    level: LOG_LEVEL.INFO,
    rec: {a: 'x'},
  })

  log.warn({b: 'y'})
  expect(log.count()).toEqual(2)
  expect(log.last()).toEqual({
    level: LOG_LEVEL.WARN,
    rec: {b: 'y'},
  })

  log.error({c: 'z'})
  expect(log.count()).toEqual(3)
  expect(log.last()).toEqual({
    level: LOG_LEVEL.ERROR,
    rec: {c: 'z'},
  })

  log.clear()
  expect(log.count()).toEqual(0)
})

test('getGroupWithDepends', async () => {
  let {Group, User} = models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let user2 = await User.create({
    _id: 'uid002',
    name: 'User 2',
  })
  let group1 = await Group.create({
    _id: 'gid001',
    name: 'Group 1',
  })
  let group2 = await Group.create({
    _id: 'gid002',
    name: 'Group 2',
  })
  let group3 = await Group.create({
    _id: 'gid003',
    name: 'Group 3',
  })
  await group1.addSubGroup(group2)
  await group2.addSubGroup(group3)
  await group2.addUser(user1)
  await group2.addOwner(user2)
  let res = await getGroupWithDepends(group2)
  expect(res._id).toEqual(group2._id)
  expect(res.groups).toEqual([
    {_id: group1._id, name: group1.name, role: group1.role}
  ])
  expect(res.subGroups).toEqual([
    {_id: group3._id, name: group3.name, role: group3.role}
  ])
  expect(res.users).toEqual([
    {_id: user1._id, name: user1.name, role: user1.role}
  ])
  expect(res.owners).toEqual([
    {_id: user2._id, name: user2.name, role: user2.role}
  ])
})

test('getUserWithDepends', async () => {
  let {User} = models
  let user1 = await User.create({
    _id: 'uid001',
    name: 'User 1',
  })
  let group1 = await user1.createGroup({
    _id: 'gid001',
    name: 'Group 1',
  })
  let cert1 = await user1.createCert({
    _id: 'cert01',
    provider: PROVIDER.PASSWORD,
    key: 'id001',
    secret: 'password001',
  })
  let cert2 = await user1.createCert({
    _id: 'cert02',
    provider: PROVIDER.GOOGLE,
    key: 'id002',
  })
  let res = await getUserWithDepends(user1)
  expect(res._id).toEqual(user1._id)
  expect(res.groups).toEqual([
    {_id: group1._id, name: group1.name, role: group1.role},
  ])
  expect(res.certs).toEqual(
    expect.arrayContaining([
      {provider: cert1.provider, id: cert1.key, ver: cert1.ver},
      {provider: cert2.provider, ver: cert2.ver},
    ])
  )
  expect(res.certs).toHaveLength(2)
})
