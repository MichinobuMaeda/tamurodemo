/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import FormGroup from '../components/FormGroup'
import { openAlert, closeAlert } from '../actions/view'
import {
  updateFormGroup, updateFormGroupParent,
  commitEditedGroup, cancelEditGroup, commitRemoveGroup
} from '../actions/groups'
import { getOriginalGroup } from '../helper'

const mapStateToProps = state => {
  let { editedGroup, prim, groups } = state 
  return {
    editedGroup,
    group: getOriginalGroup(groups, editedGroup._id),
    groups,
    prim,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFieldChanged: key => (event) => dispatch(updateFormGroup(key, event.target.value)),
    onChecked: gid => (event, checked) => dispatch(updateFormGroupParent(gid, checked)),
    onSubmit: (event) => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(commitEditedGroup) },
      message: "編集内容を保存します。",
      ok: "保存",
      cancel: "戻る",
    })),
    onCancel: (event) => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(cancelEditGroup) },
      message: "編集を中止します。",
      ok: "中止",
      cancel: "戻る",
    })),
    onDelete: (event) => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(commitRemoveGroup) },
      message: "グループを削除します。",
      ok: "削除",
      cancel: "戻る",
    })),
  } 
}

const EditableGroup = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FormGroup)

export default EditableGroup;
