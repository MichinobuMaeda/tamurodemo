/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import {render} from 'react-dom'
import {createStore, applyMiddleware} from 'redux'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import reducers from './reducers'
import AppContainer from './containers/AppContainer'
import {init} from './actions/status'
import {setScrollTop} from './actions/status'

let store = createStore(
  reducers,
  applyMiddleware(thunk),
)

window.addEventListener('scroll', () => store.dispatch(
  setScrollTop(document.documentElement.scrollTop)
))

init(store).then(() => render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
))
