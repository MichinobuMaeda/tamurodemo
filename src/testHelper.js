/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {LOG_LEVEL, PROVIDER} from './constants'

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))

export const conf = {
  dbUri: 'postgres://localhost:5432/test',
  dbOptions: {
    logging: null,
    isolationLevel: 'READ COMMITTED',
  },
  expires: 100,
  sid: 'SID',
  basePath: '/api',
  appUrl: 'http://test/api/token',
  port: 3001,
  appKey: '012345678901234567890123456789',
  seed: '012345678901234567890123456789',
}

export const deleteAll = async ({Group, User, Cert, Session, Log, Preference}) => {
  await Group.destroy({truncate: true, cascade: true})
  await User.destroy({truncate: true, cascade: true})
  await Cert.destroy({truncate: true, cascade: true})
  await Session.destroy({truncate: true, cascade: true})
  await Log.destroy({truncate: true, cascade: true})
  await Preference.destroy({truncate: true, cascade: true})
}

let logs = []

export const log = {
  info: (rec) => logs.push({level: LOG_LEVEL.INFO, rec}),
  warn: (rec) => logs.push({level: LOG_LEVEL.WARN, rec}),
  error: (rec) => logs.push({level: LOG_LEVEL.ERROR, rec}),
  clear: () => {logs = []},
  count: () => logs.length,
  last: () => logs[logs.length - 1],
}

export const throwCode = code => {
  let err = new Error()
  err.status = code
  err.expose = true
  throw err
}

export const testProviders = {}
testProviders [PROVIDER.PASSWORD] = {
  getCert: async (conf, Cert, {id, password}) => {
    let cert = await Cert.find({where: {provider: PROVIDER.PASSWORD, key: id} })
    return cert && cert.secret === `encrypted:${password}` ? cert : null
  },
  generateCert: (conf, {id, password}) => {
    return (id && password) ? {
      key: id,
      secret: `encrypted:${password}`,
    } : null
  },
}
testProviders [PROVIDER.GOOGLE] = {
  getCert: (conf, Cert, {token}) => {
    return Cert.find({where: {provider: PROVIDER.GOOGLE, key: `user id of token:${token}`} })
  },
  generateCert: (conf, {token}) => {
    return token ? {
      key: `user id of token:${token}`,
    } : null
  },
}
