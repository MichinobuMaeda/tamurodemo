/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { setPage, resetPage, doSingOut, setPrivilege, backPage } from '../actions'
import Menu from '../components/Menu'
import { PRIV } from '../actions/constants'

const mapStateToProps = state => {
  return {
    title: state.title,
    prim: state.prim,
    priv: state.priv,
    sess: state.sess,
    page: state.page,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onHomePageSelected: () => dispatch(resetPage()),
    onHelpPageSelected: () => dispatch(setPage('help')),
    onHelpPageClosed: () => dispatch(backPage()),
    onSignOut: () => dispatch(doSingOut()),
    onPrivManagerSelected: (event) => dispatch(setPrivilege(PRIV.MANAGER)),
    onPrivAdminSelected: (event) => dispatch(setPrivilege(PRIV.ADMIN)),
    onPrivUserSelected: (event) => dispatch(setPrivilege(PRIV.USER)),
  }
}

const ContextMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Menu)

export default ContextMenu
