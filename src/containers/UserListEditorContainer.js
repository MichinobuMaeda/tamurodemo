/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PAGE} from '../constants'
import UserListEditor from '../components/UserListEditor'
import {currentPage} from '../actions/pages'
import {selectGroup} from '../actions/groups'
import {
  toggleUserList, commitUserList, discardUserList
} from '../actions/users'

const mapStateToProps = ({groups, users, pages}) => {
  let page = currentPage(pages)
  let group = selectGroup(groups, page.id)

  return page.name === PAGE.GROUP_EDITOR_OWNER
    ? {
      name: group.name,
      users,
      uids: group.owners.map(g => g._id),
      edited: group.editedOwners,
      page,
    }
    : {
      name: group.name,
      users,
      uids: group.users.map(g => g._id),
      edited: group.editedUsers,
      page,
    }
}

const mapDispatchToProps = dispatch => {
  return {
    onUserToggle: (page, group, checked) => () => dispatch(toggleUserList(page, group, checked)),
    onClickCommit: page => () => dispatch(commitUserList(page)),
    onClickCancel: page => () => dispatch(discardUserList(page)),
  }
}

const UserListEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserListEditor)

export default UserListEditorContainer
