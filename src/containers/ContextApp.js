/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import App from '../components/App'
import ContextHelp from './ContextHelp'
import ContextEntrance from './ContextEntrance'
import VisibleError from './VisibleError'
import VisibleTop from './VisibleTop'
import VisibleGroup from './VisibleGroup'
import VisibleUser from './VisibleUser'
import VisibleLogs from './VisibleLogs'
import VisibleSessions from './VisibleSessions'
import { getCurrentPage } from '../helper'
import { PAGE } from '../constants'

const mainPage = (prim, name) => {
  switch (name) {
    case PAGE.HELP:
      return ContextHelp
    case PAGE.ERROR:
      return VisibleError
    case PAGE.GROUP:
      return prim ? VisibleGroup : ContextEntrance
    case PAGE.USER:
      return prim ? VisibleUser : ContextEntrance
    case PAGE.LOGS:
      return prim ? VisibleLogs : ContextEntrance
    case PAGE.SESSIONS:
      return prim ? VisibleSessions : ContextEntrance
    default:
      return prim ? VisibleTop : ContextEntrance
  }
}

const mapStateToProps = state => {
  return {
    wait: state.wait,
    MainPage: mainPage(state.prim, getCurrentPage(state.page).name)
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const ContextApp = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)

export default ContextApp
