/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { closeAlert } from '../actions/view'
import AlertDialog from '../components/AlertDialog'

const mapStateToProps = state => {
  return {
    alert: state.alert,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onDialogClose: () => dispatch(closeAlert()),
  }
}

const ContextAlertDialog = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AlertDialog)

export default ContextAlertDialog;
