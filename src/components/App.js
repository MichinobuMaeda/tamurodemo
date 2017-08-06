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

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

const App = ({ wait, MainPage }) => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div>
      <ContextMenu />
      <div>
        <div style={{display: wait ? "block" : "none"}}>
          <Progress />
        </div>
        <div style={{display: wait ? "none" : "block"}}>
          <MainPage />
        </div>
      </div>
    </div>
  </MuiThemeProvider>
)

export default App
