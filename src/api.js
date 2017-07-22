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
import { logs, logger } from './logger'
import users from './users'
import groups from './groups'
import creds from './credentials'
import { sessions, signIn, signOut, restoreSession, reqPriv, PRIV } from './auth'

export default class Api {
  constructor(conf) {
    this.conf = conf
  }

  async init() {

    // Storage Service =========================================

    const db = await MongoClient.connect(this.conf.mongoUri)
    this.users = await users(db)
    this.groups = await groups(db)
    this.creds = await creds(db)
    this.prims = db.collection('prims')
    this.prim = await this.prims.findOne({})
    this.sessions = await sessions(db)
    this.logs = await logs(db)
    this.log = logger(this.logs)

    // Routes ==================================================

    const router = new Router({ prefix: this.conf.prefix })
      .get('/',
        async ctx => {
          if (!this.prim) {
            ctx.response.body = {}
            return
          }
          ctx.response.body = await this.getTop(ctx.session)
        })

      .get('/setup',
        ctx => {
          ctx.response.body = this.prim
            ? setup.completeHtml()
            : setup.setupHtml(ctx.request.path)
        })

      .post('/setup',
        async ctx => {
          if (this.prim) {
            ctx.response.status = 404
            return
          }
          let { top, admin, manager, name, authId } = ctx.request.body
          this.log.info({
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
          this.prim = await setup.saveObjects(this, ctx.request.body)
          ctx.redirect(ctx.request.path)
        })

      .post('/sessions',
        signOut(this), signIn(this), async ctx => {
          ctx.response.body = await this.getTop(true)
        })

      .get('/sessions',
        reqPriv(PRIV.ADMIN), async ctx => {
          ctx.response.body = await this.sessions.find({}).sort({ createdAt: -1 }).toArray()
        })

      .del('/sessions',
        signOut(this), async ctx => {
          ctx.response.body = (await this.getTop(false))
        })

      .get('/users',
        reqPriv(PRIV.MANAGER), async ctx => {
          ctx.response.body = await this.users.find({}).sort({ name: 1 }).toArray()
        })

      .get('/users/:uid',
        reqPriv(PRIV.MEMBER), getBaseDoc(this.users, 'uid'), ctx => {
          ctx.response.body = ctx.base
        })

      .put('/users/:uid/ver/:ver',
        reqPriv(PRIV.MANAGER_OR_SELF), validate(this.users), async ctx => {
          ctx.response.body = await this.updateDoc(this.users, {
            _id: ctx.params.uid,
            ver: parseInt(ctx.params.ver, 10)
          }, ctx.validated)
        })

      .del('/users/:uid/ver/:ver',
        reqPriv(PRIV.MANAGER), async ctx => {
          ctx.response.body = (await this.users.findOneAndDelete({
            _id: ctx.params.uid,
            ver: parseInt(ctx.params.ver, 10)
          })).value ? {} : { errors: [ err.latest('ver') ]}
        })

      .get('/groups',
        reqPriv(PRIV.MANAGER), async ctx => {
          ctx.response.body = await this.groups.find({}).sort({ name: 1 }).toArray()
        })

      .get('/groups/:gid',
        reqPriv(PRIV.MEMBER), getBaseDoc(this.groups, 'gid'), ctx => {
          ctx.response.body = ctx.base
        })

      .put('/groups/:gid/ver/:ver',
        reqPriv(PRIV.MANAGER), validate(this.groups), async ctx => {
          ctx.response.body = await this.updateDoc(this.groups, {
            _id: ctx.params.gid,
            ver: parseInt(ctx.params.ver, 10)
          }, ctx.validated)
        })

      .del('/groups/:gid/ver/:ver',
        reqPriv(PRIV.MANAGER), async ctx => {
          ctx.response.body = (await this.groups.findOneAndDelete({
            _id: ctx.params.gid,
            ver: parseInt(ctx.params.ver, 10)
          })).value ? {} : { errors: [ err.latest('ver') ]}
        })

      .post('/groups/:gid/users',
        reqPriv(PRIV.MANAGER), getBaseDoc(this.groups, 'gid'), validate(this.users), async ctx => {
          let user = ctx.validated
          ctx.base.uids.push(user._id)
          await this.groups.findOneAndUpdate({ _id: ctx.base._id }, ctx.base)
          await this.users.save(user)
          ctx.response.body = await this.users.findOne({ _id: user._id })
        })

      .get('/groups/:gid/users',
        reqPriv(PRIV.MEMBER), getBaseDoc(this.groups, 'gid'), async ctx => {
          ctx.response.body = await this.users.find(
            { _id: { $in: ctx.base.uids } }).sort({ name: 1 }).toArray()
        })

      .post('/groups/:gid/groups',
        reqPriv(PRIV.MANAGER), getBaseDoc(this.groups, 'gid'), validate(this.groups), async ctx => {
          let group = ctx.validated
          ctx.base.gids.push(group._id)
          await this.groups.findOneAndUpdate({ _id: ctx.base._id }, ctx.base)
          await this.groups.save(group)
          ctx.response.body = await this.groups.findOne({ _id: group._id })
        })

      .get('/groups/:gid/groups',
        reqPriv(PRIV.MEMBER), getBaseDoc(this.groups, 'gid'), async ctx => {
          ctx.response.body = await this.groups.find(
            { _id: { $in: ctx.base.gids } }).sort({ name: 1 }).toArray()
        })

      .post('/users/:uid/provider/:provider',
        reqPriv(PRIV.MANAGER_OR_SELF), referDoc(this.users, 'uid'), validate(this.creds), async ctx => {
          let { uid, provider } = ctx.params
          if (await this.creds.count({ uid, provider })) {
            ctx.response.body = { errors: [ err.unique('provider') ] }
            return
          }
          let cred = ctx.validated
          cred.uid = uid
          cred.provider = provider
          if (cred.password) {
            cred.password = digestPassword(cred.uid, cred.password, this.conf.seed)
          }
          await this.creds.save(cred)
          if (cred.password) { cred.password = '' }
          ctx.response.body = cred
        })

      .get('/users/:uid/creds',
        reqPriv(PRIV.MANAGER_OR_SELF), referDoc(this.users, 'uid'), async ctx => {
          ctx.response.body = (await this.creds.find(
            { uid: ctx.params.uid }).sort({ provider: 1 }).toArray()).map(cred => {
            if (cred.password) { cred.password = '' }
            return cred
          })
        })

      .put('/users/:uid/provider/:provider/ver/:ver',
        reqPriv(PRIV.MANAGER_OR_SELF), referDoc(this.users, 'uid'), validate(this.creds), async ctx => {
          let { uid, provider, ver } = ctx.params
          ver = parseInt(ver, 10)
          let cred = ctx.validated
          cred.uid = uid
          cred.provider = provider
          cred.ver = ver + 1
          cred.modifiedAt = new Date()
          if (cred.password) {
            cred.password = digestPassword(cred.uid, cred.password, this.conf.seed)
          }
          let ret = await this.creds.findOneAndUpdate({ _id: cred._id, uid, provider, ver }, cred)
          if (ret.value) {
            if (cred.password) { cred.password = '' }
            ctx.response.body = cred
          } else {
            ctx.response.body = { errors: [ err.latest('ver') ]}
          }
        })

      .del('/users/:uid/provider/:provider/ver/:ver',
        reqPriv(PRIV.MANAGER_OR_SELF), referDoc(this.users, 'uid'), async ctx => {
          let { uid, provider, ver } = ctx.params
          ver = parseInt(ver, 10)
          ctx.response.body = (await this.creds.findOneAndDelete({ uid, provider, ver })).value
            ? {} : { errors: [ err.latest('ver') ]}
        })

    // HTTP Service ============================================

    let koa = new Koa()
    koa.keys = [this.conf.appKey]
    koa
      .use(bodyParser())
      .use(restoreSession(this))
      .use(router.routes())
    const http = koa.listen(this.conf.port)

    return { db, http }
  }

  // Helpers ===================================================

  async updateDoc(collection, { _id, ver }, obj) {
    obj._id = _id
    obj.ver = ver + 1
    obj.modifiedAt = new Date()
    let ret = await collection.findOneAndUpdate({ _id, ver }, obj)
    return ret.value
      ? collection.findOne({ _id })
      : { errors: [ err.latest('ver') ]}
  }

  async getTop(isSession) {
    const top = await this.groups.findOne({ _id: this.prim.top })
    return isSession ? top : { name: top.name }
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
