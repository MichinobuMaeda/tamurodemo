/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import FormUser from '../components/FormUser'
import { openAlert, closeAlert, setPage } from '../actions/view'
import {
  updateFormUser, updateFormUserParent,
  commitEditedUser, cancelEditUser, commitRemoveUser,
  deleteFormUserProfile, addFormUserProfile
} from '../actions/users'
import { PAGE } from '../constants'
import { getOriginalUser } from '../helper'

const mapStateToProps = state => {
  let { editedUser, prim, groups, users, sess } = state 
  return {
    editedUser,
    user: getOriginalUser(users, groups, editedUser._id),
    groups,
    prim,
    sess,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFieldChanged: key => event => dispatch(updateFormUser(key, event.target.value)),
    onChecked: gid => (event, checked) => dispatch(updateFormUserParent(gid, checked)),
    onProfileSelected: index => () => dispatch(setPage(PAGE.FORM_USER_PROFILE, index)),
    onProfileDelete: index => () => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(deleteFormUserProfile(index)) },
      message: "プロファイルを削除します。",
      ok: "削除",
      cancel: "戻る",
    })),
    onAddProfile: index => () => {
      dispatch(addFormUserProfile({ title: { v: '', p: [] }}));
      dispatch(setPage(PAGE.FORM_USER_PROFILE, index))
    },
    onSubmit: event => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(commitEditedUser) },
      message: "編集内容を保存します。",
      ok: "保存",
      cancel: "戻る",
    })),
    onCancel: event => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(cancelEditUser) },
      message: "編集を中止します。",
      ok: "中止",
      cancel: "戻る",
    })),
    onDelete: event => dispatch(openAlert({
      action: () => { dispatch(closeAlert()); dispatch(commitRemoveUser) },
      message: "グループを削除します。",
      ok: "削除",
      cancel: "戻る",
    })),
  } 
}

const EditableUser = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FormUser)

export default EditableUser;
