<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getBook, exportBookTxt } from '../store.js'
import { useRouter } from 'vue-router'

const props = defineProps({ id: String })
const router = useRouter()
const book = ref(null)
const chapterIdx = ref(0)
const fontScale = ref(17)

const PROGRESS_KEY = 'novel:reading-progress'

function loadProgress(bookId) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    return typeof all[bookId] === 'number' ? all[bookId] : 0
  } catch { return 0 }
}
function saveProgress(bookId, idx) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')
    all[bookId] = idx
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
  } catch {}
}

function load() {
  book.value = getBook(props.id)
  const saved = loadProgress(props.id)
  const max = (book.value?.chapters?.length || 1) - 1
  chapterIdx.value = Math.max(0, Math.min(saved, max < 0 ? 0 : max))
}
onMounted(load)
watch(() => props.id, load)
watch(chapterIdx, (idx) => { if (props.id) saveProgress(props.id, idx) })

const chapters = computed(() => book.value?.chapters || [])
const current = computed(() => chapters.value[chapterIdx.value])
const hasOutline = computed(() => book.value?.outline?.chapters?.length > 0)

function prev() { if (chapterIdx.value > 0) chapterIdx.value-- }
function next() { if (chapterIdx.value < chapters.value.length - 1) chapterIdx.value++ }
function bigger() { fontScale.value = Math.min(24, fontScale.value + 1) }
function smaller() { fontScale.value = Math.max(14, fontScale.value - 1) }
function exportTxt() {
  if (!book.value) return
  const txt = exportBookTxt(book.value)
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(book.value.title || '未命名').replace(/[\\/:*?"<>|]/g, '')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div v-if="!book" class="empty card">找不到这本书。<button class="btn" @click="router.push('/')">返回书架</button></div>

  <div v-else>
    <div class="between mb">
      <div>
        <h2 style="margin-bottom:4px">{{ book.title || '未命名' }}</h2>
        <div class="muted" style="font-size:13px">
          <span class="tag">{{ book.genre }}</span><span class="tag">{{ book.platform }}</span>
          {{ book.status }}
        </div>
      </div>
      <div class="row">
        <button class="btn sm ghost" @click="smaller" aria-label="缩小字号">A-</button>
        <button class="btn sm ghost" @click="bigger" aria-label="放大字号">A+</button>
        <button class="btn sm" @click="exportTxt">导出 txt</button>
        <button class="btn sm" @click="router.push(`/writer/${book.id}`)">去编辑</button>
        <button class="btn sm" @click="router.push('/')">书架</button>
      </div>
    </div>

    <p v-if="book.synopsis" class="muted card" style="font-size:14px">{{ book.synopsis }}</p>

    <div class="grid cols-2 mt" style="grid-template-columns: 220px 1fr">
      <div class="card" style="max-height:70vh;overflow:auto">
        <div class="muted" style="font-size:13px;margin-bottom:8px">目录（{{ chapters.length }}章）</div>
        <div v-if="chapters.length === 0" class="muted" style="font-size:13px">暂无正文章节，去「编辑」里写吧。</div>
        <div v-for="(c, i) in chapters" :key="c.id"
             :class="['s', i === chapterIdx ? 'active' : '']"
             style="padding:8px 10px;border-radius:8px;cursor:pointer;font-size:14px"
             :style="i === chapterIdx ? 'background:var(--panel2);color:var(--primary)' : ''"
             @click="chapterIdx = i">
          {{ i + 1 }}. {{ c.title || '未命名章节' }}
        </div>
      </div>

      <div class="card">
        <div v-if="chapters.length === 0" class="empty">还没有正文。</div>
        <div v-else>
          <h3>{{ current.title }}</h3>
          <div class="reader-text" :style="{ fontSize: fontScale + 'px' }">
            <p v-for="(p, i) in (current.content || '').split('\n').filter(x => x.trim())" :key="i">{{ p }}</p>
          </div>
          <div class="row between mt">
            <button class="btn" :disabled="chapterIdx === 0" @click="prev">上一章</button>
            <span class="muted" style="font-size:13px">{{ chapterIdx + 1 }} / {{ chapters.length }}</span>
            <button class="btn primary" :disabled="chapterIdx === chapters.length - 1" @click="next">下一章</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
