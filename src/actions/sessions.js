/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'
import {GROUP_ROLE, ERRORS} from '../constants'
import {respondError} from '../helper'
import {getStatus} from './status'

export const getSessions = async ctx => {
  let {from, to} = ctx.request.params
  let {Session} = ctx.models
  return (await Session.findAll({
    where: {createdAt: {$between: [
      new Date(from),
      new Date(to),
    ]}},
    order: [['updatedAt', 'DESC']],
  })).map(s => s.get({plain: true}))
}

export const createSession = async ctx => {
  let {Cert, Session} = ctx.models
  let {provider, id, token} = ctx.request.body
  await Session.destroy({where: {_id: ctx.session._id}})
  ctx.session = {}
  try {
    let cert = await ctx.providers[provider]
      .getCert(ctx.conf, Cert, ctx.request.body)
    if (cert) {
      ctx.session = (await createSessionFromCert(ctx.models, cert)).get({plain: true})
      return getStatus(ctx)
    } else {
      return respondError(ERRORS.CERT_MISSED, {provider, id, token})
    }
  } catch(e) {
    return respondError(ERRORS.CERT_MISSED, {provider, id, token})
  }
}

export const deleteSession = async ctx => {
  let {sid} = ctx.request.params
  let {Session} = ctx.models
  await Session.destroy({where: {_id: sid}})
  if (ctx.session._id === sid) {
    ctx.session = {}
  }
  return {}
}

export const deleteMySession = async ctx => {
  let {Session} = ctx.models
  await Session.destroy({where: {_id: ctx.session._id}})
  ctx.session = {}
  return getStatus(ctx)
}

export const revokeManager = ctx => {
  return revokePrivilege(ctx, {isManager: false})
}

export const revokeAdmin = ctx => {
  return revokePrivilege(ctx, {isAdmin: false})
}

const revokePrivilege = async (ctx, priv) => {
  let {Session} = ctx.models
  let sid = ctx.session._id
  let [hit, updated] = await Session.update(priv, {
    fields: Object.keys(priv),
    where: {_id: sid},
    returning: true,
  })
  ctx.session = (hit === 1) ? updated[0].get({plain: true}) : {}
  return (hit === 1)
    ? getStatus(ctx)
    : respondError(ERRORS.DATA_REVISED, {sid})
}

export const createSessionFromCert = async ({User, Group, SubGroup, Session}, cert) => {
  let user = await User.findOne({where: {_id: cert.uid} })
  let _id = shortid.generate()
  let uid = cert.uid
  let provider = cert.provider
  let gids = await getUserPriv(user, SubGroup)
  let oids = (await user.getOwnedGroups()).map(rec => rec._id)
  let isAdmin = await hasGroupRole(Group, gids, GROUP_ROLE.ADMIN)
  let isManager = await hasGroupRole(Group, gids, GROUP_ROLE.MANAGER)
  return Session.create({_id, uid, provider, gids, oids, isAdmin, isManager})
}

export const getUserPriv = async (user, SubGroup) => getGids(
  SubGroup, (await user.getGroups()).map(rec => rec._id)
)

export const getGids = async (SubGroup, gids) => {
  let populated = (gids || []).length === 0
    ? (gids || [])
    : gids.concat(
      (await SubGroup.findAll({where: {sid: {$in: gids} }})).map(rec => rec.gid)
    ).reduce((ret, cur) => (0 > ret.indexOf(cur) ? ret.concat(cur) : ret), gids)
  return (populated.length === (gids || []).length)
    ? gids
    : getGids(SubGroup, populated)
}

export const hasGroupRole = async (Group, gids, role) => (gids || []).length === 0
  ? false
  : (await Group.findAll({
    where: {role, _id: {$in: gids} },
    attributes: ['_id'],
  })
  ).length > 0
