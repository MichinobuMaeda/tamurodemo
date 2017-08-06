/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import User from '../components/User'

const mapStateToProps = state => {
  let { page, users } = state 
  let user = users.reduce((ret, u) => u._id === page.history[page.curr].id ? u : ret, null)
  return {
    user,
  }
}

const mapDispatchToProps = dispatch => {
  return {} 
}

const VisibleUser = connect(
  mapStateToProps,
  mapDispatchToProps,
)(User)

export default VisibleUser;
