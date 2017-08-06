/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import Moment from 'moment'

import { PRIV, PROVIDER, ERR } from '../actions/constants'

Moment.locale('ja', { weekdaysMin: ['日', '月', '火', '水', '木', '金', '土']})

export const toJaDateTime = iso => Moment(iso).format('YYYY年M月D日(dd) h:mm:ss')
export const toJaDate = iso => Moment(iso).format('YYYY年M月D日(dd)')

export const nameOfProvider = {}
nameOfProvider[PROVIDER.PASSWORD] = 'パスワード認証'
nameOfProvider[PROVIDER.Google] = 'Google'
nameOfProvider[PROVIDER.Facebook] = 'Facebook'

export const nameOfPrivilege = {}
nameOfPrivilege[PRIV.USER] = '一般ユーザ'
nameOfPrivilege[PRIV.ADMIN] = 'システム担当者'
nameOfPrivilege[PRIV.MANAGER] = '管理者'

export const errorMessage = {
  '': {},
  uid: {},
  gid: {},
  authId: {},
}
errorMessage[''][ERR.SIGNIN] = 'ログインが必要です。'
errorMessage[''][ERR.AUTH] = '認証エラーです。ID・パスワードなど間違っていないかが確認してください。'
errorMessage['authId'][ERR.REFERENCE] = '認証エラーです。ID・パスワードなどが間違っていないか確認してください。'
errorMessage['uid'][ERR.REFERENCE] = `ユーザIDが不正です。バグの可能性が高いので、${nameOfPrivilege[PRIV.ADMIN]}に連絡してください。`
errorMessage['gid'][ERR.REFERENCE] = `グループIDが不正です。バグの可能性が高いので、${nameOfPrivilege[PRIV.ADMIN]}}に連絡してください。`

export const populateGids = (gids, groups) => {
  return gids.map(gid => groups.reduce((ret, cur) => cur._id === gid ? cur : ret ,null))
}

export const sortByName = list => {
  return list.map(item => item.name).sort()
    .reduce((ret, name) => ret.concat(list.filter(item => item.name === name)), [])
}

export const sortedGroups = (prim, groups) => {
  return [
    ...(sortByName(groups.filter(
      g => g._id !== prim.top && g._id !== prim.admin && g._id !== prim.manager
    ))),
    ...(groups.filter(g => g._id === prim.manager)),
    ...(groups.filter(g => g._id === prim.admin)),
  ]
}

export const paperStyle = { margin: 8, padding: 8 }
