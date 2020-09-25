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
    name: 'myprofile',
    component: () => import('../views/Me.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/service',
    name: 'service',
    component: () => import('../views/Service.vue'),
    meta: { privs: ['admin'] }
  },
  {
    path: '/raw',
    name: 'raw',
    component: () => import('../views/RawData.vue'),
    meta: { privs: ['tester', 'admin'] }
  }
]

export default routes
