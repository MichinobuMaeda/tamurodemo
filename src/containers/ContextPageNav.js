/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import { showGroup, backPage, forwardPage } from '../actions'
import PageNav from '../components/PageNav'

const mapStateToProps = state => {
  let { prim, page, groups } = state 
  return {
    prim,
    page,
    groups,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onGroupSelected: id => () => dispatch(showGroup(id)),
    onPageBack: () => dispatch(backPage()),
    onPageForward: () => dispatch(forwardPage()),
  } 
}

const ContextPageNav = connect(
  mapStateToProps,
  mapDispatchToProps,
)(PageNav)

export default ContextPageNav;
