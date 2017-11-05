/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import {currentPage} from '../actions/pages'
import {selectUser, discardEditedUserCert} from '../actions/users'
import UserCertEditor from '../components/UserCertEditor'

const mapStateToProps = ({pages, users}) => {
  return {
    user: selectUser(users, currentPage(pages).id)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickCancel: uid => () => dispatch(discardEditedUserCert(uid)),
  }
}

const UserCertEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserCertEditor)

export default UserCertEditorContainer
