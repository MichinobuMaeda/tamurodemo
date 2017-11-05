/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import crypto from 'crypto'
import GoogleAuth from 'google-auth-library'
import {PROVIDER} from './constants'

const providers = {}

providers[PROVIDER.PASSWORD] = {
  getCert: async (conf, Cert, {id, password}) => {
    let cert = await Cert.find({where: {provider: PROVIDER.PASSWORD, key: id} })
    return cert && cert.secret === digestSecret(cert.uid, password, conf.seed) ? cert : null
  },
  generateCert: (conf, {uid, id, password}) => {
    if (!id || !password) {return null}
    return {
      key: id,
      secret: digestSecret(uid, password, conf.seed),
    }
  },
}

export default providers

providers[PROVIDER.GOOGLE] = {
  getCert: async (conf, Cert, {token}) => {
    try {
      let key = await getGoogleUser(conf, token)
      return key ? Cert.find({where: {provider: PROVIDER.GOOGLE, key} }) : null
    } catch (e) {
      return null
    }
  },
  generateCert: async (conf, {token}) => {
    try {
      let key = await getGoogleUser(conf, token)
      return key ? {key} : null
    } catch (e) {
      return null
    }
  },
}
  
export const digestSecret = (uid, password, seed) => {
  let hash = crypto.createHash('sha256')
  hash.update(`${uid}:${seed}:${password}`)
  return hash.digest('hex')
}
  
const googleAuth = new GoogleAuth()

export const getGoogleUser = (conf, token) => new Promise((resolve, reject) => {
  new googleAuth.OAuth2(conf.google, '', '').verifyIdToken(
    token,
    conf.google,
    function(e, login) {
      if (!login) {reject(e)}
      let payload = login.getPayload()
      if (!payload) {reject(e)}
      if (!payload['sub']) {reject(e)}
      resolve(payload['sub'])
    })
})
