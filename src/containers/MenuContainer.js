/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PAGE} from '../constants'
import Menu from '../components/Menu'
import {
  gotoHome, signOut, setEditMode,
  revokeManagerAndRestStatus, revokeAdminAndRestStatus
} from '../actions/status'
import {
  setPage, backPage, forwardPage, currentPage,
  isEditable, isRemovable, isTraversable
} from '../actions/pages'
import {CONFIRM_ACTION, requestConfirm} from '../actions/confirmation'
import {gotoUser, gotoSignInMethod} from '../actions/users'
import {gotoHelp} from '../actions/helps'
import {showInvitees} from '../actions/invitees'
import {showNewSessions} from '../actions/sessions'
import {showNewLogs} from '../actions/logs'

const mapStateToProps = ({status, pages, groups}) => {
  return {
    status,
    pages,
    editable: isEditable(status, currentPage(pages)),
    removable: isRemovable(status, currentPage(pages), groups),
    traversable: isTraversable(currentPage(pages)),
    atEditorPage: currentPage(pages).name.match(/EDITOR/)
  }
}

let CONFIRM_REQUEST = {}
CONFIRM_REQUEST[PAGE.GROUP] = CONFIRM_ACTION.DELETE_GROUP
CONFIRM_REQUEST[PAGE.USER] = CONFIRM_ACTION.DELETE_USER

const mapDispatchToProps = dispatch => {
  return {
    onClickHome: () => dispatch(gotoHome()),
    onClickPageBack: () => dispatch(backPage()),
    onClickPageForward: () => dispatch(forwardPage()),
    onClickHelp: () => dispatch(gotoHelp()),
    onClickSignInMethod: uid => () => dispatch(gotoSignInMethod(uid)),
    onClickProfile: uid => () => dispatch(gotoUser(uid)),
    onClickEditMode: enable => () => dispatch(setEditMode(enable)),
    onClickDelete: page => () => dispatch(requestConfirm(CONFIRM_REQUEST[page.name], page.id)),
    onClickRevokeManager: () => dispatch(revokeManagerAndRestStatus()),
    onClickRevokeAdmin: () => dispatch(revokeAdminAndRestStatus()),
    onClickSignOut: () => dispatch(signOut()),
    onClickInvitees: () => dispatch(showInvitees()),
    onClickSessions: () => dispatch(showNewSessions()),
    onClickLogs: () => dispatch(showNewLogs()),
    onClickDebug: () => dispatch(setPage(PAGE.DEBUG)),
  }
}

const MenuContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Menu)

export default MenuContainer
