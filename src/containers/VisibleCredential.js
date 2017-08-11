/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import {
  setCredAuthId, setCredPassword,
  committedAuthIdPassword, disabledPassword,
  connectGoogle, disconnectGoogle, failureSingInWithGoogle,
  openDialog, closeDialog,
} from '../actions'
import { signInWithGoogle } from '../actions/google'
import { PROVIDER } from '../constants'
import Credential from '../components/Credential'

const mapStateToProps = state => {
  return {
    password: state.creds.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, { provider: PROVIDER.PASSWORD }),
    google: state.creds.reduce((ret, cur) => cur.provider === PROVIDER.GOOGLE ? cur : ret, { provider: PROVIDER.GOOGLE }),
    dialog: state.dialog,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onCredAuthIdChanged: (event) => dispatch(setCredAuthId(event.target.value)),
    onCredPasswordChanged: (event) => dispatch(setCredPassword(event.target.value)),
    onCommitAuthIdPassword: () => dispatch(openDialog({
      action: () => { dispatch(closeDialog()); dispatch(committedAuthIdPassword) },
      message: "ユーザーIDとパスワードを設定します。"
    })),
    onDisabledPassword: () => dispatch(openDialog({
      action: () => { dispatch(closeDialog()); dispatch(disabledPassword) },
      message: "ユーザーIDとパスワードを無効にします。"
    })),
    onDisconnectGoogle: () => dispatch(openDialog({
      action: () => { dispatch(closeDialog()); dispatch(disconnectGoogle) },
      message: "Googleアカウントによるログインを無効にします。"
    })),
    onConnectGoogle: () => dispatch(openDialog({
      action: () => { dispatch(closeDialog()); dispatch(signInWithGoogle(
        dispatch, connectGoogle, failureSingInWithGoogle
      )) },
      message: "Googleアカウントでログインできるようにします。"
    })),
    onDialogClose: () => dispatch(closeDialog()),
  }
}

const VisibleCredential = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Credential)

export default VisibleCredential;
