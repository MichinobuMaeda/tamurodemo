/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {selectUser} from '../actions/users'
import Welcome from '../components/Welcome'

const mapStateToProps = ({status, users}) => {
  return {
    status,
    user: selectUser(users, status.session.uid)
  }
}

// const mapDispatchToProps = dispatch => {
//   return {
//   }
//}

const WelcomeContainer = connect(
  mapStateToProps,
  // mapDispatchToProps,
)(Welcome)

export default WelcomeContainer
