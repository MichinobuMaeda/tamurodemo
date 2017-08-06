/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { showGroup, setPage } from '../actions'
import { PAGE } from '../constants'
import { getCurrentPage } from '../helper'
import Group from '../components/Group'

const mapStateToProps = state => {
  let { prim, page, groups, users } = state 
  let group = groups.reduce((ret, g) => g._id === getCurrentPage(page).id ? g : ret, null)
  return {
    prim,
    group,
    groups,
    users: users.filter(u => group.uids.reduce((ret, cur) => u._id === cur || ret, false)),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onGroupSelected: id => () => dispatch(showGroup(id)),
    onUserSelected: id => () => dispatch(setPage(PAGE.USER, id)),
  } 
}

const VisibleGroup = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Group)

export default VisibleGroup;
