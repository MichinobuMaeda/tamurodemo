/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const initial = { f: 0, t: 0, cnt: 0, logs: [] }

const logs = (state = initial, action) => {
  switch (action.type) {
    case A.SET_LOGS:
      let { f, t, cnt, logs } = action.logs
      let add = logs.filter(log => !state.logs.reduce((ret, cur) => ret || cur._id === log._id, false))
      logs = add.length === 0
        ? state.logs
        : state.logs.length === 0
          ? add
          : add[0].time > state.logs[0].time
            ? [ ...add, ...state.logs ]
            : [ ...state.logs, ...add ]
      state.f = state.f || f
      f = f < state.f ? f : state.f
      t = t > state.t ? t : state.t
      return { f, t, cnt, logs }
    case A.RESET_LOGS:
      return initial
    default:
      return state
  }
}

export default logs
