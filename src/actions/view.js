/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

export const setPage = (name, id = null) => ({
  type: A.SET_PAGE,
  page: { name, id },
})

export const resetPage = () => ({
  type: A.RESET_PAGE,
})

export const backPage = (eraseForward = false) => ({
  type: A.BACK_PAGE,
  eraseForward,
})

export const forwardPage = () => ({
  type: A.FORWARD_PAGE,
})

export const setWait = () => ({
  type: A.SET_WAIT,
})

export const resetWait = () => ({
  type: A.RESET_WAIT,
})

export const openAlert = (alert) => ({
  type: A.OPEN_ALERT,
  alert,
})

export const closeAlert = () => ({
  type: A.CLOSE_ALERT,
})

export const openPermission = (permission) => ({
  type: A.OPEN_PERMISSION,
  permission,
})

export const setPermission = (gid, checked) => ({
  type: A.SET_PERMISSION,
  gid,
  checked,
})

export const closePermission = () => ({
  type: A.CLOSE_PERMISSION,
})
