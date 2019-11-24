
const routes = [
  {
    path: '',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      {
        path: '/',
        name: 'top',
        component: () => import('pages/Index.vue')
      },
      {
        path: '/loading',
        name: 'loading',
        component: () => import('pages/Loading.vue')
      },
      {
        path: '/policy',
        name: 'policy',
        component: () => import('pages/PrivacyPolicy.vue')
      },
      {
        path: '/signin',
        name: 'signin',
        component: () => import('pages/SignIn.vue')
      },
      {
        path: '/preferences',
        name: 'preferences',
        component: () => import('pages/Preferences.vue')
      },
      {
        path: '/groups/:id',
        name: 'group',
        component: () => import('pages/Group.vue')
      },
      {
        path: '/users/:id',
        name: 'user',
        component: () => import('pages/User.vue')
      },
      {
        path: '/service',
        name: 'service',
        component: () => import('pages/Service.vue')
      },
      {
        path: '/raw',
        name: 'raw',
        component: () => import('pages/RawData.vue')
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
