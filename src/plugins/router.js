import Vue from 'vue'
import VueRouter from 'vue-router'
import { routes } from '../conf'

Vue.use(VueRouter)

const router = new VueRouter({
  routes
})

export default router
