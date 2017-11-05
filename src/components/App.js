/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

import {muiTheme} from '../preferences'
import MenuContainer from '../containers/MenuContainer'

injectTapEventPlugin()

const App = ({Main}) => (
  <MuiThemeProvider muiTheme={muiTheme}>
    <div>
      <MenuContainer/>
      <div style={{height: 64}}></div>
      <Main/>
    </div>
  </MuiThemeProvider>
)

App.propTypes = {
  Main: PropTypes.func,
  onScrollContent: PropTypes.func,
}

export default App
