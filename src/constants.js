/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

export const A = {
  SET_STATUS: 'SET_STATUS',
  SET_TITLE: 'SET_TITLE',
  SET_EDIT_MODE: 'SET_EDIT_MODE',
  SET_SCROLL_TOP: 'SET_SCROLL_TOP',
  
  SET_PAGE: 'SET_PAGE',
  RESET_PAGE: 'RESET_PAGE',
  BACK_PAGE: 'BACK_PAGE',
  FORWARD_PAGE: 'FORWARD_PAGE',

  SET_GROUPS: 'SET_GROUPS',
  SET_GROUP: 'SET_GROUP',
  SET_GROUP_NAME: 'SET_GROUP_NAME',
  SET_GROUP_DESC: 'SET_GROUP_DESC',
  SET_GROUP_LIST_GROUP: 'SET_GROUP_LIST_GROUP',
  SET_GROUP_LIST_SUBGROUP: 'SET_GROUP_LIST_SUBGROUP',
  SET_GROUP_LIST_OWNER: 'SET_GROUP_LIST_OWNER',
  SET_GROUP_LIST_MEMBER: 'SET_GROUP_LIST_MEMBER',
  ADD_GROUP_LIST_GROUP: 'ADD_GROUP_LIST_GROUP',
  ADD_GROUP_LIST_SUBGROUP: 'ADD_GROUP_LIST_SUBGROUP',
  ADD_GROUP_LIST_OWNER: 'ADD_GROUP_LIST_OWNER',
  ADD_GROUP_LIST_MEMBER: 'ADD_GROUP_LIST_MEMBER',
  REMOVE_GROUP_LIST_GROUP: 'REMOVE_GROUP_LIST_GROUP',
  REMOVE_GROUP_LIST_SUBGROUP: 'REMOVE_GROUP_LIST_SUBGROUP',
  REMOVE_GROUP_LIST_OWNER: 'REMOVE_GROUP_LIST_OWNER',
  REMOVE_GROUP_LIST_MEMBER: 'REMOVE_GROUP_LIST_MEMBER',
  REMOVE_GROUP: 'REMOVE_GROUP',
  RESET_GROUPS: 'RESET_GROUPS',

  SET_USERS: 'SET_USERS',
  SET_USER: 'SET_USER',
  SET_USER_NAME: 'SET_USER_NAME',
  SET_USER_DESC: 'SET_USER_DESC',
  SET_USER_LIST_GROUP: 'SET_USER_LIST_GROUP',
  ADD_USER_LIST_GROUP: 'ADD_USER_LIST_GROUP',
  REMOVE_USER_LIST_GROUP: 'REMOVE_USER_LIST_GROUP',
  REMOVE_USER: 'REMOVE_USER',
  RESET_USERS: 'RESET_USERS',
  SET_CERT_ID: 'SET_CERT_ID',
  SET_CERT_PASSWORD: 'SET_CERT_PASSWORD',
  SET_CERT_CONFIRM: 'SET_CERT_CONFIRM',

  SET_SIGN_IN_ID: 'SET_SIGN_IN_ID',
  SET_SIGN_IN_PASSWORD: 'SET_SIGN_IN_PASSWORD',
  SET_SIGN_IN_CONFIRM: 'SET_SIGN_IN_CONFIRM',
  RESET_SIGN_IN_CERTS: 'RESET_SIGN_IN_CERTS',

  SET_CONFIRMATION: 'SET_CONFIRMATION',
  
  SET_HELP_ALL: 'SET_HELP_ALL',
  SET_HELP_MD: 'SET_HELP_MD',
  SET_HELP: 'SET_HELP',

  SET_ERRORS: 'SET_ERRORS',

  SET_INVITEES: 'SET_INVITEES',
  
  SET_SESSIONS: 'SET_SESSIONS',
  UPDATE_SESSIONS: 'UPDATE_SESSIONS',
  APPEND_SESSIONS: 'APPEND_SESSIONS',

  SET_LOGS: 'SET_LOGS',
  APPEND_LOGS: 'APPEND_LOGS',
}

export const PAGE = {
  GOODBYE: 'PAGE.GOODBYE',
  TOP: 'PAGE.TOP',
  TITLE_EDITOR: 'PAGE.TITLE_EDITOR',
  WELCOME: 'PAGE.WELCOME',
  GUEST: 'PAGE.GUEST',
  GROUP: 'PAGE.GROUP',
  USER: 'PAGE.USER',
  MY_CERT: 'MY_CERT',
  USER_CERT_EDITOR: 'USER_CERT_EDITOR',
  USER_EDITOR: 'USER_EDITOR',
  USER_EDITOR_GROUP: 'USER_EDITOR_GROUP',
  GROUP_EDITOR: 'GROUP_EDITOR',
  GROUP_EDITOR_GROUP: 'GROUP_EDITOR_GROUP',
  GROUP_EDITOR_SUBGROUP: 'GROUP_EDITOR_SUBGROUP',
  GROUP_EDITOR_OWNER: 'GROUP_EDITOR_OWNER',
  GROUP_EDITOR_MEMBER: 'GROUP_EDITOR_MEMBER',
  HELP: 'PAGE.HELP',
  HELP_EDITOR: 'PAGE.HELP_EDITOR',
  ERRORS: 'PAGE.ERRORS',
  INVITEES: 'PAGE.INVITEES',
  SESSIONS: 'PAGE.SESSIONS',
  LOGS: 'PAGE.LOGS',
  DEBUG: 'PAGE.DEBUG',
}

export const NEW_GROUP_ID = '#NEW#'
export const NEW_USER_ID = '#NEW#'

export const COLOR_WHITE = '#ffffff'
export const COLOR_BLACK = '#000000'

export const PAPER_STYLE = {margin: '4px', padding: '8px'}
export const BUTTON_STYLE = {margin: 4}
export const CHIP_STYLE = {margin: 4}
export const WRAPPER_STYLE = {display: 'flex', flexWrap: 'wrap', float: 'left'}

export const ICON_STYLE = {
  height: 32,
  width: 32,
}

export const ICON_STYLE_H1 = {
  height: 32,
  width: 32,
  verticalAlign: 'text-top',
}

export const ICON_BUTTON_STYLE = {
  height: 40,
  width: 40,
  padding: 4,
  margin: 4,
}

export const ICONS = {
  CANCEL: 'ICON.CANCEL',
  USER_CERT: 'ICON.USER_CERT',
  CONFIRM: 'ICON.CONFIRM',
  DELETE: 'ICON.DELETE',
  DEBUG: 'ICON.DEBUG',
  EDIT: 'ICON.EDIT',
  HELP: 'ICON.HELP',
  HISTORY: 'ICON.HISTORY',
  HOME: 'ICON.HOME',
  GO_BACK: 'ICON.GO_BACK',
  GO_FORWARD: 'ICON.GO_FORWARD',
  NEW_GROUP: 'ICON.NEW_GROUP',
  NEW_PERSON: 'ICON.NEW_PERSON',
  UPDATE: 'ICON.UPDATE',
}

export const ADMIN_GET_SESSIONS_TIME_SPAN = 10 * 24 * 3600 * 1000
export const ADMIN_GET_LOGS_TIME_SPAN = 10 * 24 * 3600 * 1000

// ----- API ----- //

export const METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

export const PROVIDER = {
  TOKEN: 'TOKEN',
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
}

export const GROUP_ROLE = {
  TOP: 'TOP',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
}

export const PRIV = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  USER: 'USER',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
}

export const HELP = {
  ADMIN: 'HELP_ADMIN',
  MANAGER: 'HELP_MANAGER',
  MEMBER: 'HELP_MEMBER',
  GUEST: 'HELP_GUEST',
}

export const ERRORS = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  CERT_CREATED: 'CERT_CREATED',
  DATA_REVISED: 'DATA_REVISED',
  CERT_MISSED: 'CERT_MISSED',
}

// ----- API ----- //
