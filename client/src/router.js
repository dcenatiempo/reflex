import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "about" */ './views/Home.vue'),
    }, {
      path: '/arena',
      name: 'arena',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/Arena.vue'),
      meta: { requiresAuth: true },
    }, {
      path: '/arena/:room',
      name: 'room',
      component: () => import(/* webpackChunkName: "about" */ './views/Room.vue'),
      meta: { requiresAuth: true },
    },
    // {
    //   path: '*',
    //   redirect: 'home',
    // }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)
  const currentUser = window.sessionStorage.getItem;

  if (requiresAuth && !currentUser) {
      next('/login')
  } else if (requiresAuth && currentUser) {
      next()
  } else {
      next()
  }
})

export default router;
