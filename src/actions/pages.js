/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE, GROUP_ROLE} from '../constants'

export const setPage = (name, id = null) => ({
  type: A.SET_PAGE,
  page: {name, id},
})

export const resetPage = (name, id = null) => ({
  type: A.RESET_PAGE,
  page: {name, id},
})

export const backPage = (reset = false) => ({
  type: A.BACK_PAGE,
  reset,
})

export const forwardPage = () => ({
  type: A.FORWARD_PAGE,
})

export const currentPage = page => page.history[page.curr]
export const isBackPage = page => 0 < page.curr
export const isForwardPage = page => page.history.length - 1 > page.curr

export const isEditable = (status, page) => {
  if (!status.session || !status.session.uid) {return false}
  switch(page.name) {
  case PAGE.TOP:
    return status.session.isAdmin
  case PAGE.HELP:
    return status.session.isAdmin
  case PAGE.GROUP:
    return status.session.isManager ||
      -1 < status.session.oids.indexOf(page.id)
  case PAGE.USER:
    return status.session.isManager ||
      status.session.uid === page.id
  default:
    return false
  }
}

const unRemovableGroupRoles = [
  GROUP_ROLE.TOP,
  GROUP_ROLE.MANAGER,
  GROUP_ROLE.ADMIN,
]

export const isRemovable = (status, page, groups) => {
  if (!status.session || !status.session.uid) {return false}
  switch(page.name) {
  case PAGE.GROUP:
    return status.session.isManager &&
      groups.filter(g => g._id === page.id &&
        0 > unRemovableGroupRoles.indexOf(g.role)).length
  case PAGE.USER:
    return status.session.isManager
  default:
    return false
  }
}

export const isTraversable = page => {
  return 0 > [
    PAGE.GROUP_EDITOR,
    PAGE.GROUP_EDITOR_GROUP,
    PAGE.GROUP_EDITOR_OWNER,
    PAGE.GROUP_EDITOR_SUBGROUP,
    PAGE.GROUP_EDITOR_MEMBER,
    PAGE.USER_EDITOR,
    PAGE.USER_EDITOR_GROUP,
    PAGE.USER_CERT_EDITOR,
    PAGE.TITLE_EDITOR,
    PAGE.HELP_EDITOR,
  ].indexOf(page.name)
}
