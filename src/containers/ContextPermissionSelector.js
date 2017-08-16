/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { setPermission, closePermission } from '../actions/view'
import { updateFormUserProfilePriv } from '../actions/users'
import PermissionSelector from '../components/PermissionSelector'

const mapStateToProps = state => {
  return {
    prim: state.prim,
    groups: state.groups,
    permission: state.permission,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChecked: (gid) => (event, checked) => dispatch(setPermission(gid, checked)),
    onSubmit: (permission) => () => {
      dispatch(closePermission())
      dispatch(updateFormUserProfilePriv(permission.index, permission.key, permission.p))
    },
    onDialogClose: () => dispatch(closePermission()),
  }
}

const ContextPermissionSelector = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PermissionSelector)

export default ContextPermissionSelector;
