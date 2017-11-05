/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {showNewLogs, showOldLogs} from '../actions/logs'
import Logs from '../components/Logs'

const mapStateToProps = ({logs}) => {
  return {
    logs,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickUpdate: () => dispatch(showNewLogs()),
    onClickHistory: () => dispatch(showOldLogs()),
  }
}

const LogsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Logs)

export default LogsContainer
