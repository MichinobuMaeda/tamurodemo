/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import App from '../components/App'
import {PAGE} from '../constants'
import {currentPage} from '../actions/pages'
import GoodByeContainer from './GoodByeContainer'
import TopContainer from './TopContainer'
import TitleEditorContainer from './TitleEditorContainer'
import GuestContainer from './GuestContainer'
import WelcomeContainer from './WelcomeContainer'
import GroupContainer from './GroupContainer'
import GroupEditorContainer from './GroupEditorContainer'
import GroupListEditorContainer from './GroupListEditorContainer'
import UserCertEditorContainer from './UserCertEditorContainer'
import UserContainer from './UserContainer'
import UserEditorContainer from './UserEditorContainer'
import UserListEditorContainer from './UserListEditorContainer'
import HelpContainer from './HelpContainer'
import HelpEditorContainer from './HelpEditorContainer'
import ErrorsContainer from './ErrorsContainer'
import InviteesContainer from './InviteesContainer'
import SessionsContainer from './SessionsContainer'
import LogsContainer from './LogsContainer'
import DebugContainer from './DebugContainer'

const page = name => {
  switch (name) {
  case PAGE.GOODBYE: return GoodByeContainer
  case PAGE.TOP: return TopContainer
  case PAGE.TITLE_EDITOR: return TitleEditorContainer
  case PAGE.GUEST: return GuestContainer
  case PAGE.WELCOME: return WelcomeContainer
  case PAGE.USER: return UserContainer
  case PAGE.USER_CERT_EDITOR: return UserCertEditorContainer
  case PAGE.USER_EDITOR: return UserEditorContainer
  case PAGE.USER_EDITOR_GROUP: return GroupListEditorContainer
  case PAGE.GROUP: return GroupContainer
  case PAGE.GROUP_EDITOR: return GroupEditorContainer
  case PAGE.GROUP_EDITOR_GROUP: return GroupListEditorContainer
  case PAGE.GROUP_EDITOR_SUBGROUP: return GroupListEditorContainer
  case PAGE.GROUP_EDITOR_OWNER: return UserListEditorContainer
  case PAGE.GROUP_EDITOR_MEMBER: return UserListEditorContainer
  case PAGE.HELP: return HelpContainer
  case PAGE.HELP_EDITOR: return HelpEditorContainer
  case PAGE.ERRORS: return ErrorsContainer
  case PAGE.INVITEES: return InviteesContainer
  case PAGE.SESSIONS: return SessionsContainer
  case PAGE.LOGS: return LogsContainer
  case PAGE.DEBUG: return DebugContainer
  default: return null
  }
}

const mapStateToProps = ({pages}) => {
  return {
    Main: page(currentPage(pages).name),
  }
}

// const mapDispatchToProps = dispatch => {
//   return {
//   }
//}

const AppContainer = connect(
  mapStateToProps,
  // mapDispatchToProps,
)(App)

export default AppContainer
