/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {teal600, teal800} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import ActionDone from 'material-ui/svg-icons/action/done'
import ActionDeleteForever from 'material-ui/svg-icons/action/delete-forever'
import ActionHelp from 'material-ui/svg-icons/action/help'
import ActionHistory from 'material-ui/svg-icons/action/history'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionUpdate from 'material-ui/svg-icons/action/update'
import DeviceDeveloperMode from 'material-ui/svg-icons/device/developer-mode'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import NavigationArrowBack from 'material-ui/svg-icons/navigation/arrow-back'
import NavigationArrowForward from 'material-ui/svg-icons/navigation/arrow-forward'
import NavigationCancel from 'material-ui/svg-icons/navigation/cancel'
import SocialGroupAdd from 'material-ui/svg-icons/social/group-add'
import SocialPersonAdd from 'material-ui/svg-icons/social/person-add'

import {ERRORS, PROVIDER, COLOR_WHITE, ICONS} from './constants'

export const API_BASE_PATH = '/api'

export const GOOGLE_CLIENT_ID = '1098406676005-l2v5e161qkcmcphhd6dc2o09cv4r2fhe.apps.googleusercontent.com'

export const STR = {
  SIGN_IN: 'ログイン',
  SIGN_OUT: 'ログアウト',
  SIGNED_OUT: 'ログアウトしました。',
  REVOKE_MANGER: '管理者権限解除',
  REVOKE_ADMIN: 'システム担当者解除',
  EDIT_MODE: '編集可',
  PROFILE: '自分のこと',
  SIGN_IN_ID: 'ユーザーID',
  PASSWORD: 'パスワード',
  SIGN_IN_WITH_PASSWORD: 'IDとパスワードでログイン',
  CONFIRM_PASSWORD: 'パスワード確認',
  SET_ID_PASSWORD: 'IDとパスワードを設定',
  CHOICE_SING_IN_PROVIDER: 'ログイン方法を選択してください。',
  SIGN_IN_PLEASE: 'ログインしてください。',
  BACK: '戻る',
  RESET: 'リセット',
  CONFIRM_DELETE: '本当に削除しますか？',
  TITLE: 'タイトル',
  TITLE_HINT: 'このサイトのタイトル（必須）',
  GROUP_OF_USER: '所属するグループ',
  UPPER_GROUP: '上位のグループ',
  LOWER_GROUP: '下位のグループ',
  NEW_GROUP: '新しいグループ',
  GROUP: 'グループ',
  GROUP_NAME_HINT: 'グループ名（必須）',
  GROUP_DESC: 'グループの説明',
  MEMBER: 'メンバー',
  GROUP_OWNER: 'グループの管理者',
  GROUP_HAS_BEEN_DELETED: 'このグループは削除されました。',
  USER_HAS_BEEN_DELETED: 'このユーザは削除されました。',
  NEW_USER: '新しいユーザ',
  USER: 'ユーザ',
  USER_NAME_HINT: 'ユーザ名（必須）',
  USER_DESC: 'ユーザの説明',
  INVITEE: '招待対象',
  SESSIONS: 'セッション',
  LOGS: 'ログ',
  NOT_INVITED: '未発行',
  SIGN_IN_METHOD: 'ログイン方法',
  EDIT_SIGN_IN_METHOD: 'ログイン方法の編集',
  DELETE_PASSWORD: 'IDとパスワードを使わない',
  CONFIRM_DELETE_PASSWORD: '本当にIDとパスワードを削除しますか？',
}

export const welcomeTitle = user => {
  return `${user.name} さん`
}

export const THEME_COLOR1 = teal600
export const THEME_COLOR2 = teal800

export const FG_COLOR = THEME_COLOR1
export const BG_COLOR = COLOR_WHITE

export const errorMessage = ({error, params}) => {
  switch (error) {
  case ERRORS.SESSION_EXPIRED:
    return 'ログインしてから長い時間が経ったので、ログインしなおしてください。'
  // case ERRORS.CERT_CREATED:
  case ERRORS.DATA_REVISED:
    return 'データの更新が競合しています。古いデータを元にして編集しているようです。最新の内容を取得しなおします。'
  case ERRORS.CERT_MISSED:
    switch (params.provider) {
    case PROVIDER.PASSWORD:
      return 'ログインに失敗しました。IDまたはパスワードが間違っています。'
    default:
      return 'ログインに失敗しました。'
    }
  default:
    return '原因不明のエラーです。システム管理者に連絡してください。'
  }
}

export const muiTheme = getMuiTheme({
  // fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: THEME_COLOR1 /* cyan500 */,
    primary2Color: THEME_COLOR2 /* cyan700 */,
    // primary3Color: grey400,
    // accent1Color: pinkA200,
    // accent2Color: grey100,
    // accent3Color: grey500,
    // textColor: darkBlack,
    // alternateTextColor: white,
    // canvasColor: white,
    // borderColor: grey300,
    // disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: THEME_COLOR1 /* cyan500 */,
    // clockCircleColor: fade(darkBlack, 0.07),
    // shadowColor: fullBlack,
  },
  // appBar: {
  //   height: 50,
  //},
})

export const icon = name => {
  switch (name) {
  case ICONS.CANCEL: return NavigationCancel
  case ICONS.USER_CERT: return ActionAccountCircle
  case ICONS.CONFIRM: return ActionDone
  case ICONS.DELETE: return ActionDeleteForever
  case ICONS.DEBUG: return DeviceDeveloperMode
  case ICONS.EDIT: return EditorModeEdit
  case ICONS.GO_BACK: return NavigationArrowBack
  case ICONS.GO_FORWARD: return NavigationArrowForward
  case ICONS.HELP: return ActionHelp
  case ICONS.HISTORY: return ActionHistory
  case ICONS.HOME: return ActionHome
  case ICONS.NEW_GROUP: return SocialGroupAdd
  case ICONS.NEW_PERSON: return SocialPersonAdd
  case ICONS.UPDATE: return ActionUpdate
  default: return null
  }
}

export const validatePassword = password =>
  password && (
    process.env.NODE_ENV === 'development' ||
    (
      7 < password.length &&
      !password.match(/^([0-9]+|[A-Z]+|[a-z]+)$/)
    )
  )
