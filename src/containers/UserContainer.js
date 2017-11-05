/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PAGE} from '../constants'
import {resetContent} from '../actions/status'
import {setPage ,currentPage} from '../actions/pages'
import {gotoGroup, gotoGroupListEditor} from '../actions/groups'
import {selectUser, gotoSignInMethod} from '../actions/users'
import User from '../components/User'

const mapStateToProps = ({status, users, pages}) => {
  return {
    status,
    user: selectUser(users, currentPage(pages).id),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickEditUser: uid => () => dispatch(setPage(PAGE.USER_EDITOR, uid)),
    onClickEditGroupList: page => () => dispatch(gotoGroupListEditor(page)),
    onClickGroup: gid => () => dispatch(gotoGroup(gid)),
    onClickSignInMethod: uid => () => dispatch(gotoSignInMethod(uid)),
    onClickReset: () => dispatch(resetContent()),
  }
}

const UserContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(User)

export default UserContainer
