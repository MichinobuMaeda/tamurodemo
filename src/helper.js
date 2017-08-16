/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import Moment from 'moment'

import { PRIV, PROVIDER, ERR } from './constants'

Moment.locale('ja', { weekdaysMin: [ '日', '月', '火', '水', '木', '金', '土' ]})

export const toJaDateTime = iso => Moment(iso).format('YYYY年M月D日(dd) h:mm:ss')
export const toJaDate = iso => Moment(iso).format('YYYY年M月D日(dd)')

export const nameOfProvider = {}
nameOfProvider[PROVIDER.PASSWORD] = 'パスワード認証'
nameOfProvider[PROVIDER.GOOGLE] = 'Google'
nameOfProvider[PROVIDER.FACEBOOK] = 'Facebook'

export const nameOfPrivilege = {}
nameOfPrivilege[PRIV.USER] = '一般ユーザ'
nameOfPrivilege[PRIV.ADMIN] = 'システム担当者'
nameOfPrivilege[PRIV.MANAGER] = '管理者'

export const errorMessage = {
  '': {},
  uid: {},
  gid: {},
  ver: {},
  authId: {},
  oauth2: {}
}
errorMessage[''][ERR.SIGNIN] = 'ログインが必要です。'
errorMessage[''][ERR.AUTH] = '認証エラーです。ID・パスワードなど間違っていないかが確認してください。'
errorMessage['oauth2'][PROVIDER.GOOGLE] = `${nameOfProvider[PROVIDER.GOOGLE]}の認証エラーです。`
errorMessage['oauth2'][PROVIDER.FACEBOOK] = `${nameOfProvider[PROVIDER.FACEBOOK]}の認証エラーです。`
errorMessage['oauth2'][ERR.REFERENCE] = `認証情報が取得できませんでした。`
errorMessage['authId'][ERR.REFERENCE] = '認証情報が登録されていません。'
errorMessage['uid'][ERR.REFERENCE] = `ユーザIDが不正です。システムのトラブルの可能性が高いので、${nameOfPrivilege[PRIV.ADMIN]}に連絡してください。`
errorMessage['gid'][ERR.REFERENCE] = `グループIDが不正です。システムのトラブルの可能性が高いので、${nameOfPrivilege[PRIV.ADMIN]}}に連絡してください。`
errorMessage['ver'][ERR.LATEST] = '編集前の情報が最新ではありませんでした。もう一度やり直してください。'

export const populateGids = (gids, groups) => {
  return gids.map(gid => groups
    .reduce((ret, cur) => cur._id === gid ? cur : ret ,null))
    .filter(g => g)
}

export const findOneById = (list, id, empty = null) => {
  return list.reduce((ret, cur) => cur._id === id ? cur : ret ,empty)
}

export const sortByName = list => {
  return list.map(item => item.name).sort()
    .reduce((ret, name) => ret.concat(list.filter(item => item.name === name)), [])
}

export const getParentsOfGroup = (groups, gid) =>
  groups.filter(g => -1 < g.gids.indexOf(gid)).map(g => g._id)

  export const getParentsOfUser = (groups, uid) =>
  groups.filter(g => -1 < g.uids.indexOf(uid)).map(g => g._id)

export const sortedGroups = (prim, groups, withTop = false, withManager = true) => {
  return [
    ...(withTop ? groups.filter(g => g._id === prim.top) : []),
    ...(sortByName(groups.filter(
      g => g._id !== prim.top && g._id !== prim.admin && g._id !== prim.manager
    ))),
    ...(withManager ? groups.filter(g => g._id === prim.manager) : []),
    ...(groups.filter(g => g._id === prim.admin)),
  ]
}

export const isCommittableGroup = (prim, edited) => {
  return (
    edited.name && edited.name.trim()
  ) &&
  (
    !edited.parents ||
    0 < edited.parents.length ||
    edited._id === prim.top
  )
}

export const isEditedGroup = (group, edited) => {
  return (
    group.name !== edited.name ||
    ((group.desc || '') !== (edited.desc || ''))
  )
}

export const isEditedGroupParents = (group, edited) => {
  return (
    edited.parents &&
    edited.parents.sort().join(' ') !== group.parents.sort().join(' ')
  )
}

export const isCommittableUser = (prim, user, edited) => {
  return (
    edited.name && edited.name.trim()
  ) &&
  (
    !edited.parents ||
    0 < edited.parents.length ||
    edited._id === prim.top
  ) &&
  (
    edited.profiles && edited.profiles.reduce(
      (ret, cur) => cur.title && cur.title.v && cur.title.v.trim() && ret,
      true
    )
  )
}

const isEditedProfile = (prof, edited) =>
  profileFields.reduce((ret, cur) =>
    ((prof[cur.key] && prof[cur.key].v) || '') !== ((edited[cur.key] && edited[cur.key].v) || '') ||
    ((prof[cur.key] && prof[cur.key].p.sort().join(' ')) || '') !== ((edited[cur.key] && edited[cur.key].p.sort().join(' ')) || '') ||
    ret,
    false
  )

export const isEditedUser = (user, edited) => {
  return (
    user.name !== edited.name ||
    ((user.desc || '') !== (edited.desc || '')) ||
    ((user.profiles ? user.profiles.length : 0) !== (edited.profiles ? edited.profiles.length : 0)) ||
    user.profiles.reduce((ret, cur, i) => isEditedProfile(user.profiles[i], edited.profiles[i]) || ret, false)
  )
}

export const isEditedUserParents = (user, edited) => {
  return (
    edited.parents &&
    edited.parents.sort().join(' ') !== user.parents.sort().join(' ')
  )
}

export const hasPrivilege = (p, gids) => p.reduce((ret, cur) => gids && -1 < gids.indexOf(cur) || ret, false)

export const paperStyle = { margin: "8px", padding: "8px" }
export const buttonStyle = { margin: "0 8px 0 8px" }

export const getCurrentPage = page => page.history[page.curr]

export const getOriginalGroup = (groups, gid) => gid
? {
    ...(findOneById(groups, gid, {})),
    parents: getParentsOfUser(groups, gid)
  }
: {}

export const getOriginalUser = (users, groups, uid) => uid
  ? {
      ...(findOneById(users, uid, {})),
      parents: getParentsOfUser(groups, uid)
    }
  : {}

export const profileFields = [
  { key: "title", name: "プロファイル名", multiLine: false },
  { key: "zip", name: "郵便番号", multiLine: false },
  { key: "country", name: "国", multiLine: false },
  { key: "state", name: "都道府県", multiLine: false },
  { key: "city", name: "市区町村", multiLine: false },
  { key: "street", name: "町名番地", multiLine: false },
  { key: "bldg", name: "建物・部屋番号", multiLine: false },
  { key: "tel", name: "固定電話", multiLine: false },
  { key: "fax", name: "FAX", multiLine: false },
  { key: "cell", name: "携帯番号", multiLine: false },
  { key: "email", name: "E-mail", multiLine: false },
  { key: "name", name: "氏名", multiLine: false },
  { key: "note", name: "備考", multiLine: true },
]
