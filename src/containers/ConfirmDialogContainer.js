/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import ConfirmDialog from '../components/ConfirmDialog'
import {setConfirmation, doConfirmedAction} from '../actions/confirmation'

const mapStateToProps = ({confirmation}) => {
  return {
    confirmation,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    handleOk: confirmation => () => dispatch(doConfirmedAction(confirmation)),
    handleCancel: () => dispatch(setConfirmation({})),
  }
}

const ConfirmDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfirmDialog)

export default ConfirmDialogContainer
