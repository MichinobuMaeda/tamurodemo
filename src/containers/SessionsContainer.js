/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {showNewSessions, showOldSessions} from '../actions/sessions'
import {CONFIRM_ACTION, requestConfirm} from '../actions/confirmation'
import Sessions from '../components/Sessions'

const mapStateToProps = ({sessions}) => {
  return {
    sessions,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickUpdate: () => dispatch(showNewSessions()),
    onClickHistory: () => dispatch(showOldSessions()),
    onClickDelete: sid => () => dispatch(requestConfirm(CONFIRM_ACTION.DELETE_SESSION, sid)),
  }
}

const SessionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Sessions)

export default SessionsContainer
