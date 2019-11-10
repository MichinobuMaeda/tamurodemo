
const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/Index.vue') } ]
  },
  {
    path: '/loading',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/Loading.vue') } ]
  },
  {
    path: '/policy',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/PrivacyPolicy.vue') } ]
  },
  {
    path: '/signin',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/SignIn.vue') } ]
  },
  {
    path: '/preferences',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/Preferences.vue') } ]
  },
  {
    path: '/groups/:id',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/Group.vue') } ]
  },
  {
    path: '/users/:id',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/User.vue') } ]
  },
  {
    path: '/service',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/Service.vue') } ]
  },
  {
    path: '/raw',
    component: () => import('layouts/MyLayout.vue'),
    children: [ { path: '', component: () => import('pages/RawData.vue') } ]
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
