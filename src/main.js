import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { storeReady } from './store'

// 等待存储层就绪（IndexedDB 加载/迁移完成）再挂载，确保组件首屏读到数据
storeReady.finally(() => {
  createApp(App).use(router).mount('#app')
})
