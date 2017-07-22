'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import { isStringFilled, isArray } from './helper'
import err from './errors'

const collection = async (db) => {
  const groups = db.collection('groups')

  await groups.createIndex({ name: 1 }, { unique: true })
  await groups.createIndex({ uids: 1 })
  await groups.createIndex({ gids: 1 })
  await groups.createIndex({ modifiedAt: 1 })

  groups.validate = async (
    { _id, ver, name, gids, uids, createdAt, modifiedAt } = {},
    depends = true
  ) => {
    _id = _id || shortid.generate()
    ver = parseInt(ver, 10)
    ver = isNaN(ver) ? 0 : ver
    gids = gids || []
    uids = uids || []
    createdAt = createdAt ? new Date(createdAt) : new Date()
    modifiedAt = modifiedAt ? new Date(modifiedAt) : createdAt
    let errors = []
      .concat(!isStringFilled(name)
        ? [ err.required('name') ]
        : (depends && 0 !== (await groups.count({ name, _id: { $ne: _id } }))
          ? [ err.unique('name') ]: []))
      .concat(!isArray(gids)
        ? [ err.array('gids') ]
        : (await gids.reduce(async (ret, gid) =>
          depends && 0 === (await groups.count({ _id: gid }))
            ? [ ...ret, err.reference('gids') ] : ret, [])))
      .concat(!isArray(uids) 
        ? [ err.array('uids') ]
        : (await uids.reduce(async (ret, uid) =>
          depends && 0 === (await db.collection('users').count({ _id: uid }))
            ? [ ...ret, err.reference('uids') ] : ret, [])))
    return errors.length ? { errors }
      : { _id, ver, name, gids, uids, createdAt, modifiedAt }
  }

  groups.getAncestors = async id => {
    let ret = []
    if (!id) { return ret }
    let gids = []
    if (!isArray(id)) {
      gids = (await groups.find({ uids: id }).toArray())
    } else {
      ret = ret.concat(id)
      gids = await groups.find({ gids: { $in: id } }).toArray()
    }
    gids = gids.map(g => g._id.toString()).filter(v => ret.indexOf(v) < 0)
    return gids.length === 0 ? ret : groups.getAncestors(ret.concat(gids))
  }

  return groups
}

export default collection
