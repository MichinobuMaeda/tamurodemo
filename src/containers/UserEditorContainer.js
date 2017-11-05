/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import UserEditor from '../components/UserEditor'
import {currentPage} from '../actions/pages'
import {
  setUserName, setUserDesc, commitEditedUser, discardEditedUser, selectUser
} from '../actions/users'

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
  }
}

const UserEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserEditor)

export default UserEditorContainer
