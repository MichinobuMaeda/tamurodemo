const routes = [
  {
    path: '/',
    name: 'top',
    component: () => import('../views/Index.vue'),
    meta: { privs: ['user'] }
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
    component: () => import('../views/MyProfile.vue'),
    meta: { privs: ['user'] }
  },
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../views/SignIn.vue'),
    meta: { privs: ['guest'] }
  },
  {
    path: '/raw',
    name: 'raw',
    component: () => import('../views/RawData.vue'),
    meta: { privs: ['tester', 'admin'] }
  }
]

export default routes
