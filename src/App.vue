<script setup>
import { RouterLink, RouterView } from 'vue-router'
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
  </div>
</template>
