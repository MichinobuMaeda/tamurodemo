/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { showGroup } from '../actions/groups'
import Top from '../components/Top'
import { findOneById } from '../helper'

const mapStateToProps = state => {
  let group = findOneById(state.groups, state.prim.top)
  return {
    prim: state.prim,
    group,
    groups: state.groups,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onGroupSelected: id => () => dispatch(showGroup(id)),
  }
}

const VisibleTop = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Top)

export default VisibleTop;
