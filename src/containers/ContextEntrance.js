/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { doSingInWithPassword, setAuthId, setPassword } from '../actions'
import Entrance from '../components/Entrance'

const mapStateToProps = state => {
  return {
    auth: state.auth,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSingInWithPassword: () => dispatch(doSingInWithPassword()),
    onAuthIdChanged: (event) => dispatch(setAuthId(event.target.value)),
    onPasswordChanged: (event) => dispatch(setPassword(event.target.value)),
  }
}

const ContextEntrance = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Entrance)

export default ContextEntrance;
