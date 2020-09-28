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
    path: '/me',
    name: 'me',
    component: () => import('../views/Me.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/categories',
    name: 'categories',
    component: () => import('../views/Categories.vue'),
    meta: { privs: ['manager'] }
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('../views/Service.vue'),
    meta: { privs: ['admin'] }
  }
]

export default routes
