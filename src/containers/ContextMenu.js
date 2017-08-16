/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { setPage, backPage } from '../actions/view'
import { doSingOut, onPrivilegeSelected } from '../actions/auth'
import { editNewGroup, editGroup } from '../actions/groups'
import { editNewUser, editUser } from '../actions/users'
import { showLogs } from '../actions/logs'
import { showSessions } from '../actions/sessions'
import { showCredentials } from '../actions/creds'
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
    onProviderPageSelected: (uid) => () => dispatch(showCredentials(uid)),
    onHelpPageClosed: () => dispatch(backPage()),
    onSignOut: () => dispatch(doSingOut()),
    onPrivManagerSelected: (event) => onPrivilegeSelected(dispatch, PRIV.MANAGER),
    onPrivAdminSelected: (event) => onPrivilegeSelected(dispatch, PRIV.ADMIN),
    onPrivUserSelected: (event) => onPrivilegeSelected(dispatch, PRIV.USER),
    onLogsSelected: (event) => dispatch(showLogs),
    onSessionsSelected: (event) => dispatch(showSessions),
    onAddGroup: (gid) => () => dispatch(editNewGroup(gid)),
    onEditGroup: (gid) => () => dispatch(editGroup(gid)),
    onAddUser: (gid) => () => dispatch(editNewUser(gid)),
    onEditUser: (uid) => () => dispatch(editUser(uid)),
  }
}

const ContextMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Menu)

export default ContextMenu
