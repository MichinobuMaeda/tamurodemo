/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import Top from '../components/Top'
import {PAGE} from '../constants'
import {setPage} from '../actions/pages'
import {gotoGroup} from '../actions/groups'

const mapStateToProps = ({status}) => {
  return {
    status,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickTitleEdit: () => dispatch(setPage(PAGE.TITLE_EDITOR)),
    onClickGroup: gid => () => dispatch(gotoGroup(gid)),
  }
}

const TopContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Top)

export default TopContainer
