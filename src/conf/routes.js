export const routes = [
  {
    path: '/',
    name: 'top',
    component: () => import('../pages/Index.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../pages/SignIn.vue'),
    meta: { privs: ['guest'] }
  },
  {
    path: '/invitation/edit',
    name: 'invitationForEdit',
    component: () => import('../pages/Invitation.vue'),
    meta: { privs: ['manager', 'admin'] }
  },
  {
    path: '/inv/:invitation',
    name: 'invitation',
    component: () => import('../pages/Invitation.vue'),
    meta: { privs: ['guest', 'invited'] }
  },
  {
    path: '/policy',
    name: 'policy',
    component: () => import('../pages/Policy.vue'),
    meta: { privs: ['guest', 'user'] }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../pages/Categories.vue'),
    meta: { privs: ['manager'] }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../pages/Users.vue'),
    meta: { privs: ['manager', 'admin'] }
  },
  {
    path: '/users/:id/:mode?',
    name: 'user',
    component: () => import('../pages/User.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/groups/:id',
    name: 'group',
    component: () => import('../pages/Group.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: () => import('../pages/Preferences.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('../pages/Service.vue'),
    meta: { privs: ['admin'] }
  }
]
