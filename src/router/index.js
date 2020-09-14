import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import guard from './guard'

Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  guard(to, from, next)
})

export default router
