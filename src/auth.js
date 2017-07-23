'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import { digestPassword } from './helper'
import err from './errors'

export const restoreSession = (st, conf) => async (ctx, next) => {
  let sid = ctx.cookies.get('SID', { signed: true })
  let sess = sid ? (await st.sessions.findOne({ _id: sid })) : null
  if (sess && (sess.createdAt.getTime() + conf.expires) < new Date().getTime()) {
    await st.sessions.findOneAndDelete({ _id: sid })
    sess = null
  }
  ctx.session = sess
  await next()
}

export const signIn = (st, conf) => async (ctx, next) => {
  let { provider, authId, password } = ctx.request.body
  let cred = await st.creds.findOne({ provider: provider, authId: authId })
  if (!cred) {
    st.log.info({ function: 'authenticate', result: 'NG', provider, authId })
    ctx.response.body = { errors: [ err.reference('authId') ]}
    return
  }
  if (provider === 'password') {
    password = password ? digestPassword(cred.uid, password, conf.seed) : null
    if (cred.authId !== authId || cred.password !== password) {
      st.log.info({ function: 'authenticate', result: 'NG', provider, authId })
      ctx.response.body = { errors: [ err.auth() ] }
      return
    }
  } else {
    st.log.info({ function: 'authenticate', result: 'NG', provider, authId })
    ctx.response.body = { errors: [ err.reference('provider') ] }
    return
  }
  st.log.info({ function: 'authenticate', result: 'OK', uid: cred.uid })
  let gids = await st.groups.getAncestors(cred.uid)
  let sess = {
    _id: shortid.generate(),
    uid: cred.uid,
    provider: provider,
    gids: gids,
    admin: (gids.indexOf(st.prim.admin) > -1),
    manager: (gids.indexOf(st.prim.manager) > -1),
    createdAt: new Date(),
  }
  await st.sessions.save(sess)
  st.log.info({ method: 'POST', path: '/sessions', SID: sess._id })
  ctx.cookies.set('SID', sess._id, { maxAge: conf.expires, signed: true })
  await next()
}

export const signOut = (st) => async (ctx, next) => {
  let sid = ctx.cookies.get('SID', { signed: true })
  if (sid) {
    st.log.info({ function: 'signOut', SID: sid })
    await st.sessions.findOneAndDelete({ _id: sid })
  }
  await next()
}

export const PRIV = {
  MEMBER: () => null,
  ADMIN: (ctx) => !ctx.session.admin
    ? [ err.admin('priv') ]
    : null,
  MANAGER: (ctx) => !ctx.session.manager
    ? [ err.manager('priv') ]
    : null,
  MANAGER_OR_SELF: (ctx) => !ctx.session.manager && ctx.params.uid !== ctx.session.uid
    ? [ err.managerOrSelf('priv') ]
    : null,
}

export const reqPriv = priv => async (ctx, next) => {
  if (!ctx.session) {
    ctx.response.body = { errors: [ err.signin() ] }
  } else {
    const errors = await priv(ctx)
    if (errors) {
      ctx.response.body = { errors }
    } else {
      await next()
    }
  }
}
