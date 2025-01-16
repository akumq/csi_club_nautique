import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import OffresView from '@/views/Offres.vue'
import ParametresView from '@/views/Parametres.vue'
import PartenairesView from '@/views/Partenaires.vue'
import MaterielsView from '@/views/Materiels.vue'
import RepairsView from '@/views/Repairs.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: () => import('@/views/Clients.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/partenaires',
    name: 'Partenaires',
    component: PartenairesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/materiels',
    name: 'Materiels',
    component: MaterielsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/personnel',
    name: 'Personnel',
    component: () => import('@/views/Personnel.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/offres',
    name: 'offres',
    component: OffresView,
    meta: { requiresAuth: true }
  },
  {
    path: '/parametres',
    name: 'Parametres',
    component: ParametresView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/reparations',
    name: 'Repairs',
    component: RepairsView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isGuest = to.matched.some(record => record.meta.guest)
  const isAuthenticated = store.getters.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (isGuest && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 