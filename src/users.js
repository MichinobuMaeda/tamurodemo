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
  const users = db.collection('users')

  await users.createIndex({ name: 1 }, { unique: true })
  await users.createIndex({ modifiedAt: 1 })

  users.validate = async (
    { _id, ver, name, profiles, createdAt, modifiedAt } = {},
    depends = true
  ) => {
    _id = _id || shortid.generate()
    ver = parseInt(ver, 10)
    ver = isNaN(ver) ? 0 : ver
    profiles = profiles || []
    createdAt = createdAt ? new Date(createdAt) : new Date()
    modifiedAt = modifiedAt ? new Date(modifiedAt) : createdAt
    let errors = []
      .concat(!isStringFilled(name)
        ? [ err.required('name') ]
        : (depends && 0 !== (await users.count({ name, _id: { $ne: _id } }))
          ? [ err.unique('name') ]: []))
      .concat(
        !isArray(profiles)
          ? [ err.array('profiles') ]
          : [])
    return errors.length ? { errors }
      : { _id, ver, name, profiles, createdAt, modifiedAt }
  }

  return users
}

export default collection
