import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/research', component: () => import('../views/ResearchView.vue') },
  { path: '/publications', component: () => import('../views/PublicationsView.vue') },
  { path: '/news', component: () => import('../views/NewsView.vue') },
  { path: '/resources', component: () => import('../views/ResourcesView.vue') },
  { path: '/team', component: () => import('../views/TeamView.vue') },
  { path: '/api', component: () => import('../views/ApiView.vue') },
]

export default createRouter({
  history: createWebHashHistory('/datasmith/'),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
