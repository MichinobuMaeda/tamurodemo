/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'
import {ERRORS} from '../constants'
import {respondError, getUserWithDepends} from '../helper'

export const createUserCert = async ctx => {
  let {uid} = ctx.request.params
  let {provider} = ctx.request.body
  try {
    let cert = await ctx.providers[provider]
      .generateCert(ctx.conf, {uid, ...ctx.request.body})
    let {User} = ctx.models
    let user = await User.findOne({where: {_id: uid} })
    await user.createCert({
      _id: shortid.generate(),
      provider,
      ...cert,
    })
    return getUserWithDepends(user)
  } catch(e) {
    return respondError(ERRORS.CERT_MISSED, {uid, provider})
  }
}

export const updateUserCert = async ctx => {
  let {uid, provider, ver} = ctx.request.params
  try {
    let cert = await ctx.providers[provider]
      .generateCert(ctx.conf, {uid, ...ctx.request.body})
    let {User, Cert} = ctx.models
    ver = parseInt(ver, 10)
    let [hit] = cert && await Cert.update({
      ver: (ver + 1),
      ...cert,
    }, {
      fields: ['key', 'secret', 'ver'],
      where: {uid, provider, ver},
    })
    return (hit === 1)
      ? getUserWithDepends(await User.findOne({where: {_id: uid} }))
      : respondError(ERRORS.DATA_REVISED, {uid, provider, ver})
  } catch(e) {
    return respondError(ERRORS.CERT_MISSED, {uid, provider})
  }
}

export const deleteUserCert = async ctx => {
  let {uid, provider, ver} = ctx.request.params
  let {User, Cert} = ctx.models
  // Work around: not to return deleted item. Why?
  await Cert.findOne({where: {uid, provider, ver} })
  // -- end --
  let hit = await Cert.destroy({where: {uid, provider, ver} })
  return (hit === 1)
    ? getUserWithDepends(await User.findOne({where: {_id: uid} }))
    : respondError(ERRORS.DATA_REVISED, {uid, provider, ver})
}
