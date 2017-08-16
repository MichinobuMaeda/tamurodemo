'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import GoogleAuth from 'google-auth-library'
import { digestPassword } from './helper'
import err from './errors'

const googleAuth = new GoogleAuth()

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
  let cred = null
  if (provider === 'password') {
    cred = await st.creds.findOne({ provider, authId })
    if (!cred) {
      st.log.info({ function: 'authenticate', result: 'NG', provider, authId })
      ctx.response.body = { errors: [ err.reference('authId') ]}
      return
    }
    password = password ? digestPassword(cred.uid, password, conf.seed) : null
    if (cred.authId !== authId || cred.password !== password) {
      st.log.info({ function: 'authenticate', result: 'NG', provider, authId })
      ctx.response.body = { errors: [ err.auth() ] }
      return
    }
  } else if (provider === 'google') {
    try {
      authId = await getGoogleUser(conf, authId)
      cred = await st.creds.findOne({ provider, authId })
      if (!cred) {
        st.log.info({ function: 'authenticate', result: 'NG', provider, authId })
        ctx.response.body = { errors: [ err.reference('authId') ]}
        return
      }
    } catch(e) {
      st.log.info({ function: 'authenticate', result: 'NG', provider, authId, e: JSON.stringify(e) })
      ctx.response.body = { errors: [ err.reference('oauth2') ]}
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
  ctx.session = sess
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

export const getGoogleUser = (conf, token) => new Promise((resolve, reject) => {
  new googleAuth.OAuth2(conf.google, '', '').verifyIdToken(
    token,
    conf.google,
    function(e, login) {
      if (!login) { reject(e) }
      let payload = login.getPayload()
      if (!payload) { reject(e) }
      if (!payload['sub']) { reject(e) }
      resolve(payload['sub'])
    })
})

export const hasPrivilege = (p, gids) =>
  p.reduce((ret, cur) => gids && -1 < gids.indexOf(cur) || ret, false)

export const authenticatedUser = (user, sess) => {
  let { _id, ver, name, desc, profiles, createdAt, modifiedAt } = user
  let { uid, gids, manager } = sess
  return {
    _id, ver, name, desc, createdAt, modifiedAt,
    profiles : (profiles || [])
      .filter(prof => prof && prof.title && (manager || _id === uid || hasPrivilege(prof.title.p, gids)))
      .map(prof => Object.keys(prof)
        .filter(key => manager || _id === uid || hasPrivilege((prof[key] && prof[key].p), gids))
        .reduce((ret, cur) => { ret[cur] = prof[cur]; return ret }, {})
      )
  }
}
