/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import Logs from '../components/Logs'
import { showLogs, getMoreLogs } from '../actions/logs'

const mapStateToProps = state => {
  let { logs } = state 
  return {
    logs,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onRefreshLogs: (event) => dispatch(showLogs),
    onGetMoreLogs: (event) => dispatch(getMoreLogs),
  } 
}

const VisibleLogs = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Logs)

export default VisibleLogs;
