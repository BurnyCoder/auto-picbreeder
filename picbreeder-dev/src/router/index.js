import Vue from 'vue'
import VueRouter from 'vue-router'
import Homepage from '../views/Homepage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Homepage',
    component: Homepage
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/evolve',
    name: 'Evolve',
    component: () => import(/* webpackChunkName: "evolve" */ '../views/Evolve.vue')
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import(/* webpackChunkName: "explore" */ '../views/Explore.vue')
  },
  {
    path: '/image/:id',
    name: 'EvolvedImage',
    component: () => import(/* webpackChunkName: "explore" */ '../views/EvolvedImage.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
