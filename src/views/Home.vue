<script setup>
import { ref, onMounted } from 'vue'
import { loadBooks, deleteBook } from '../store.js'
import { useRouter } from 'vue-router'

const books = ref([])
const router = useRouter()

function refresh() { books.value = loadBooks() }
onMounted(refresh)

function del(id) {
  if (confirm('删除这本书？此操作不可恢复。')) { deleteBook(id); refresh() }
}
function fmt(ts) { return ts ? new Date(ts).toLocaleString('zh-CN') : '' }
</script>

<template>
  <div class="between mb">
    <h2>我的书架</h2>
    <button class="btn primary" @click="router.push('/writer')">+ 新建作品</button>
  </div>

  <div v-if="books.length === 0" class="empty card">
    书架空空如也。<br/>点击右上角「新建作品」开始你的第一本小说。
  </div>

  <div v-else class="grid cols-3">
    <div class="card" v-for="b in books" :key="b.id" style="display:flex;flex-direction:column;gap:10px">
      <div class="book-cover">{{ b.title || '未命名' }}</div>
      <div>
        <div class="row" style="justify-content:space-between">
          <strong>{{ b.title || '未命名作品' }}</strong>
          <span class="tag">{{ b.platform }}</span>
        </div>
        <div class="muted" style="font-size:13px;margin-top:4px">
          {{ b.genre || '未分类' }} · {{ b.status || '构思中' }} · {{ b.chapters?.length || 0 }} 章
        </div>
        <p class="muted" style="font-size:13px;margin:8px 0 0" v-if="b.synopsis">
          {{ b.synopsis.slice(0, 60) }}{{ b.synopsis.length > 60 ? '…' : '' }}
        </p>
      </div>
      <div class="row" style="margin-top:auto">
        <button class="btn sm primary" @click="router.push(`/reader/${b.id}`)">阅读</button>
        <button class="btn sm" @click="router.push(`/writer/${b.id}`)">编辑</button>
        <button class="btn sm danger" @click="del(b.id)">删除</button>
      </div>
      <div class="muted" style="font-size:11px">{{ fmt(b.updatedAt) }}</div>
    </div>
  </div>
</template>
