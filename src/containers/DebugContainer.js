/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import Debug from '../components/Debug'

const mapStateToProps = state => {
  return {
    state: {
      ...state,
      helps: '...',
      logs: '...',
    },
  }
}

// const mapDispatchToProps = dispatch => {
//   return {
//   }
//}

const DebugContainer = connect(
  mapStateToProps,
  // mapDispatchToProps,
)(Debug)

export default DebugContainer
