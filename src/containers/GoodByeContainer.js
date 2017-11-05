/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import GoodBye from '../components/GoodBye'

const mapStateToProps = ({status}) => {
  return {
    status,
  }
}

// const mapDispatchToProps = dispatch => {
//   return {
//   }
//}

const GoodByeContainer = connect(
  mapStateToProps,
  // mapDispatchToProps,
)(GoodBye)

export default GoodByeContainer
