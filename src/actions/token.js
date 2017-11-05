/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'
import {PROVIDER, ERRORS} from '../constants'
import {respondError} from '../helper'

const tokenUrl = (conf, sid) => `${conf.appUrl.replace(/\/$/, '')}${conf.basePath}/token/${sid}`
const retrieveToken = (conf, sessions) => sessions
  .filter(s => s.provider === PROVIDER.TOKEN &&
    s.updatedAt.getTime() > new Date().getTime() - conf.expires)
  .reduce((ret, cur) => tokenUrl(conf, cur._id), null)

export const createToken = async ctx => {
  let {uid} = ctx.request.body
  let {Session, Cert} = ctx.models
  if (await Cert.count({where: {uid} })) {
    return respondError(ERRORS.CERT_CREATED, {uid})
  }
  await Session.destroy({where: {uid} })
  try {
    let _id = shortid.generate()
    await Session.create({
      _id,
      uid,
      provider: PROVIDER.TOKEN,
      gids: [],
      oids: [],
      isAdmin: false,
      isManager: false,
    })
    return {url: tokenUrl(ctx.conf, _id)}
  } catch (e) {
    return respondError(ERRORS.DATA_REVISED, {uid})
  }
}

export const getInvitees = async ctx => {
  let {User, Cert, Session} = ctx.models
  return (await User.findAll({
    attributes: ['_id', 'name'],
    order: [['name', 'ASC']],
    include: [
      {model: Cert, as: 'certs'},
      {model: Session, as: 'sessions'},
    ]
  }))
    .filter(u => u.certs.length === 0)
    .map(u => ({
      _id: u._id,
      name: u.name,
      token: retrieveToken(ctx.conf, u.sessions),
    }))
}

export const getToken = async ctx => {
  let {token} = ctx.request.params
  let {Session, Cert} = ctx.models
  await Session.destroy({where: {_id: ctx.session._id}})
  let sess = await Session.findOne({where: {_id: token}})
  if (!sess) {
    ctx.session = {}
    return respondError(ERRORS.SESSION_EXPIRED, {sid: token})
  }
  if (await Cert.count({where: {uid: sess.uid} })) {
    await sess.destroy()
    ctx.session = {}
    return respondError(ERRORS.CERT_CREATED, {sid: token, uid: sess.uid})
  }
  ctx.session = sess.get({plain: true})
  ctx.redirect(ctx.conf.appUrl)
  return {}
}
