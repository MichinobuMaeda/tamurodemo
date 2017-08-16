/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { openAlert, closeAlert } from '../actions/view'
import {
  setCredAuthId, setCredPassword,
  committedAuthIdPassword, disabledPassword,
} from '../actions/password'
import {
  signInWithGoogle, failureSingInWithGoogle,
  connectGoogle, disconnectGoogle,
} from '../actions/google'
import { PROVIDER } from '../constants'
import Credential from '../components/Credential'

const mapStateToProps = state => {
  return {
    password: state.creds.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, { provider: PROVIDER.PASSWORD }),
    google: state.creds.reduce((ret, cur) => cur.provider === PROVIDER.GOOGLE ? cur : ret, { provider: PROVIDER.GOOGLE }),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCredAuthIdChanged: (event) => dispatch(setCredAuthId(event.target.value)),
    onCredPasswordChanged: (event) => dispatch(setCredPassword(event.target.value)),
    onCommitAuthIdPassword: () => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(committedAuthIdPassword) },
      message: "ユーザーIDとパスワードを設定します。",
      ok: "実行",
      cancel: "中止",
    })),
    onDisabledPassword: () => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(disabledPassword) },
      message: "ユーザーIDとパスワードを無効にします。",
      ok: "実行",
      cancel: "中止",
    })),
    onDisconnectGoogle: () => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(disconnectGoogle) },
      message: "Googleアカウントによるログインを無効にします。",
      ok: "実行",
      cancel: "中止",
    })),
    onConnectGoogle: () => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(signInWithGoogle(
        dispatch, connectGoogle, failureSingInWithGoogle
      )) },
      message: "Googleアカウントでログインできるようにします。",
      ok: "実行",
      cancel: "中止",
    })),
  }
}

const EditableCredential = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Credential)

export default EditableCredential;
