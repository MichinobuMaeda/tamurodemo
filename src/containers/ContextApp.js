/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import App from '../components/App'

const mapStateToProps = state => {
  return {
    prim: state.prim,
    page: state.page,
    wait: state.wait,
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const ContextApp = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)

export default ContextApp
