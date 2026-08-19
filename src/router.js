import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/reader/:id', name: 'reader', component: () => import('./views/Reader.vue'), props: true },
    { path: '/writer', name: 'writer', component: () => import('./views/Writer.vue') },
    { path: '/writer/:id', name: 'writer-edit', component: () => import('./views/Writer.vue'), props: true },
    { path: '/teardown', name: 'teardown', component: () => import('./views/Teardown.vue') },
    { path: '/kb', name: 'kb', component: () => import('./views/SkillKB.vue') },
  ],
})
