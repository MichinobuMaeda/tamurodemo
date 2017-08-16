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
import { apiGetStatus } from './actions/apis'
import { setStatus } from './actions/auth'
import { initGoogleApi } from './actions/google'
import { resetWait } from './actions/view'
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

apiGetStatus()
.then(json => setStatus(store.dispatch, json))
.then(() => store.dispatch(resetWait()))
