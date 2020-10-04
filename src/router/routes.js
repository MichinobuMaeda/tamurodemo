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
    path: '/policy',
    name: 'policy',
    component: () => import('../views/Policy.vue'),
    meta: { privs: ['user', 'guest'] }
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
    path: '/service',
    name: 'service',
    component: () => import('../views/Service.vue'),
    meta: { privs: ['admin'] }
  }
]

export default routes
