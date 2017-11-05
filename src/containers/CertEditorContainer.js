/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PROVIDER} from '../constants'
import {currentPage} from '../actions/pages'
import {CONFIRM_ACTION, requestConfirm} from '../actions/confirmation'
import CertEditor from '../components/CertEditor'
import {
  selectUser, selectCert, setCertId, setCertPassword, setCertConfirm,
  setProviderPassword
} from '../actions/users'

const mapStateToProps = ({pages, users}) => {
  const page = currentPage(pages)
  const user = selectUser(users, page.id)
  return {
    page,
    password: selectCert(user.certs, PROVIDER.PASSWORD),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onIdChange: uid => event => dispatch(setCertId(uid, event.target.value)),
    onPasswordChange: uid => event => dispatch(setCertPassword(uid, event.target.value)),
    onConfirmChange: uid => event => dispatch(setCertConfirm(uid, event.target.value)),
    onPasswordCommitted: uid => () => dispatch(setProviderPassword(uid)),
    onConfirmDeletePassword: uid => () => dispatch(requestConfirm(CONFIRM_ACTION.DELETE_PASSWORD, uid)),
  }
}

const CertEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CertEditor)

export default CertEditorContainer
