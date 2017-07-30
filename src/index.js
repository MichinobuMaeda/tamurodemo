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
import { setStatus } from './actions'
import App from './containers/App'

fetch('/api/', { credentials: 'same-origin' })
.then(res => res.json())
.then(json => ({
  store: createStore(
    reducers,
    applyMiddleware(thunk),
  ),
  json,
}))
.then(res => {
  setStatus(res.store.dispatch, res.json)
  return res.store
})
.then(store => render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
))
