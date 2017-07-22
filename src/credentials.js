'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import { isStringFilled } from './helper'
import err from './errors'

const collection = async (db) => {
  const creds = db.collection('creds')

  await creds.createIndex({ uid: 1, provider: 1 }, { unique: true })
  await creds.createIndex({ provider: 1, authId: 1 }, { unique: true })
  await creds.createIndex({ modifiedAt: 1 })

  creds.validate = async (
    { _id, ver, uid, provider, authId, password, createdAt, modifiedAt } = {},
    depends = true
  ) => {
    _id = _id || shortid.generate()
    ver = parseInt(ver, 10)
    ver = isNaN(ver) ? 0 : ver
    uid = uid ? uid.toString() : uid
    createdAt = createdAt ? new Date(createdAt) : new Date()
    modifiedAt = modifiedAt ? new Date(modifiedAt) : createdAt
    let errors = []
      .concat(!isStringFilled(uid)
        ? [ err.required('uid') ]
        : (depends && 0 === (await db.collection('users').count({ _id: uid }))
          ? [ err.reference('uid') ]: []))
      .concat(!isStringFilled(provider)
        ? [ err.required('provider') ]
        : [])
      .concat(!isStringFilled(authId)
        ? [ err.required('authId') ]
        : (depends && 0 < (await creds.count({ provider, authId, uid: { $ne: uid } }))
          ? [ err.unique('authId') ]: []))
      .concat(provider === 'password' && !isStringFilled(password)
        ? [ err.required('password') ]
        : [])
    return errors.length ? { errors }
      : { _id, ver, uid, provider, authId, password, createdAt, modifiedAt }
  }

  return creds
}

export default collection
