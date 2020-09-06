import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'top',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/raw',
    name: 'raw',
    component: () => import('../views/RawData.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
