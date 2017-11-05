/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import GroupEditor from '../components/GroupEditor'
import {currentPage} from '../actions/pages'
import {
  setGroupName, setGroupDesc, commitEditedGroup, discardEditedGroup, selectGroup
} from '../actions/groups'

const mapStateToProps = ({groups, pages}) => {
  return {
    group: selectGroup(groups, currentPage(pages).id),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onNameChange: gid => event => dispatch(setGroupName(gid, event.target.value)),
    onDescChange: gid => event => dispatch(setGroupDesc(gid, event.target.value)),
    onClickCommit: gid => () => dispatch(commitEditedGroup(gid)),
    onClickCancel: gid => () => dispatch(discardEditedGroup(gid)),
  }
}

const GroupEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GroupEditor)

export default GroupEditorContainer
