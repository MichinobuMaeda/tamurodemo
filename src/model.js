'use strict';

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import bunyan from 'bunyan'
import bluebird from 'bluebird'

import { errors as err, providers as prv } from './constants'

export const mongoose = require('mongoose')
mongoose.Promise = bluebird

const Schema = mongoose.Schema;

export class LogStream {
  write(rec) {
    return Promise.resolve()
      .then(res => new Log(JSON.parse(rec)))
      .then(res => res.save())
      .then(res => res)
      .catch(e => console.error(e))
  }
}

export const log = bunyan.createLogger({
  name: "tamuro-api",
  streams: [{ stream: new LogStream() }]
})

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  profile: { type: Schema.Types.Mixed, default: {} },
}, {
  versionKey: 'ver',
  minimize: false,
})

UserSchema.statics.validate = async (
  { _id, ver, name, profile } = {},
  dependency = true
) => {
  let errors = [
    ...(isStringRequired(name) ? [] : [err.required('name')]),
    ...((profile = buildObject(profile)) ? [] : [err.object('profile')]),
    ...((!dependency || 0 == (await User.count({ name, _id: { $ne: _id } })))
      ? [] : [err.unique('name')])
  ]
  return errors.length ? { errors } : { name, profile }
}

UserSchema.statics.create = async (obj) => {
  return (obj = await User.validate(obj)).errors
    ? obj : (await (new User(obj)).save())
}

UserSchema.statics.update = async ({ _id, ver, name, profile }) => {
  let obj = await User.validate({ _id, ver, name, profile })
  return obj.errors ? obj : (
    (await User.findOneAndUpdate({ _id, ver }, {
      name: obj.name,
      profile: obj.profile,
      ver: ver + 1,
    })) ? (await User.findById(_id)) : { errors: [err.match('ver')] }
  )
}

UserSchema.statics.delete = async ({ _id, ver }) => {
  return (await User.findOneAndRemove({ _id, ver }))
    ? {} : { errors: [err.match('ver')] }
}

export const User = mongoose.model('User', UserSchema)

const GroupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  gids: { type: Array, 'default': [] },
  uids: { type: Array, 'default': [] },
}, {
  versionKey: 'ver',
})

GroupSchema.statics.validate = async (
  { _id, ver, name, gids, uids } = {},
  dependency = true
) => {
  gids = buildArray(gids)
  uids = buildArray(uids)
  let errors = [
    ...(isStringRequired(name) ? [] : [err.required('name')]),
    ...(await gids.reduce(async (ret, cur, i) => isStringRequired(cur)
      ? (0 < (await Group.count({ _id: cur }))
        ? ret  : [...ret, err.reference(`gids.${i}`)])
      : [...ret, err.required(`gids.${i}`)], [])),
    ...(await uids.reduce(async (ret, cur, i) => isStringRequired(cur)
      ? (0 < (await User.count({ _id: cur }))
        ? ret : [...ret, err.reference(`uids.${i}`)])
      : [...ret, err.required(`uids.${i}`)], [])),
    ...(!dependency || 0 == (await Group.count({ name, _id: { $ne: _id } }))
      ? [] : [err.unique('name')]),
  ]
  return errors.length ? { errors } : { name, gids, uids }
}

GroupSchema.statics.create = async function (obj) {
  return (obj = await Group.validate(obj)).errors
    ? obj : (await (new Group(obj)).save())
}

GroupSchema.statics.update = async function ({ _id, ver, name, gids, uids }) {
  let obj = await Group.validate({ _id, ver, name, gids, uids })
  return obj.errors ? obj : (
    (await Group.findOneAndUpdate({ _id, ver }, {
      name: obj.name,
      gids: obj.gids,
      uids: obj.uids,
      ver: ver + 1,
    })) ? (await Group.findById(_id)) : { errors: [err.match('ver')] }
  )
}

GroupSchema.statics.delete = async function ({ _id, ver }) {
  ver = parseInt(ver)
  return (await Group.findOneAndRemove({ _id, ver }))
    ? {} : { errors: [err.match('ver')] }
}

export const Group = mongoose.model('Group', GroupSchema)

const PrimSchema = new Schema({
  key: { type: Number, required: true, default: 0, min: 0, max: 0 },
  top: { type: String, required: true },
  admin: { type: String, required: true },
  manager: { type: String, required: true },
}, {
    versionKey: 'ver',
  })

PrimSchema.statics.validate = function ({ top, admin, manager } = {}) {
  let errors = [
    ...(isStringRequired(top) ? [] : [err.required('top')]),
    ...(isStringRequired(admin) ? [] : [err.required('admin')]),
    ...(isStringRequired(manager) ? [] : [err.required('manager')]),
  ]
  return errors.length ? { errors: errors } : { top, admin, manager }
}

export const Prim = mongoose.model('Prim', PrimSchema)

const CredSchema = new Schema({
  uid: { type: String, required: true },
  provider: { type: String, required: true },
  authId: { type: String, required: true },
  attr: Schema.Types.Mixed,
}, {
    versionKey: 'ver',
  })

CredSchema.index({ uid: 1, provider: 1 }, { unique: true })

CredSchema.index({ provider: 1, authId: 1 }, { unique: true })

CredSchema.statics.validate = async function (
  { uid, provider, authId, attr } = {},
  dependency = true
) {
  let errors = [
    ...(isStringRequired(uid) ? [
      ...(!dependency || (await User.count({ _id: uid })) ? [
        ...(dependency && (await Cred.count({
          provider: provider,
          authId: authId,
          uid: { $ne: uid }
        })) ? [err.unique('authId')] : []),
      ] : [err.reference('uid')]),
    ] : [err.required('uid')]),
    ...(isStringRequired(provider) ? [
      ...(prv[provider] ? [
        ...(provider == prv.password && attr &&  isStringRequired(attr.password)
          ? [] : [err.required('attr.password')]),
      ] : [err.provider('provider')]),
    ] : [err.required('provider')]),
    ...(isStringRequired(authId) ? [] : [err.required('authId')]),
  ]
  return errors.length ? { errors: errors } : { uid, provider, authId, attr }
}

CredSchema.statics.create = async function (obj) {
  let ret = await Cred.validate(obj)
  if (ret.errors) { return ret }
  return await (new Cred(ret)).save()
}

CredSchema.statics.update = async function (obj) {
  let ret = await Cred.validate(obj)
  if (ret.errors) { return ret }
  ret.ver = obj.ver + 1
  ret = await Cred.findOneAndUpdate({
    uid: obj.uid,
    provider: obj.provider,
    ver: obj.ver,
  }, ret)
  return ret ? (await Cred.findById(ret._id)) : { errors: [err.match('ver')] }
}

CredSchema.statics.delete = async function (obj) {
  let ret = await Cred.findOneAndRemove({
    uid: obj.uid,
    provider: obj.provider,
    ver: obj.ver,
  })
  return ret ? {} : { errors: [err.match('ver')] }
}

export const Cred = mongoose.model('Cred', CredSchema)

const SessionSchema = new Schema({
  uid: { type: String, require: true },
  provider: { type: String, require: true },
  gids: { type: Array, 'default': [] },
  admin: { type: Boolean, 'default': false },
  manager: { type: Boolean, 'default': false },
  createdAt: { type: Date, index: true },
}, {
    versionKey: 'ver',
    minimize: false,
  })

SessionSchema.statics.build = async function (obj) {
  if (!isObject(obj)) return { errors: [err.required('')] }
  let { uid, provider } = obj
  let errors = []
  if (!isStringRequired(uid)) {
    errors.push(err.string('uid'))
  }
  if (!isStringRequired(provider)) {
    errors.push(err.string('provider'))
  }
  let prim = await Prim.findOne({}).exec()
  let gids = await getGroups(uid)
  return errors.length ? { errors: errors } : {
    uid: uid,
    provider: provider,
    gids: gids,
    admin: (gids.indexOf(prim.admin) > -1),
    manager: (gids.indexOf(prim.manager) > -1),
    createdAt: new Date(),
  }
}

SessionSchema.statics.validate = async function (obj) {
  let ret = await Session.build(obj)
  if (ret.errors) { return ret }
  let errors = []
  if (0 == (await User.count({ _id: obj.uid }))) {
    errors.push(err.reference('uid'))
  }
  if (0 == (await Cred.count({ uid: obj.uid, provider: obj.provider }))) {
    errors.push(err.reference('provider'))
  }
  return errors.length ? { errors: errors } : ret
}

SessionSchema.statics.create = async function (obj) {
  let ret = await Session.validate(obj)
  if (ret.errors) { return ret }
  return await (new Session(ret)).save()
}

SessionSchema.statics.delete = async function (sid) {
  let ret = await Session.findByIdAndRemove(sid)
  return ret ? {} : { errors: [err.reference('')] }
}

export const Session = mongoose.model('Session', SessionSchema)

export async function getGroups(id) {
  let ret = []
  if (!id) { return ret }
  let gids = []
  if (Object.prototype.toString.call(id) !== '[object Array]') {
    gids = (await Group.find({ uids: id.toString() }).exec())
  } else {
    ret = ret.concat(id)
    gids = await Group.find({ gids: { $in: id } }).exec()
  }
  gids = gids.map(g => g._id.toString()).filter(v => ret.indexOf(v) < 0)
  return gids.length == 0 ? ret : getGroups(ret.concat(gids))
}

export const Log = mongoose.model('Log', new Schema({
  name: String,
  hostname: String,
  pid: Number,
  level: Number,
  msg: String,
  attr: Schema.Types.Mixed,
  time: { type: Date, index: true },
  v: Number,
}, {
    versionKey: 'ver',
  }))

export function buildNumber(v) {
  if (isNumber(v)) { return v }
  if (!isStringRequired(v)) { return null }
  let ret = Number(v)
  return isNaN(ret) ? null : ret
}

export function buildDate(v) {
  if (isDate(v)) { return v }
  if (!isStringRequired(v)) { return null }
  let ret = new Date(v)
  return isNaN(ret.getTime()) ? null : ret
}

export function buildArray(v) {
  return isArray(v) ? v : ((isUndefined(v) || isNull(v)) ? [] : [v])
}

export function buildObject(v) {
  return isObject(v) ? v : ((isUndefined(v) || isNull(v)) ? {} : null)
}

export function isStringRequired(v) {
  return isString(v) && v.length > 0
}

export function isStringOptional(v) {
  return isUndefined(v) || isNull(v) || isString(v)
}

export function isNumberOptional(v) {
  return isUndefined(v) || isNull(v) || isNumber(v)
}

export function isDateOptional(v) {
  return isUndefined(v) || isNull(v) || isDate(v)
}

export function isUndefined(v) {
  return Object.prototype.toString.call(v) === '[object Undefined]'
}

export function isNull(v) {
  return Object.prototype.toString.call(v) === '[object Null]'
}

export function isString(v) {
  return Object.prototype.toString.call(v) === '[object String]'
}

export function isNumber(v) {
  return Object.prototype.toString.call(v) === '[object Number]'
}

export function isDate(v) {
  return Object.prototype.toString.call(v) === '[object Date]'
}

export function isObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]'
}

export function isArray(v) {
  return Object.prototype.toString.call(v) === '[object Array]'
}
