/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PROVIDER} from '../constants'
import Guest from '../components/Guest'
import {selectCert, setSignInId, setSignInPassword} from '../actions/signin'
import {signInWithPassword} from '../actions/status'

const mapStateToProps = ({status, signin}) => {
  return {
    status,
    password: selectCert(signin, PROVIDER.PASSWORD),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onIdChange: event => dispatch(setSignInId(event.target.value)),
    onPasswordChange:event => dispatch(setSignInPassword(event.target.value)),
    onPasswordCommitted: () => dispatch(signInWithPassword()),
  }
}

const GuestContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Guest)

export default GuestContainer
