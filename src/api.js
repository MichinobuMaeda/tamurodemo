'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { MongoClient } from 'mongodb'
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import setup from './setup'
import err from './errors'
import { digestPassword } from './helper'
import store from './storage'
import { signIn, signOut, restoreSession, reqPriv, PRIV } from './auth'

export let st = {}

export const api = async conf => {

  // Storage Service =========================================

  const db = await MongoClient.connect(conf.mongoUri)
  st = await store(db)

  // Routes ==================================================

  const router = new Router({ prefix: conf.prefix })
    .get('/',
      async ctx => {
        if (!st.prim) {
          ctx.response.body = {}
          return
        }
        ctx.response.body = await getPrime(ctx.session)
      })

    .get('/setup',
      async ctx => {
        if (!st.prim) {
          st.prim = await st.prims.findOne({})
        }
        ctx.response.body = st.prim
          ? setup.completeHtml()
          : setup.setupHtml(ctx.request.path)
      })

    .post('/setup',
      async ctx => {
        if (st.prim) {
          ctx.response.status = 404
          return
        }
        let { top, admin, manager, name, authId } = ctx.request.body
        st.log.info({
          method: ctx.request.method,
          path: ctx.request.path,
          top, admin, manager, name, authId
        })
        let errors = setup.validateObjects(ctx.request.body)
        if (errors) {
          errors = errors.join('\n')
          ctx.response.body = setup.setupHtml(ctx.request.path, errors, ctx.request.body)
          return
        }
        st.prim = await setup.saveObjects(st, conf, ctx.request.body)
        ctx.redirect(ctx.request.path)
      })

    .post('/sessions',
      signOut(st), signIn(st, conf), async ctx => {
        ctx.response.body = await getPrime(ctx.session)
      })

    .get('/sessions',
      reqPriv(PRIV.ADMIN), async ctx => {
        ctx.response.body = await st.sessions.find({}).sort({ createdAt: -1 }).toArray()
      })

    .del('/sessions',
      signOut(st), async ctx => {
        ctx.response.body = (await getPrime())
      })

    .get('/users',
      reqPriv(PRIV.MANAGER), async ctx => {
        ctx.response.body = await st.users.find({}).sort({ name: 1 }).toArray()
      })

    .get('/users/:uid',
      reqPriv(PRIV.MEMBER), getBaseDoc(st.users, 'uid'), ctx => {
        ctx.response.body = ctx.base
      })

    .put('/users/:uid/ver/:ver',
      reqPriv(PRIV.MANAGER_OR_SELF), validate(st.users), async ctx => {
        ctx.response.body = await updateDoc(st.users, {
          _id: ctx.params.uid,
          ver: parseInt(ctx.params.ver, 10)
        }, ctx.validated)
      })

    .del('/users/:uid/ver/:ver',
      reqPriv(PRIV.MANAGER), async ctx => {
        ctx.response.body = (await st.users.findOneAndDelete({
          _id: ctx.params.uid,
          ver: parseInt(ctx.params.ver, 10)
        })).value ? {} : { errors: [ err.latest('ver') ]}
      })

    .get('/groups',
      reqPriv(PRIV.MANAGER), async ctx => {
        ctx.response.body = await st.groups.find({}).sort({ name: 1 }).toArray()
      })

    .get('/groups/:gid',
      reqPriv(PRIV.MEMBER), getBaseDoc(st.groups, 'gid'), ctx => {
        ctx.response.body = ctx.base
      })

    .put('/groups/:gid/ver/:ver',
      reqPriv(PRIV.MANAGER), validate(st.groups), async ctx => {
        ctx.response.body = await updateDoc(st.groups, {
          _id: ctx.params.gid,
          ver: parseInt(ctx.params.ver, 10)
        }, ctx.validated)
      })

    .del('/groups/:gid/ver/:ver',
      reqPriv(PRIV.MANAGER), async ctx => {
        ctx.response.body = (await st.groups.findOneAndDelete({
          _id: ctx.params.gid,
          ver: parseInt(ctx.params.ver, 10)
        })).value ? {} : { errors: [ err.latest('ver') ]}
      })

    .post('/groups/:gid/users',
      reqPriv(PRIV.MANAGER), getBaseDoc(st.groups, 'gid'), validate(st.users), async ctx => {
        let user = ctx.validated
        ctx.base.uids.push(user._id)
        await st.groups.findOneAndUpdate({ _id: ctx.base._id }, ctx.base)
        await st.users.save(user)
        ctx.response.body = await st.users.findOne({ _id: user._id })
      })

    .get('/groups/:gid/users',
      reqPriv(PRIV.MEMBER), getBaseDoc(st.groups, 'gid'), async ctx => {
        ctx.response.body = await st.users.find(
          { _id: { $in: ctx.base.uids } }).sort({ name: 1 }).toArray()
      })

    .post('/groups/:gid/groups',
      reqPriv(PRIV.MANAGER), getBaseDoc(st.groups, 'gid'), validate(st.groups), async ctx => {
        let group = ctx.validated
        ctx.base.gids.push(group._id)
        await st.groups.findOneAndUpdate({ _id: ctx.base._id }, ctx.base)
        await st.groups.save(group)
        ctx.response.body = await st.groups.findOne({ _id: group._id })
      })

    .get('/groups/:gid/groups',
      reqPriv(PRIV.MEMBER), getBaseDoc(st.groups, 'gid'), async ctx => {
        ctx.response.body = await st.groups.find(
          { _id: { $in: ctx.base.gids } }).sort({ name: 1 }).toArray()
      })

    .post('/users/:uid/provider/:provider',
      reqPriv(PRIV.MANAGER_OR_SELF), referDoc(st.users, 'uid'), validate(st.creds), async ctx => {
        let { uid, provider } = ctx.params
        if (await st.creds.count({ uid, provider })) {
          ctx.response.body = { errors: [ err.unique('provider') ] }
          return
        }
        let cred = ctx.validated
        cred.uid = uid
        cred.provider = provider
        if (cred.password) {
          cred.password = digestPassword(cred.uid, cred.password, conf.seed)
        }
        await st.creds.save(cred)
        if (cred.password) { cred.password = '' }
        ctx.response.body = cred
      })

    .get('/users/:uid/creds',
      reqPriv(PRIV.MANAGER_OR_SELF), referDoc(st.users, 'uid'), async ctx => {
        ctx.response.body = (await st.creds.find(
          { uid: ctx.params.uid }).sort({ provider: 1 }).toArray()).map(cred => {
          if (cred.password) { cred.password = '' }
          return cred
        })
      })

    .put('/users/:uid/provider/:provider/ver/:ver',
      reqPriv(PRIV.MANAGER_OR_SELF), referDoc(st.users, 'uid'), validate(st.creds), async ctx => {
        let { uid, provider, ver } = ctx.params
        ver = parseInt(ver, 10)
        let cred = ctx.validated
        cred.uid = uid
        cred.provider = provider
        cred.ver = ver + 1
        cred.modifiedAt = new Date()
        if (cred.password) {
          cred.password = digestPassword(cred.uid, cred.password, conf.seed)
        }
        let ret = await st.creds.findOneAndUpdate({ _id: cred._id, uid, provider, ver }, cred)
        if (ret.value) {
          if (cred.password) { cred.password = '' }
          ctx.response.body = cred
        } else {
          ctx.response.body = { errors: [ err.latest('ver') ]}
        }
      })

    .del('/users/:uid/provider/:provider/ver/:ver',
      reqPriv(PRIV.MANAGER_OR_SELF), referDoc(st.users, 'uid'), async ctx => {
        let { uid, provider, ver } = ctx.params
        ver = parseInt(ver, 10)
        ctx.response.body = (await st.creds.findOneAndDelete({ uid, provider, ver })).value
          ? {} : { errors: [ err.latest('ver') ]}
      })

  // HTTP Service ============================================

  let koa = new Koa()
  koa.keys = [conf.appKey]
  koa
    .use(bodyParser())
    .use(restoreSession(st, conf))
    .use(router.routes())
  const http = koa.listen(conf.port)

  return { db, http }
}

// Helpers ===================================================

const updateDoc = async (collection, { _id, ver }, obj) => {
  obj._id = _id
  obj.ver = ver + 1
  obj.modifiedAt = new Date()
  let ret = await collection.findOneAndUpdate({ _id, ver }, obj)
  return ret.value
    ? collection.findOne({ _id })
    : { errors: [ err.latest('ver') ]}
}

const getPrime = async (sess) => {
  let { _id, uid, provider, gids, admin, manager, createdAt } = sess ? sess : {}
  const top = await st.groups.findOne({ _id: st.prim.top })
  return {
    title: top.name,
    prim: (_id ? st.prim : null),
    sess: { uid, provider, gids, admin, manager, createdAt },
  }
}

// Middleware ===================================================

const referDoc = (collection, key) => async (ctx, next) => {
  if (await collection.count({ _id: ctx.params[key] })) {
    await next()
  } else {
    ctx.response.body = { errors: [ err.reference(key) ] }
  }
}

const getBaseDoc = (collection, key) => async (ctx, next) => {
  let base = await collection.findOne({ _id: ctx.params[key] })
  if (base) {
    ctx.base = base
    await next()
  } else {
    ctx.response.body = { errors: [ err.reference(key) ] }
  }
}

const validate = (collection) => async (ctx, next) => {
  let obj = await collection.validate(ctx.request.body)
  if (obj.errors) {
    ctx.response.body = obj
  } else {
    ctx.validated = obj
    await next()
  }
}
