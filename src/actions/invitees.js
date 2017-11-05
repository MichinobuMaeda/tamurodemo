/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE} from '../constants'
import {setPage, currentPage} from './pages'
import {gotoErrorPage} from './errors'
import {getInvitees, createToken} from './api'

export const setInvitees = invitees => ({
  type: A.SET_INVITEES,
  invitees,
})

export const showInvitees = () => async (dispatch, getState) => {
  const {pages} = getState()
  const res = await getInvitees()
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setInvitees(res))
    if (currentPage(pages).name !== PAGE.INVITEES) {
      dispatch(setPage(PAGE.INVITEES))
    }
  }
}

export const inviteUser = uid => async dispatch => {
  let res = await createToken({uid})
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    let res = await getInvitees()
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setInvitees(res))
    }
  }
}
