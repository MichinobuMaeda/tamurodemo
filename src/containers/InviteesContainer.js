/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import Invitees from '../components/Invitees'
import {inviteUser} from '../actions/invitees'

const mapStateToProps = ({invitees}) => {
  return {
    invitees,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickInvite: uid => () => dispatch(inviteUser(uid))
  }
}

const InviteesContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Invitees)

export default InviteesContainer
