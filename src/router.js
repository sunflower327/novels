import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Reader from './views/Reader.vue'
import Writer from './views/Writer.vue'
import Teardown from './views/Teardown.vue'
import SkillKB from './views/SkillKB.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/reader/:id', name: 'reader', component: Reader, props: true },
    { path: '/writer', name: 'writer', component: Writer },
    { path: '/writer/:id', name: 'writer-edit', component: Writer, props: true },
    { path: '/teardown', name: 'teardown', component: Teardown },
    { path: '/kb', name: 'kb', component: SkillKB },
  ],
})
