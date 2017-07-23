/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import Help from '../components/Help'

const mapStateToProps = state => {
  return {
    primary: state.primary,
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const ContextHelp = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Help)

export default ContextHelp;
