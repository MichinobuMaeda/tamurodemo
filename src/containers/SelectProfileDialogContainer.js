/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import SelectProfileDialog from '../components/SelectProfileDialog'
import {currentPage} from '../actions/pages'
import {setProfileSelection, addProfile} from '../actions/profileSelection'

const mapStateToProps = ({pages, profileSelection}) => {
  return {
    page: currentPage(pages),
    profileSelection,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    handleOk: (uid, tag) => () => dispatch(addProfile(uid, tag)),
    handleCancel: () => dispatch(setProfileSelection(false)),
    onClickTemplate: tag => () => dispatch(setProfileSelection(true, tag)),
  }
}

const SelectProfileDialogContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectProfileDialog)

export default SelectProfileDialogContainer
