/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import A from './constants'

import testStore from '../testStore'

export const setTitle = (title) => ({
  type: A.SET_TITLE,
  title,
})

export const setPage = (name, id = null) => ({
  type: A.SET_PAGE,
  page: { name, id },
})

export const resetPage = () => ({
  type: A.RESET_PAGE,
})

export const setPrimary = primary => ({
  type: A.SET_PRIMARY,
  primary,
})

export const resetPrimary = () => ({
  type: A.RESET_PRIMARY,
})

export const setPrivilege = privilege => ({
  type: A.SET_PRIVILEGE,
  privilege,
})

export const resetPrivilege = () => ({
  type: A.RESET_PRIVILEGE,
})

export const doSingIn = dispatch => {
  dispatch(setPage('top'))
  dispatch(setPrimary(testStore.primary))
}

export const doSingOut = dispatch => {
  dispatch(resetPage())
  dispatch(resetPrimary())
  dispatch(resetPrivilege())
}
