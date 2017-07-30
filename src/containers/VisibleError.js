/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { hideError } from '../actions'
import Error from '../components/Error'

const mapStateToProps = state => {
  return {
    error: state.error,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onErrorConfirm: () => hideError(dispatch),
  }
}

const VisibleError = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Error)

export default VisibleError;
