/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { setPrivilege, doSingIn } from '../actions'
import Entrance from '../components/Entrance'

const mapStateToProps = state => {
  return {
    privilege: state.privilege,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onPrivilegeChanged: (event, index, value) => dispatch(setPrivilege(value)),
    onSingIn: () => doSingIn(dispatch),
  }
}

const ContextEntrance = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Entrance)

export default ContextEntrance;
