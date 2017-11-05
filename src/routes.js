/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {METHOD, PRIV} from './constants'
import {getStatus} from './actions/status'
import {
  getGroups, getGroup, updateGroup, deleteGroup, setGroupsOfGroup
} from './actions/groups'
import {
  getUsers, getUser, updateUser, deleteUser, setGroupsOfUser
} from './actions/users'
import {createSubGroup, setSubGroups} from './actions/subGroups'
import {createMember, setMembers} from './actions/members'
import {setOwners} from './actions/owners'
import {
  createUserCert, updateUserCert, deleteUserCert
} from './actions/userCerts'
import {
  getSessions, createSession, deleteSession, deleteMySession,
  revokeManager, revokeAdmin
} from './actions/sessions'
import {createToken, getInvitees, getToken} from './actions/token'
import {getLogs} from './actions/logs'
import {getHelps, updateHelp, updateTitle} from './actions/preferences'

const routes = [
  {
    method: METHOD.GET,
    path: '/',
    priv: PRIV.GUEST,
    action: getStatus,
  },
  {
    method: METHOD.GET,
    path: '/groups',
    priv: PRIV.MEMBER,
    action: getGroups,
  },
  {
    method: METHOD.GET,
    path: '/groups/(:gid)',
    priv: PRIV.MEMBER,
    action: getGroup,
  },
  {
    method: METHOD.PUT,
    path: '/groups/(:gid)/ver/(:ver)',
    priv: PRIV.OWNER,
    action: updateGroup,
  },
  {
    method: METHOD.DELETE,
    path: '/groups/(:gid)/ver/(:ver)',
    priv: PRIV.MANAGER,
    action: deleteGroup,
  },
  {
    method: METHOD.PUT,
    path: '/groups/(:gid)/groups',
    priv: PRIV.MANAGER,
    action: setGroupsOfGroup,
  },
  {
    method: METHOD.POST,
    path: '/groups/(:gid)/subgroups',
    priv: PRIV.MANAGER,
    action: createSubGroup,
  },
  {
    method: METHOD.PUT,
    path: '/groups/(:gid)/subgroups',
    priv: PRIV.OWNER,
    action: setSubGroups,
  },
  {
    method: METHOD.POST,
    path: '/groups/(:gid)/users',
    priv: PRIV.MANAGER,
    action: createMember,
  },
  {
    method: METHOD.PUT,
    path: '/groups/(:gid)/users',
    priv: PRIV.OWNER,
    action: setMembers,
  },
  {
    method: METHOD.PUT,
    path: '/groups/(:gid)/owners',
    priv: PRIV.OWNER,
    action: setOwners,
  },
  {
    method: METHOD.GET,
    path: '/users',
    priv: PRIV.MANAGER,
    action: getUsers,
  },
  {
    method: METHOD.GET,
    path: '/invitees',
    priv: PRIV.ADMIN,
    action: getInvitees,
  },
  {
    method: METHOD.GET,
    path: '/users/(:uid)',
    priv: PRIV.MEMBER,
    action: getUser,
  },
  {
    method: METHOD.PUT,
    path: '/users/(:uid)/ver/(:ver)',
    priv: PRIV.USER,
    action: updateUser,
  },
  {
    method: METHOD.DELETE,
    path: '/users/(:uid)/ver/(:ver)',
    priv: PRIV.MANAGER,
    action: deleteUser,
  },
  {
    method: METHOD.POST,
    path: '/users/(:uid)/certs',
    priv: PRIV.USER,
    action: createUserCert,
  },
  {
    method: METHOD.PUT,
    path: '/users/(:uid)/certs/(:provider)/ver/(:ver)',
    priv: PRIV.USER,
    action: updateUserCert,
  },
  {
    method: METHOD.DELETE,
    path: '/users/(:uid)/certs/(:provider)/ver/(:ver)',
    priv: PRIV.USER,
    action: deleteUserCert,
  },
  {
    method: METHOD.PUT,
    path: '/users/(:uid)/groups',
    priv: PRIV.MANAGER,
    action: setGroupsOfUser,
  },
  {
    method: METHOD.GET,
    path: '/sessions/(:from)/to/(:to)',
    priv: PRIV.ADMIN,
    action: getSessions,
  },
  {
    method: METHOD.POST,
    path: '/sessions',
    priv: PRIV.GUEST,
    action: createSession,
  },
  {
    method: METHOD.DELETE,
    path: '/sessions/(:sid)',
    priv: PRIV.ADMIN,
    action: deleteSession,
  },
  {
    method: METHOD.DELETE,
    path: '/sessions/me',
    priv: PRIV.MEMBER,
    action: deleteMySession,
  },
  {
    method: METHOD.PUT,
    path: '/sessions/me/revoke/manager',
    priv: PRIV.MANAGER,
    action: revokeManager,
  },
  {
    method: METHOD.PUT,
    path: '/sessions/me/revoke/admin',
    priv: PRIV.ADMIN,
    action: revokeAdmin,
  },
  {
    method: METHOD.POST,
    path: '/token',
    priv: PRIV.ADMIN,
    action: createToken,
  },
  {
    method: METHOD.GET,
    path: '/token/(:token)',
    priv: PRIV.GUEST,
    action: getToken,
  },
  {
    method: METHOD.GET,
    path: '/logs/(:from)/to/(:to)',
    priv: PRIV.ADMIN,
    action: getLogs,
  },
  {
    method: METHOD.GET,
    path: '/helps',
    priv: PRIV.GUEST,
    action: getHelps,
  },
  {
    method: METHOD.PUT,
    path: '/helps/(:pid)/ver/(:ver)',
    priv: PRIV.ADMIN,
    action: updateHelp,
  },
  {
    method: METHOD.PUT,
    path: '/title/ver/(:ver)',
    priv: PRIV.ADMIN,
    action: updateTitle,
  },
]

export default routes
