/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import {
  setAuthId, setPassword, doSingInWithPassword,
} from '../actions/password'
import {
  signInWithGoogle, doSingInWithGoogle, failureSingInWithGoogle
} from '../actions/google'
import Entrance from '../components/Entrance'

const mapStateToProps = state => {
  return {
    password: state.password,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onAuthIdChanged: (event) => dispatch(setAuthId(event.target.value)),
    onPasswordChanged: (event) => dispatch(setPassword(event.target.value)),
    onSingInWithPassword: () => dispatch(doSingInWithPassword()),
    onSingInWithGoogle: () => dispatch(signInWithGoogle(
      dispatch, doSingInWithGoogle, failureSingInWithGoogle
    )),
  }
}

const ContextEntrance = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Entrance)

export default ContextEntrance;
