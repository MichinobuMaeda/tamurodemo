/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import tamuroApp from './reducers'
import App from './components/App'

let store = createStore(tamuroApp)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
