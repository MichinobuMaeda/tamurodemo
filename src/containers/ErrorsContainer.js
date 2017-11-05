/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import Errors from '../components/Errors'
import {backPage} from '../actions/pages'

const mapStateToProps = ({errors}) => {
  return {
    errors,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onPageBack: () => dispatch(backPage())
  }
}

const ErrorsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Errors)

export default ErrorsContainer
