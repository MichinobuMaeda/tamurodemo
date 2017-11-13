/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PAGE} from '../constants'
import {resetContent} from '../actions/status'
import {setPage, currentPage} from '../actions/pages'
import {
  gotoGroup, gotoGroupListEditor, editNewGroup, selectGroup
} from '../actions/groups'
import {gotoUser, editNewUser, gotoUserListEditor} from '../actions/users'
import Group from '../components/Group'

const mapStateToProps = ({status, groups, pages}) => {
  return {
    status,
    group: selectGroup(groups, currentPage(pages).id),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickEditGroup: gid => () => dispatch(setPage(PAGE.GROUP_EDITOR, gid)),
    onClickNewGroup: group => () => dispatch(editNewGroup(group)),
    onClickNewUser: group => () => dispatch(editNewUser(group)),
    onClickEditGroupList: (name, id) => () => dispatch(gotoGroupListEditor({name, id})),
    onClickEditUserList: (name, id) => () => dispatch(gotoUserListEditor({name, id})),
    onClickGroup: gid => () => dispatch(gotoGroup(gid)),
    onClickUser: uid => () => dispatch(gotoUser(uid)),
    onClickReset: () => dispatch(resetContent()),
  }
}

const GroupContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Group)

export default GroupContainer
