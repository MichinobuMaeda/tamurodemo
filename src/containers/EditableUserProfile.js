/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import FormUserProfile from '../components/FormUserProfile'
import { openAlert, closeAlert, backPage, openPermission } from '../actions/view'
import { deleteFormUserProfile, updateFormUserProfileField } from '../actions/users'
import { getOriginalUser } from '../helper'

const mapStateToProps = state => {
  let { editedUser, users, groups, prim, page } = state 
  return {
    editedUser,
    user: getOriginalUser(users, groups, editedUser._id),
    groups,
    prim,
    page,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onFieldChanged: (index, key) => event => dispatch(
      updateFormUserProfileField(index, key, event.target.value)
    ),
    onPrivChange: (index, key, p) => event => dispatch(openPermission({
      index,
      key,
      p: p || []
    })),
    onReturn: () => dispatch(backPage()),
  }
}

const EditableUserProfile = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FormUserProfile)

export default EditableUserProfile;
