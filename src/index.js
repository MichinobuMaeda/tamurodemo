/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import reducers from './reducers'
import { setStatus, resetWait } from './actions'
import { initGoogleApi } from './actions/google'
import ContextApp from './containers/ContextApp'

let store = createStore(
  reducers,
  applyMiddleware(thunk),
)

render(
  <Provider store={store}>
    <ContextApp />
  </Provider>,
  document.getElementById('root')
)

initGoogleApi()

fetch('/api/', { credentials: 'same-origin' })
.then(res => res.json())
.then(json => setStatus(store.dispatch, json))
.then(() => store.dispatch(resetWait()))
