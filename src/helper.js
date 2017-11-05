/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {PROVIDER} from './constants'

export const getGroupWithDepends = async group => ({
  ...group.get({plain: true}),
  groups: (await group.getGroups({
    attributes: ['_id', 'name', 'role'],
    order: [['name', 'ASC']],
  })).map(g => ({
    _id: g._id,
    name: g.name,
    role: g.role,
  })),
  subGroups: (await group.getSubGroups({
    attributes: ['_id', 'name', 'role'],
    order: [['name', 'ASC']],
  })).map(s => ({
    _id: s._id,
    name: s.name,
    role: s.role,
  })),
  users: (await group.getUsers({
    attributes: ['_id', 'name'],
    order: [['name', 'ASC']],
  })).map(u => ({
    _id: u._id,
    name: u.name,
  })),
  owners: (await group.getOwners({
    attributes: ['_id', 'name'],
    order: [['name', 'ASC']],
  })).map(u => ({
    _id: u._id,
    name: u.name,
  })),
})

export const getUserWithDepends = async user => ({
  ...user.get({plain: true}),
  groups: (await user.getGroups({
    attributes: ['_id', 'name', 'role'],
    order: [['name', 'ASC']],
  })).map(g => ({
    _id: g._id,
    name: g.name,
    role: g.role,
  })),
  ownedGroups: (await user.getOwnedGroups({
    attributes: ['_id', 'name', 'role'],
    order: [['name', 'ASC']],
  })).map(g => ({
    _id: g._id,
    name: g.name,
    role: g.role,
  })),
  certs: (await user.getCerts({
    attributes: ['provider', 'key', 'ver'],
  })).map(cert => cert.provider === PROVIDER.PASSWORD
    ? {provider: cert.provider, id: cert.key, ver: cert.ver}
    : {provider: cert.provider, ver: cert.ver}
  )
})

export const respondError = (error, params = {}) => ({errors: [{error, params}]})
