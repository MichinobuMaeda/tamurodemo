'use strict';

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import crypto from 'crypto'
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import { err, prv } from './constants'
import { log, mongoose, User, Group, Prim, Cred, Session } from './model'


export default class Service {

  /**
   * Construct the tamuro api server.
   * @param {object} conf - configuration
   */
  constructor(conf) {
    log.info(`Service#constructor()`)
    this.prim = null
    this.conf = conf
    this.api = new Koa()
    this.api.keys = [this.conf.appKey]
    this.router = new Router({
      prefix: this.conf.prefix
    })

    this.router
      .get('/', async (ctx) => {
        if (!this.prim) {
          ctx.body = JSON.stringify({})
          return
        }
        let top = await Group.findById(this.prim.top)
        ctx.body = JSON.stringify(ctx.session ? top : { name: top.name })
      })

      .put('/setup', async (ctx) => {
        log.info(`PUT /setup`)
        if (!this.prim) { this.prim = await Prim.findOne({}) }
        if (this.prim) {
          ctx.body = JSON.stringify({ errors: [ err.conflict('prim') ] })
          return
        }
        let ret = await this.setup(ctx.request.body)
        if (ret.errors) {
          this.prim = null
          ctx.body = JSON.stringify(ret)
        } else {
          this.prim = ret
          let top = await Group.findById(this.prim.top)
          ctx.body = JSON.stringify({ name: top.name })
        }
      })

      .post('/sessions', async (ctx) => {
        log.info(`POST /sessions`)
        this.signOut(ctx)
        let ret = await this.authenticate(ctx.request.body)
        if (ret.errors) {
          ctx.cookies.set('SID', '', { maxAge: this.conf.expires, signed: true })
          ctx.body = JSON.stringify(ret)
        } else {
          ctx.cookies.set('SID', ret._id.toString(), { maxAge: this.conf.expires, signed: true })
          log.info({ attr: ret.toJSON() })
          ctx.body = JSON.stringify(await Group.findById(this.prim.top))
        }
      })

      .get('/sessions', this.authAdmin, async (ctx) => {
        ctx.body = JSON.stringify(await Session.find({}).sort({ createdAt: -1 }).exec())
      })

      .del('/sessions', async (ctx) => {
        this.signOut(ctx)
        let top = await Group.findById(this.prim.top)
        ctx.body = JSON.stringify({ name: top.name })
      })

      .get('/users', this.authManager, async (ctx) => {
        ctx.body = JSON.stringify(await User.find({}).sort({ name: 1 }).exec())
      })

      .get('/users/:uid', this.authMember, async (ctx) => {
        ctx.body = JSON.stringify(await User.findById(ctx.params.uid))
      })

      .put('/users/:uid/ver/:ver', this.authSelfOrManager, async (ctx) => {
        let errors = this.isMatchBodyAndParam(ctx)
        if (errors) {
          ctx.body = JSON.stringify({ errors: errors })
          return
        }
        ctx.body = JSON.stringify(await User.update(ctx.request.body))
      })

      .del('/users/:uid/ver/:ver', this.authManager, async (ctx) => {
        ctx.body = JSON.stringify(await User.delete({ _id: ctx.params.uid, ver: ctx.params.ver }))
      })

      .get('/groups', this.authManager, async (ctx) => {
        ctx.body = JSON.stringify(await Group.find({}).sort({ name: 1 }).exec())
      })

      .get('/groups/:gid', this.authMember, async (ctx) => {
        ctx.body = JSON.stringify(await Group.findById(ctx.params.gid))
      })

      .put('/groups/:gid/ver/:ver', this.authManager, async (ctx) => {
        let errors = this.isMatchBodyAndParam(ctx)
        if (errors) {
          ctx.body = JSON.stringify({ errors: errors })
          return
        }
        ctx.body = JSON.stringify(await Group.update(ctx.request.body))
      })

      .del('/groups/:gid/ver/:ver', this.authManager, async (ctx) => {
        ctx.body = JSON.stringify(await Group.delete({ _id: ctx.params.gid, ver: ctx.params.ver }))
      })

      .post('/groups/:gid/users', this.authManager, async (ctx) => {
        if (!(await Group.count({ _id: ctx.params.gid }))) {
          ctx.body = JSON.stringify({ errors: [ err.reference('gid') ] })
          return
        }
        let user = await User.create(ctx.request.body)
        let parent = await Group.findById(ctx.params.gid)
        parent.uids = [user._id.toString()].concat(parent.uids)
        await parent.save()
        ctx.body = JSON.stringify(user)
      })

      .get('/groups/:gid/users', this.authMember, async (ctx) => {
        let parent = await Group.findById(ctx.params.gid)
        if (!parent) {
          ctx.body = JSON.stringify({ errors: [ err.reference('gid') ] })
          return
        }
        ctx.body = JSON.stringify(await User.find({ _id: { $in: parent.uids } }))
      })

      .post('/groups/:gid/groups', this.authManager, async (ctx) => {
        if (!(await Group.count({ _id: ctx.params.gid }))) {
          ctx.body = JSON.stringify({ errors: [ err.reference('gid') ] })
          return
        }
        let group = await Group.create(ctx.request.body)
        let parent = await Group.findById(ctx.params.gid)
        parent.gids = [group._id.toString()].concat(parent.gids)
        await parent.save()
        ctx.body = JSON.stringify(group)
      })

      .get('/groups/:gid/groups', this.authMember, async (ctx) => {
        let parent = await Group.findById(ctx.params.gid)
        if (!parent) {
          ctx.body = JSON.stringify({ errors: [ err.reference('gid') ] })
          return
        }
        ctx.body = JSON.stringify(await Group.find({ _id: { $in: parent.gids } }))
      })

      .post('/users/:uid/creds/:provider', this.authSelfOrManager, async (ctx) => {
        let errors = this.isMatchBodyAndParam(ctx)
        if (errors) {
          ctx.body = JSON.stringify({ errors: errors })
          return
        }
        if (ctx.request.body.provider == prv.password && ctx.request.body.attr) {
          ctx.request.body.attr.password = this.digestPassword(ctx.params.uid, ctx.request.body.attr.password)
        }
        let res = await Cred.create(ctx.request.body)
        if (res.provider == prv.password && res.attr) {
          res.attr.password = null
        }
        ctx.body = JSON.stringify(res)
      })

      .get('/users/:uid/creds', this.authSelfOrManager, async (ctx) => {
        if (!(await User.count({ _id: ctx.params.uid }))) {
          ctx.body = JSON.stringify({ errors: [ err.reference('uid') ] })
          return
        }
        let res = await Cred.find({ uid: ctx.params.uid })
        ctx.body = JSON.stringify(res.map(cred => {
          if (cred.provider == prv.password && cred.attr) {
            cred.attr.password = null
          }
          return cred
        }))
      })

      .put('/users/:uid/creds/:provider/ver/:ver', this.authSelfOrManager, async (ctx) => {
        let errors = this.isMatchBodyAndParam(ctx)
        if (errors) {
          ctx.body = JSON.stringify({ errors: errors })
          return
        }
        if (ctx.request.body.provider == prv.password && ctx.request.body.attr) {
          ctx.request.body.attr.password = this.digestPassword(ctx.params.uid, ctx.request.body.attr.password)
        }
        let res = await Cred.update(ctx.request.body)
        if (res.provider == prv.password && res.attr) {
          res.attr.password = null
        }
        ctx.body = JSON.stringify(res)
      })

      .del('/users/:uid/creds/:provider/ver/:ver', this.authSelfOrManager, async (ctx) => {
        ctx.body = JSON.stringify(await Cred.delete({
          uid: ctx.params.uid,
          provider: ctx.params.provider,
          ver: ctx.params.ver
        }))
      })

    this.api.keys = [this.conf.seed]

    this.api
      .use(bodyParser())
      .use(async (ctx, next) => {
        let sid = ctx.cookies.get('SID', { signed: true })
        let sess = sid ? (await Session.findById(sid)) : null
        if (sess && (sess.createdAt.getTime() + this.conf.expires) < new Date().getTime()) {
          await Session.delete(sess._id.toString())
          sess = null
        }
        ctx.session = sess
        await next()
      })
      .use(this.router.routes())
  }

  async init() {
    log.info(`Service#init()`)
    await mongoose.connect(this.conf.mongodb)
    this.prim = await Prim.findOne({})
    await this.api.listen(this.conf.port);
  }

  async authenticate(input) {
    let { provider, authId, password } = input
    let cred = await Cred.findOne({ provider: provider, authId: authId }).exec()
    if (!cred) {
      log.info(`POST /session FAILED: provider:${provider}, authId:${authId}`)
      return { errors: [err.auth('')] }
    }
    password = password ? this.digestPassword(cred.uid, password) : null
    if (provider == prv.password) {
      if (cred.authId != authId || !cred.attr || cred.attr.password != password) {
        log.info(`POST /session FAILED: provider:${provider}, authId:${authId} password:*********`)
        return { errors: [err.auth('')] }
      }
    } else {
      log.info(`POST /session FAILED: provider:${provider}, authId:${authId}`)
      return { errors: [err.auth('')] }
    }
    log.info(`POST /session SUCCESS: uid:${cred.uid}`)
    return await Session.create(cred)
  }

  async signOut(ctx) {
    let sid = ctx.cookies.get('SID', { signed: true })
    if (!sid) { return }
    log.info(`delete session: ${sid}}`)
    await Session.delete(sid)
  }

  async setup(obj) {
    let errors = []
    let top = Group.build(obj.top)
    let admin = Group.build(obj.admin)
    let manager = Group.build(obj.manager)
    let user = User.build(obj.user)
    errors = this.appendNestedErrors(errors, top.errors, 'top')
    errors = this.appendNestedErrors(errors, admin.errors, 'admin')
    errors = this.appendNestedErrors(errors, manager.errors, 'manager')
    errors = this.appendNestedErrors(errors, user.errors, 'user')
    if (errors.length) {
      return { errors: errors }
    }
    top = new Group(top)
    admin = new Group(admin)
    manager = new Group(manager)
    user = new User(user)
    top.gids = [admin._id.toString(), manager._id.toString()]
    admin.uids = [user._id.toString()]
    manager.uids = [user._id.toString()]
    let prim = Prim.build({
      top: top._id.toString(),
      admin: admin._id.toString(),
      manager: manager._id.toString(),
    })
    errors = this.appendNestedErrors(errors, prim.errors, 'prim')
    let { provider, authId, attr } = obj.cred
    if (attr && attr.password) {
      attr.password = this.digestPassword(user._id.toString(), attr.password)
    }
    let cred = Cred.build({
      uid: user._id.toString(),
      provider: provider,
      authId: authId,
      attr: attr,
    })
    errors = this.appendNestedErrors(errors, cred.errors, 'cred')
    if (errors.length) {
      return { errors: errors }
    }
    prim = new Prim(prim)
    cred = new Cred(cred)
    await top.save()
    await admin.save()
    await manager.save()
    await user.save()
    await cred.save()
    return await prim.save()
  }

  appendNestedErrors(target, errors, path) {
    let ret = (!errors) ? [] : errors.reduce((base, cur) => {
      base.push({ path: `${path}.${cur.path}`, error: cur.error})
      return base
    }, [])
    return ret.length ? (target ? target.concat(ret) : ret) : target
  }

  digestPassword(uid, password) {
    let hash = crypto.createHash('sha256')
    hash.update(`${uid}:${this.conf.seed}:${password}`)
    return hash.digest('hex')
  }

  async authMember(ctx, next) {
    if (!ctx.session) {
      ctx.body = JSON.stringify({ errors: [ err.signin('') ] })
    } else {
      await next()
    }
  }

  async authAdmin(ctx, next) {
    if (!ctx.session) {
      ctx.body = JSON.stringify({ errors: [ err.signin('') ] })
    } else if (!ctx.session.admin) {
      ctx.body = JSON.stringify({ errors: [ err.priv('admin') ] })
    } else {
      await next()
    }
  }

  async authManager(ctx, next) {
    if (!ctx.session) {
      ctx.body = JSON.stringify({ errors: [ err.signin('') ] })
    } else if (!ctx.session.manager) {
      ctx.body = JSON.stringify({ errors: [ err.priv('manager') ] })
    } else {
      await next()
    }
  }

  async authSelfOrManager(ctx, next) {
    if (!ctx.session) {
      ctx.body = JSON.stringify({ errors: [ err.signin('') ] })
    } else if ((!ctx.session.manager) && (ctx.params.uid != ctx.session.uid)) {
      ctx.body = JSON.stringify({ errors: [ err.priv('manager|uid') ] })
    } else {
      await next()
    }
  }

  isMatchBodyAndParam(ctx) {
    let errors = []
    if (ctx.request.body.uid && ctx.params.uid) {
      if (ctx.request.body.uid != ctx.params.uid) {
        errors.push(err.conflict('uid'))
      }
    } else if (ctx.request.body._id && ctx.params.uid) {
      if (ctx.request.body._id != ctx.params.uid) {
        errors.push(err.conflict('uid'))
      }
    } else if (ctx.request.body._id && ctx.params.gid) {
      if (ctx.request.body._id != ctx.params.gid) {
        errors.push(err.conflict('gid'))
      }
    }
    if (ctx.request.body.provider && ctx.params.provider &&
        ctx.request.body.provider != ctx.params.provider) {
      errors.push(err.conflict('provider'))
    }
    if ((ctx.request.body.ver || ctx.request.body.ver === 0) && ctx.params.ver &&
        ctx.request.body.ver != ctx.params.ver) {
      errors.push(err.conflict('ver'))
    }
    return errors.length ? errors : null
  }
}
