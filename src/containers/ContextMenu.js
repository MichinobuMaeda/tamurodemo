/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import {
  setPage, doSingOut, setPrivilege, backPage,
  showLogs, showSessions
} from '../actions'
import Menu from '../components/Menu'
import { PRIV, PAGE } from '../constants'

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
    onHomePageSelected: () => dispatch(setPage(PAGE.TOP)),
    onHelpPageSelected: () => dispatch(setPage(PAGE.HELP)),
    onHelpPageClosed: () => dispatch(backPage()),
    onSignOut: () => dispatch(doSingOut()),
    onPrivManagerSelected: (event) => dispatch(setPrivilege(PRIV.MANAGER)),
    onPrivAdminSelected: (event) => dispatch(setPrivilege(PRIV.ADMIN)),
    onPrivUserSelected: (event) => dispatch(setPrivilege(PRIV.USER)),
    onLogsSelected: (event) => dispatch(showLogs),
    onSessionsSelected: (event) => dispatch(showSessions),
  }
}

const ContextMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Menu)

export default ContextMenu
