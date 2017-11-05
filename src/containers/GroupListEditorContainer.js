/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {PAGE} from '../constants'
import GroupListEditor from '../components/GroupListEditor'
import {currentPage} from '../actions/pages'
import {
  toggleGroupList, commitGroupList ,discardGroupList, groupList
} from '../actions/groups'

const mapStateToProps = ({status, groups, users, pages}) => {
  let page = currentPage(pages)
  let obj = page.name === PAGE.USER_EDITOR_GROUP
    ? users.reduce((ret, cur) => cur._id === page.id ? cur : ret, null)
    : groups.reduce((ret, cur) => cur._id === page.id ? cur : ret, null)

  return page.name === PAGE.GROUP_EDITOR_SUBGROUP
    ? {
      name: obj.name,
      groups: groupList(groups, [status.top._id, page.id]),
      gids: obj.subGroups.map(g => g._id),
      edited: obj.editedSubGroups,
      page,
    }
    : {
      name: obj.name,
      groups: groupList(groups, [page.id]),
      gids: obj.groups.map(g => g._id),
      edited: obj.editedGroups,
      page,
    }
}

const mapDispatchToProps = dispatch => {
  return {
    onGroupToggle: (page, group, checked) => () => dispatch(toggleGroupList(page, group, checked)),
    onClickCommit: page => () => dispatch(commitGroupList(page)),
    onClickCancel: page => () => dispatch(discardGroupList(page)),
  }
}

const GroupListEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupListEditor)

export default GroupListEditorContainer
