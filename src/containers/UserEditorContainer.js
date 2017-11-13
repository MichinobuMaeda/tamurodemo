/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import UserEditor from '../components/UserEditor'
import {currentPage} from '../actions/pages'
import {CONFIRM_ACTION, requestConfirm} from '../actions/confirmation'
import {
  setUserName, setUserDesc, commitEditedUser, discardEditedUser, selectUser
} from '../actions/users'
import {setProfileSelection, updateProfileTag, updateProfileVal} from '../actions/profileSelection'

const mapStateToProps = ({users, pages}) => {
  return {
    user: selectUser(users, currentPage(pages).id),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onNameChange: uid => event => dispatch(setUserName(uid, event.target.value)),
    onDescChange: uid => event => dispatch(setUserDesc(uid, event.target.value)),
    onClickCommit: uid => () => dispatch(commitEditedUser(uid)),
    onClickCancel: uid => () => dispatch(discardEditedUser(uid)),
    onClickNewProfile: () => dispatch(setProfileSelection(true)),
    onProfileTagChange: (uid, i) => event => dispatch(updateProfileTag(uid, i, event.target.value)),
    onProfileValChange: (uid, i, key) => event => dispatch(updateProfileVal(uid, i, key, event.target.value)),
    onClickDeleteProfile: ({uid, index, profile}) =>
      () => dispatch(requestConfirm(CONFIRM_ACTION.DELETE_PROFILE, {uid, index, profile})),
  }
}

const UserEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserEditor)

export default UserEditorContainer
