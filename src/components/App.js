/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import muiTheme from './muiTheme'

import ContextMenu from '../containers/ContextMenu'
import Progress from './Progress';
import ContextHelp from '../containers/ContextHelp'
import ContextEntrance from '../containers/ContextEntrance'
import VisibleError from '../containers/VisibleError'
import VisibleTop from '../containers/VisibleTop'
import VisibleGroup from '../containers/VisibleGroup'
import VisibleUser from '../containers/VisibleUser'
import EditableCredential from '../containers/EditableCredential'
import EditableGroup from '../containers/EditableGroup'
import EditableUser from '../containers/EditableUser'
import EditableUserProfile from '../containers/EditableUserProfile'
import VisibleLogs from '../containers/VisibleLogs'
import VisibleSessions from '../containers/VisibleSessions'
import { getCurrentPage } from '../helper'
import { PAGE } from '../constants'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

const mainPage = (prim, name) => {
  switch (name) {
    case PAGE.HELP:         return ContextHelp
    case PAGE.ERROR:        return VisibleError
    case PAGE.GROUP:        return prim ? VisibleGroup : ContextEntrance
    case PAGE.USER:         return prim ? VisibleUser : ContextEntrance
    case PAGE.CREDENTIAL:   return prim ? EditableCredential : ContextEntrance
    case PAGE.FORM_GROUP:   return prim ? EditableGroup : ContextEntrance
    case PAGE.FORM_USER:    return prim ? EditableUser : ContextEntrance
    case PAGE.FORM_USER_PROFILE:  return prim ? EditableUserProfile : ContextEntrance
    case PAGE.LOGS:         return prim ? VisibleLogs : ContextEntrance
    case PAGE.SESSIONS:     return prim ? VisibleSessions : ContextEntrance
    default: return prim ? VisibleTop : ContextEntrance
  }
}

const App = ({ wait, prim ,page }) => {
  let MainPage = mainPage(prim, getCurrentPage(page).name)
  return (
    <MuiThemeProvider muiTheme={muiTheme}>
      <div>
        <ContextMenu />
        { wait ? <Progress /> : <MainPage /> }
      </div>
    </MuiThemeProvider>
  )
}

export default App
