<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useToast } from './toast.js'
const toast = useToast()
</script>

<template>
  <div class="app">
    <header class="nav">
      <RouterLink to="/" class="brand">📖 网文创作与阅读</RouterLink>
      <nav>
        <RouterLink to="/">书架</RouterLink>
        <RouterLink to="/writer">创作</RouterLink>
        <RouterLink to="/kb">知识库</RouterLink>
      </nav>
    </header>
    <main class="main">
      <RouterView />
    </main>
    <footer class="foot">基于 novel-trend-writing skill · 本地模板生成 · 数据存于浏览器</footer>
    <Transition name="toast">
      <div v-if="toast.show" class="toast">{{ toast.msg }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.toast {
  position: fixed; left: 50%; bottom: 60px; transform: translateX(-50%);
  background: #2a313c; color: #e7e9ee; padding: 10px 20px; border-radius: 10px;
  border: 1px solid var(--border); box-shadow: 0 8px 30px rgba(0,0,0,.5); font-size: 14px; z-index: 50;
}
.toast-enter-active, .toast-leave-active { transition: opacity .25s, transform .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
