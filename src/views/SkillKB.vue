<script setup>
import { ref, computed } from 'vue'
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
</script>

<template>
  <div class="between mb">
    <h2>技能知识库</h2>
    <span class="muted" style="font-size:13px">来自 novel-trend-writing skill · 创作时可随时查阅</span>
  </div>
  <div class="steps">
    <div v-for="t in tabs" :key="t.key" :class="['s', t.key === active ? 'active' : '']" @click="active = t.key">{{ t.name }}</div>
  </div>
  <div class="card kb">
    <div class="kb-content" v-html="html"></div>
  </div>
</template>

<style scoped>
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
