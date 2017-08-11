/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import {
  setPage, doSingOut, setPrivilege, backPage,
  showLogs, showSessions, resetPage, resetUsers, showProviders
} from '../actions'
import Menu from '../components/Menu'
import { PRIV, PAGE } from '../constants'

const mapStateToProps = state => {
  return {
    title: state.title,
    prim: state.prim,
    sess: state.sess,
    page: state.page,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onHomePageSelected: () => dispatch(setPage(PAGE.TOP)),
    onHelpPageSelected: () => dispatch(setPage(PAGE.HELP)),
    onProviderPageSelected: (uid) => () => dispatch(showProviders(uid)),
    onHelpPageClosed: () => dispatch(backPage()),
    onSignOut: () => dispatch(doSingOut()),
    onPrivManagerSelected: (event) => onPrivilegeSelected(dispatch, PRIV.MANAGER),
    onPrivAdminSelected: (event) => onPrivilegeSelected(dispatch, PRIV.ADMIN),
    onPrivUserSelected: (event) => onPrivilegeSelected(dispatch, PRIV.USER),
    onLogsSelected: (event) => dispatch(showLogs),
    onSessionsSelected: (event) => dispatch(showSessions),
  }
}

const onPrivilegeSelected = (dispatch, priv) => {
  dispatch(resetPage())
  dispatch(resetUsers())
  dispatch(setPrivilege(priv))
}

const ContextMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Menu)

export default ContextMenu
