/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { setPrivilege } from '../actions'
import Top from '../components/Top'

const mapStateToProps = state => {
  return {
    privilege: state.privilege,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onPrivilegeChanged: (event, index, value) => dispatch(setPrivilege(value)),
  }
}

const VisibleTop = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Top)

export default VisibleTop;
