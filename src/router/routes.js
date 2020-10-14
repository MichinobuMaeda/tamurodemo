const routes = [
  {
    path: '/',
    name: 'top',
    component: () => import('../views/Index.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn.vue'),
    meta: { privs: ['guest'] }
  },
  {
    path: '/invitation/edit',
    name: 'invitationForEdit',
    component: () => import('../views/Invitation.vue'),
    meta: { privs: ['manager', 'admin'] }
  },
  {
    path: '/inv/:invitation',
    name: 'invitation',
    component: () => import('../views/Invitation.vue'),
    meta: { privs: ['guest', 'invited'] }
  },
  {
    path: '/policy',
    name: 'policy',
    component: () => import('../views/Policy.vue'),
    meta: { privs: ['guest', 'user'] }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/Categories.vue'),
    meta: { privs: ['manager'] }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/Users.vue'),
    meta: { privs: ['manager', 'admin'] }
  },
  {
    path: '/users/:id/:mode?',
    name: 'user',
    component: () => import('../views/User.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/groups/:id',
    name: 'group',
    component: () => import('../views/Group.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: () => import('../views/Preferences.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('../views/Service.vue'),
    meta: { privs: ['admin'] }
  }
]

export default routes
