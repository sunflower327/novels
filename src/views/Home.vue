<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadBooks, deleteBook, exportAll, importAll, bookWordCount, togglePin, downloadBlob } from '../store.js'
import { useRouter } from 'vue-router'
import { notify } from '../toast.js'

const books = ref([])
const router = useRouter()
const search = ref('')
const sortKey = ref('updated')
const filterGenre = ref('')
const filterStatus = ref('')

function refresh() { books.value = loadBooks() }
onMounted(refresh)

function del(id) {
  if (confirm('删除这本书？此操作不可恢复。')) { deleteBook(id); refresh() }
}
function fmt(ts) { return ts ? new Date(ts).toLocaleString('zh-CN') : '' }
function pin(id) { togglePin(id); refresh() }

const PALETTE = {
  都市: 'linear-gradient(135deg,#3a4a6a,#1a2230)', 末世: 'linear-gradient(135deg,#5a3a3a,#241a1a)',
  玄幻: 'linear-gradient(135deg,#4a3a6a,#241a30)', 悬疑: 'linear-gradient(135deg,#3a3a3a,#1a1a1a)',
  言情: 'linear-gradient(135deg,#6a3a5a,#301a28)', 科幻: 'linear-gradient(135deg,#2a4a5a,#102028)',
  历史: 'linear-gradient(135deg,#5a4a2a,#28201a)', 系统: 'linear-gradient(135deg,#2a5a4a,#102820)',
  重生: 'linear-gradient(135deg,#5a4a3a,#28201a)',
}
function coverStyle(b) {
  return { background: PALETTE[b.genre] || 'linear-gradient(135deg,#2a2f3d,#1a1e27)' }
}

const filtered = computed(() => {
  let arr = [...books.value]
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    arr = arr.filter((b) => (b.title || '').toLowerCase().includes(q) || (b.synopsis || '').toLowerCase().includes(q))
  }
  if (filterGenre.value) arr = arr.filter((b) => (b.genre || '') === filterGenre.value)
  if (filterStatus.value) arr = arr.filter((b) => (b.status || '构思中') === filterStatus.value)
  arr.sort((a, b) => {
    // 置顶优先
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1
    if (sortKey.value === 'title') return (a.title || '').localeCompare(b.title || '', 'zh')
    return (b.updatedAt || 0) - (a.updatedAt || 0)
  })
  return arr
})

const genres = computed(() => [...new Set(books.value.map((b) => b.genre).filter(Boolean))])
const statuses = computed(() => [...new Set(books.value.map((b) => b.status || '构思中').filter(Boolean))])

function doExport() {
  downloadBlob(exportAll(), `novels-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
  notify('已导出备份')
}
function onImport(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const n = importAll(reader.result)
      refresh()
      notify(`已导入 ${n} 部作品`)
    } catch (err) {
      notify('导入失败：' + err.message)
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<template>
  <div class="between mb">
    <h2>我的书架</h2>
    <div class="row">
      <input v-model="search" placeholder="搜索书名/简介" style="width:160px" />
      <select v-model="filterGenre" style="width:auto">
        <option value="">全部题材</option>
        <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
      </select>
      <select v-model="filterStatus" style="width:auto">
        <option value="">全部状态</option>
        <option v-for="st in statuses" :key="st" :value="st">{{ st }}</option>
      </select>
      <select v-model="sortKey" style="width:auto">
        <option value="updated">按更新时间</option>
        <option value="title">按书名</option>
      </select>
      <button class="btn" @click="doExport">导出</button>
      <label class="btn" style="cursor:pointer">导入<input type="file" accept="application/json" @change="onImport" style="display:none" /></label>
      <button class="btn primary" @click="router.push('/writer')">+ 新建作品</button>
    </div>
  </div>

  <div v-if="filtered.length === 0" class="empty card">
    {{ books.length === 0 ? '书架空空如也。点击右上角「新建作品」开始你的第一本小说。' : '没有匹配的作品。' }}
  </div>

  <div v-else class="grid cols-3">
    <div class="card book-card" v-for="b in filtered" :key="b.id">
      <div class="book-cover" :style="coverStyle(b)">{{ (b.title || '未命名').slice(0, 8) }}</div>
      <div class="book-info">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <strong class="book-title">{{ b.title || '未命名作品' }}</strong>
          <span v-if="b.pinned" class="pin-mark" title="已置顶">📌</span>
        </div>
        <div class="muted book-meta">
          <span class="tag sm-tag">{{ b.genre || '未分类' }}</span>
          <span class="tag sm-tag">{{ b.status || '构思中' }}</span>
          <span>{{ b.chapters?.length || 0 }} 章 · {{ bookWordCount(b) }} 字</span>
        </div>
        <p class="book-syn" v-if="b.synopsis">{{ b.synopsis.slice(0, 60) }}{{ b.synopsis.length > 60 ? '…' : '' }}</p>
      </div>
      <div class="book-actions">
        <button class="btn sm primary" @click="router.push(`/reader/${b.id}`)">阅读</button>
        <button class="btn sm" @click="router.push(`/writer/${b.id}`)">编辑</button>
        <button class="btn sm ghost icon-btn" @click="pin(b.id)" :title="b.pinned ? '取消置顶' : '置顶'">{{ b.pinned ? '📍' : '📌' }}</button>
        <button class="btn sm danger icon-btn" @click="del(b.id)" title="删除">🗑</button>
      </div>
      <div class="book-time">{{ fmt(b.updatedAt) }}</div>
    </div>
  </div>
</template>
