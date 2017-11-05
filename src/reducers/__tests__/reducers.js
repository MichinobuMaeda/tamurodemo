/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {createStore} from 'redux'

import {PAGE} from '../../constants'
import reducers from '../'

test('initial', () => {
  const status = createStore(reducers).getState()
  expect(status).toEqual({
    status: {
      title: {},
      top: {},
      session: {},
    },
    page: {
      history: [
        {
          name: PAGE.GUEST,
          id: null,
        }
      ],
      curr: 0,
    },
    group: {},
    user: {},
    signin: {},
    errors: [],
    help: [],
  })
})
