/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import { connect } from 'react-redux'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import muiTheme from '../muiTheme'

import ContextMenu from '../containers/ContextMenu'
import Progress from '../components/Progress';
import ContextHelp from '../containers/ContextHelp'
import ContextEntrance from '../containers/ContextEntrance'
import VisibleError from '../containers/VisibleError'
import VisibleTop from '../containers/VisibleTop'
import VisibleGroup from '../containers/VisibleGroup'
import VisibleUser from '../containers/VisibleUser'

import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

let App = ({ page, prim, error, wait }) => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div>
      <ContextMenu />
      <div>
        <div style={{display: wait ? "block" : "none"}}>
          <Progress />
        </div>
        <div style={{display: wait ? "none" : "block"}}>
          {
            page.history[page.curr].name === 'help'
              ? <ContextHelp />
              : page.history[page.curr].name === 'error'
                ? <VisibleError />
                : !prim
                  ? <ContextEntrance />
                  : page.history[page.curr].name === 'group'
                    ? <VisibleGroup />
                    : page.history[page.curr].name === 'user'
                      ? <VisibleUser />
                      : <VisibleTop />
          }
        </div>
      </div>
    </div>
  </MuiThemeProvider>
)

const mapStateToProps = state => {
  return {
    page: state.page,
    prim: state.prim,
    error: state.error,
    wait: state.wait,
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

App = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)

export default App
