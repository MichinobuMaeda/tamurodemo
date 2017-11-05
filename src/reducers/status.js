/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const initial = {
  title: {},
  top: {},
  session: {},
  editMode: false,
  scroll: {
    lastScrollTop: 0,
    delta: 0,
    menuOffset: 0,
  }
}

const status = (state = initial, action) => {
  switch (action.type) {
  case A.SET_STATUS:
    return {
      ...state,
      ...action.status,
    }
  case A.SET_TITLE:
    return {
      ...state,
      title: {
        val: action.val,
        ver: action.ver || state.title.ver,
        edited: !action.ver,
      }
    }
  case A.SET_EDIT_MODE:
    return {
      ...state,
      editMode: action.editMode,
    }
  case A.SET_SCROLL_TOP:
    return {
      ...state,
      scroll: {
        lastScrollTop: action.scrollTop,
        delta: state.scroll.lastScrollTop - action.scrollTop,
        menuOffset: Math.max(-64, Math.min(0,
          state.scroll.menuOffset + (state.scroll.lastScrollTop - action.scrollTop) / 3
        )),
      },
    }
  default:
    return state
  }
}

export default status
