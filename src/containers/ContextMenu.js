/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { setPage, resetPage, doSingOut } from '../actions'
import Menu from '../components/Menu'

const mapStateToProps = state => {
  return {
    title: state.title,
    primary: state.primary,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onHomePageSelected: () => dispatch(resetPage()),
    onHelpPageSelected: () => dispatch(setPage('help')),
    onSignOut: () => doSingOut(dispatch),
  }
}

const ContextMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Menu)

export default ContextMenu
