<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import skillMd from '../skills/SKILL.md?raw'
import refMd from '../skills/reference.md?raw'
import exMd from '../skills/examples.md?raw'

const tabs = [
  { key: 'skill', name: 'SKILL 说明', md: skillMd },
  { key: 'ref', name: '参考库', md: refMd },
  { key: 'ex', name: '使用示例', md: exMd },
]
const active = ref('ref')
const current = computed(() => tabs.find((t) => t.key === active.value))
const html = computed(() => marked.parse(current.value.md))

const container = ref(null)
const toc = ref([])
const keyword = ref('')

function buildToc() {
  nextTick(() => {
    const hs = container.value?.querySelectorAll('h1, h2') || []
    toc.value = [...hs].map((h, i) => ({ id: 'kb-h-' + i, level: h.tagName, text: h.textContent }))
    hs.forEach((h, i) => (h.id = 'kb-h-' + i))
  })
}
watch(active, buildToc, { immediate: true })
onMounted(buildToc)

function scrollTo(idx) {
  const el = document.getElementById(toc.value[idx].id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) return
  const hs = container.value?.querySelectorAll('h1,h2,h3,li,p') || []
  for (const h of hs) {
    if (h.textContent.includes(kw)) {
      h.scrollIntoView({ behavior: 'smooth', block: 'center' })
      h.style.transition = 'background .3s'
      h.style.background = 'rgba(110,168,254,.25)'
      setTimeout(() => (h.style.background = ''), 1200)
      return
    }
  }
}
</script>

<template>
  <div class="between mb">
    <h2>技能知识库</h2>
    <span class="muted" style="font-size:13px">来自 novel-trend-writing skill · 创作时可随时查阅</span>
  </div>
  <div class="steps">
    <div v-for="t in tabs" :key="t.key" :class="['s', t.key === active ? 'active' : '']" @click="active = t.key">{{ t.name }}</div>
  </div>

  <div class="kb-layout">
    <aside class="kb-side card">
      <input v-model="keyword" @keydown.enter="doSearch" placeholder="搜索关键词（回车跳转）" style="margin-bottom:10px" />
      <button class="btn sm primary" style="width:100%;margin-bottom:14px" @click="doSearch">跳转到匹配处</button>
      <div class="muted" style="font-size:12px;margin-bottom:6px">目录</div>
      <div v-for="(t, i) in toc" :key="i" class="toc-item" :style="t.level === 'H1' ? 'font-weight:600' : 'padding-left:14px'"
           @click="scrollTo(i)">{{ t.text }}</div>
    </aside>
    <div class="card kb">
      <div ref="container" class="kb-content" v-html="html"></div>
    </div>
  </div>
</template>

<style scoped>
.kb-layout { display: grid; grid-template-columns: 220px 1fr; gap: 16px; }
@media (max-width: 720px){ .kb-layout { grid-template-columns: 1fr; } }
.kb-side { max-height: 72vh; overflow: auto; position: sticky; top: 70px; }
.toc-item { font-size: 13px; padding: 5px 6px; border-radius: 6px; cursor: pointer; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.toc-item:hover { background: var(--panel2); color: var(--text); }
.kb { max-height: 72vh; overflow: auto; }
.kb-content { font-size: 14px; line-height: 1.8; }
.kb-content :deep(h1) { font-size: 22px; margin: 4px 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.kb-content :deep(h2) { font-size: 18px; margin: 22px 0 10px; color: var(--primary); }
.kb-content :deep(h3) { font-size: 16px; margin: 16px 0 8px; }
.kb-content :deep(p) { margin: 8px 0; }
.kb-content :deep(ul), .kb-content :deep(ol) { padding-left: 22px; margin: 8px 0; }
.kb-content :deep(li) { margin: 4px 0; }
.kb-content :deep(table) { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 13px; }
.kb-content :deep(th), .kb-content :deep(td) { border: 1px solid var(--border); padding: 8px 10px; text-align: left; }
.kb-content :deep(th) { background: var(--panel2); }
.kb-content :deep(code) { background: #11141b; padding: 2px 6px; border-radius: 5px; font-size: 13px; }
.kb-content :deep(pre) { background: #11141b; border: 1px solid var(--border); border-radius: 10px; padding: 12px; overflow: auto; }
.kb-content :deep(pre code) { background: none; padding: 0; }
.kb-content :deep(blockquote) { border-left: 3px solid var(--primary); margin: 10px 0; padding: 4px 14px; color: var(--muted); }
.kb-content :deep(a) { color: var(--primary); }
</style>
