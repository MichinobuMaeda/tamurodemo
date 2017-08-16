'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { hasPrivilege, authenticatedUser } from './auth.js'

test('hasPrivilege()', () => {
  expect(hasPrivilege([], [])).toBeFalsy()
  expect(hasPrivilege(['a'], [])).toBeFalsy()
  expect(hasPrivilege([], ['b'])).toBeFalsy()
  expect(hasPrivilege(['a'], ['b'])).toBeFalsy()
  expect(hasPrivilege(['a'], ['a'])).toBeTruthy()
  expect(hasPrivilege(['a'], ['a', 'b'])).toBeTruthy()
  expect(hasPrivilege(['a', 'b'], ['a'])).toBeTruthy()
  expect(hasPrivilege(['a', 'b'], ['a', 'b'])).toBeTruthy()
})

test('authenticatedUser()', () => {
  expect(authenticatedUser(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: [] } } ],
      createdAt: null,
      modifiedAt: null,
    },
    {
      uid: 'uid1',
      gids: [],
      manager: false,
    }
  )).toEqual(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: [] } } ],
      createdAt: null,
      modifiedAt: null,
    },
  )
  expect(authenticatedUser(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: [] } } ],
      createdAt: null,
      modifiedAt: null,
    },
    {
      uid: 'uid2',
      gids: [],
      manager: false,
    }
  )).toEqual(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [],
      createdAt: null,
      modifiedAt: null,
    },
  )
  expect(authenticatedUser(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: [] } } ],
      createdAt: null,
      modifiedAt: null,
    },
    {
      uid: 'uid2',
      gids: [],
      manager: true,
    }
  )).toEqual(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: [] } } ],
      createdAt: null,
      modifiedAt: null,
    },
  )
  expect(authenticatedUser(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: ['a'] } } ],
      createdAt: null,
      modifiedAt: null,
    },
    {
      uid: 'uid2',
      gids: ['a'],
      manager: false,
    }
  )).toEqual(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 1', p: ['a'] } } ],
      createdAt: null,
      modifiedAt: null,
    },
  )
  expect(authenticatedUser(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [
        { title: { v: 'Title 1', p: [] } },
        { title: { v: 'Title 2', p: ['a'] } },
      ],
      createdAt: null,
      modifiedAt: null,
    },
    {
      uid: 'uid2',
      gids: ['a'],
      manager: false,
    }
  )).toEqual(
    {
      _id: 'uid1',
      ver: 0,
      name: 'User 1',
      desc: '',
      profiles: [ { title: { v: 'Title 2', p: ['a'] } } ],
      createdAt: null,
      modifiedAt: null,
    },
  )
})
