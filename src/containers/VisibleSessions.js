/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import Sessions from '../components/Sessions'
import { showSessions } from '../actions/sessions'

const mapStateToProps = state => {
  let { sessions } = state 
  return {
    sessions,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onRefreshSessions: (event) => dispatch(showSessions),
  } 
}

const VisibleSessions = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sessions)

export default VisibleSessions;
