<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getBook, upsertBook, newBook, uid, bookWordCount } from '../store.js'
import { notify } from '../toast.js'
import {
  GENRES, PLATFORMS, genInspiration, genTitles, genSynopsis, genOutline,
  genVolumeOutline, genChapterOutline, genCharacter, genRelationships,
  continueWriting, diagnoseAI, deAI, evalSubmission,
} from '../lib/generators.js'
import {
  providers, loadSettings, saveSettings, isConfigured, smartGenerate,
} from '../lib/ai.js'

const props = defineProps({ id: String })
const router = useRouter()
const book = ref(newBook())
const step = ref(0)
const persisted = ref(false)
const steps = ['灵感', '书名', '简介', '总纲', '卷纲', '章纲', '角色', '关系', '续写', '去AI', '投稿']

// AI 设置
const ai = reactive(loadSettings())
const showAiSettings = ref(false)
const busy = ref('')
const goalWords = ref(Number(localStorage.getItem('novel:goal-words') || 200000))
function persistAi() { saveSettings(ai) }
function onProviderChange() {
  const p = providers.find(x => x.v === ai.provider)
  if (p && p.baseURL && !ai.baseURL) ai.baseURL = p.baseURL
  if (p && p.model && !ai.model) ai.model = p.model
  persistAi()
}
function aiEnabled() { return ai.enabled && isConfigured(ai) }
async function runAi(kind, label, ...args) {
  busy.value = label
  notify(`${label}生成中…`)
  try {
    const result = await smartGenerate(ai, kind, ...args)
    return result
  } catch (e) {
    notify(`${label}失败：${e.message || e}`)
    return null
  } finally {
    busy.value = ''
  }
}

// 各步骤临时输入/输出
const s = reactive({
  idea: '', genre: '都市', platform: '番茄',
  inspiration: null, titles: [], synopsis: '',
  outline: '', volumes: [], chapters: [],
  chars: [], relText: '',
  newName: '', newRole: '主角',
  prevText: '', chapSummary: '', written: '',
  editId: '', // 续写：正在编辑的章节 id
  aiText: '', aiDiag: [], aiResult: '',
  evalRows: [],
})

function load() {
  if (props.id) {
    const b = getBook(props.id)
    if (b) {
      book.value = b
      persisted.value = true
      s.idea = b.inspiration || ''
      s.genre = b.genre || '都市'
      s.platform = b.platform || '番茄'
      s.synopsis = b.synopsis || ''
      s.outline = b.outline?.main || ''
      s.volumes = b.outline?.volumes || []
      s.chapters = b.outline?.chapters || []
      s.chars = b.characters || []
      s.relText = b.relationships || ''
    }
  }
}
onMounted(load)
watch(() => props.id, () => { if (props.id && props.id !== book.value.id) load() })

function save() {
  book.value.inspiration = s.idea
  book.value.genre = s.genre
  book.value.platform = s.platform
  book.value.synopsis = s.synopsis
  book.value.outline = { main: s.outline, volumes: s.volumes, chapters: s.chapters }
  book.value.characters = s.chars
  book.value.relationships = s.relText
  book.value.evaluation = s.evalRows
  upsertBook(book.value)
  // 新书首次保存后跳转到带 id 的路由，避免刷新丢失
  if (!props.id && !persisted.value) {
    persisted.value = true
    router.replace(`/writer/${book.value.id}`)
  }
}
// 防抖自动保存：输入时 800ms 内只写一次
let saveTimer = null
function autosave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(save, 800)
}
function saved(msg = '已保存') { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null } save(); notify(msg) }

// 字数统计
const writtenWords = computed(() => (s.written || '').length)
const totalWords = computed(() => bookWordCount(book.value) + writtenWords.value)
const progressPct = computed(() => Math.min(100, Math.round(totalWords.value / goalWords.value * 100)))
function setGoal() { localStorage.setItem('novel:goal-words', String(goalWords.value)) }

function copy(text, label = '已复制') {
  navigator.clipboard?.writeText(text).then(() => notify(label)).catch(() => {})
}

// 灵感
async function doInspiration() {
  const r = await runAi('inspiration', '灵感卡', s.idea, s.genre, s.platform)
  if (r) { s.inspiration = r; saved('已生成灵感卡') }
}
// 书名
async function doTitles() {
  const r = await runAi('titles', '书名', s.idea, s.genre, s.platform)
  if (r) { s.titles = r; notify('已生成书名备选') }
}
function useTitle(t) {
  book.value.title = t.replace(/[《》]/g, '')
  saved('已采用书名')
}
// 简介
async function doSynopsis() {
  const r = await runAi('synopsis', '简介', book.value.title, s.genre, s.platform, s.idea)
  if (r) { s.synopsis = r; book.value.synopsis = r; saved('已生成简介') }
}
// 总纲
async function doOutline() {
  const r = await runAi('outline', '总纲', s.genre, s.inspiration?.selling?.join('、'))
  if (r) { s.outline = r; book.value.outline = { ...book.value.outline, main: r }; saved('已生成总纲') }
}
// 卷纲
async function doVolumes() {
  const r = await runAi('volumes', '卷纲', s.genre, 3)
  if (r) { s.volumes = r; book.value.outline = { ...book.value.outline, volumes: r }; saved('已生成卷纲') }
}
// 章纲
async function doChapters() {
  const r = await runAi('chapters', '章纲')
  if (r) { s.chapters = r; book.value.outline = { ...book.value.outline, chapters: r }; saved('已生成章纲') }
}
// 角色
async function addChar() {
  const r = await runAi('character', '角色卡', s.newName, s.newRole, s.genre)
  if (r) { r.id = uid(); s.chars.push(r); book.value.characters = s.chars; saved('已添加角色'); s.newName = '' }
}
function delChar(i) { s.chars.splice(i, 1); saved('已删除角色') }
// 关系
async function doRel() {
  const r = await runAi('relationships', '关系', s.chars)
  if (r) { s.relText = r; book.value.relationships = r; saved('已生成关系') }
}
// 续写
async function doWrite() {
  // 构建上下文：角色卡 + 总纲 + 前3章梗概，让 AI 续写更连贯
  const ctx = {
    outline: s.outline || '',
    chars: s.chars || [],
    prevChapters: (book.value.chapters || []).slice(-3),
  }
  const r = await runAi('writing', '续写', s.prevText, s.chapSummary, ctx)
  if (r) { s.written = r; notify('已生成续写草稿') }
}
// 章纲→续写联动：带入章纲梗概并跳转续写步骤
function writeFromChapter(c) {
  s.editId = ''
  s.written = ''
  s.chapSummary = `${c.title}：${c.summary || ''}${c.hook ? '（章末钩子：' + c.hook + '）' : ''}`
  step.value = 8
  notify('已带入章纲，点「续写」生成正文')
}
function saveChapter() {
  if (!s.written.trim()) return
  book.value.chapters = book.value.chapters || []
  if (s.editId) {
    const c = book.value.chapters.find((x) => x.id === s.editId)
    if (c) { c.title = s.chapSummary ? s.chapSummary.slice(0, 24) : c.title; c.content = s.written }
    saved('已更新章节')
  } else {
    const title = s.chapSummary ? s.chapSummary.slice(0, 24) : `第${(book.value.chapters.length || 0) + 1}章`
    book.value.chapters.push({ id: uid(), title, content: s.written })
    saved('已存为新章节')
  }
  s.written = ''
  s.chapSummary = ''
  s.editId = ''
}
function editChapter(c) {
  s.editId = c.id
  s.written = c.content
  s.chapSummary = c.title
  step.value = 8
  notify('已载入章节，修改后点「保存章节」')
}
function delChapter(i) {
  if (!confirm('删除该章节？')) return
  book.value.chapters.splice(i, 1)
  saved('已删除章节')
}
function moveChapter(i, dir) {
  const arr = book.value.chapters
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
  saved('已调整顺序')
}
function newChapter() {
  s.editId = ''
  s.written = ''
  s.chapSummary = ''
  step.value = 8
}
// 去AI
function doDiag() {
  s.aiDiag = diagnoseAI(s.aiText)
  notify(`诊断完成，命中 ${s.aiDiag.length} 处`)
}
function doDeAI() {
  s.aiResult = deAI(s.aiText)
  notify('已真人化')
}
// 投稿
function doEval() {
  s.evalRows = evalSubmission({
    title: book.value.title, synopsis: s.synopsis, platform: s.platform,
    opening: (book.value.chapters?.[0]?.content) || s.written || '',
  })
  book.value.evaluation = s.evalRows
  saved('已生成评估')
}

function goReader() { save(); router.push(`/reader/${book.value.id}`) }
function goHome() { save(); router.push('/') }
</script>

<template>
  <div class="between mb">
    <h2>创作工作台</h2>
    <div class="row">
      <input v-model="book.title" @input="autosave" placeholder="书名" style="width:200px" />
      <button class="btn" @click="goHome">保存返回</button>
      <button class="btn primary" @click="goReader">去阅读</button>
      <button class="btn" :class="aiEnabled() ? 'primary' : 'ghost'" @click="showAiSettings = true" :title="aiEnabled() ? 'AI 模式已开启' : 'AI 模式未开启'">
        🤖 AI {{ aiEnabled() ? '已开启' : '未开启' }}
      </button>
    </div>
  </div>

  <div class="steps">
    <div v-for="(st, i) in steps" :key="st" :class="['s', i === step ? 'active' : '']" @click="step = i">{{ i + 1 }}.{{ st }}</div>
  </div>

  <div class="card">
    <!-- 灵感 -->
    <div v-show="step === 0">
      <h3>灵感脑洞 → 可写故事</h3>
      <label>脑洞/灵感（一句话：谁+什么能力/处境+要干什么）</label>
      <textarea v-model="s.idea" placeholder="例：一个人能听见别人心里对他的评价"></textarea>
      <div class="row mt">
        <label style="margin:0">题材</label>
        <select v-model="s.genre" style="width:auto"><option v-for="g in GENRES" :key="g">{{ g }}</option></select>
        <label style="margin:0">平台</label>
        <select v-model="s.platform" style="width:auto"><option v-for="p in PLATFORMS" :key="p">{{ p }}</option></select>
        <button class="btn primary" @click="doInspiration">生成灵感卡</button>
      </div>
      <div v-if="s.inspiration" class="mt">
        <div class="between">
          <strong>灵感卡</strong>
          <button class="btn sm" @click="copy(JSON.stringify(s.inspiration, null, 2))">复制</button>
        </div>
        <pre class="out mt">{{ JSON.stringify(s.inspiration, null, 2) }}</pre>
      </div>
    </div>

    <!-- 书名 -->
    <div v-show="step === 1">
      <h3>书名取名</h3>
      <button class="btn primary" @click="doTitles">生成书名备选</button>
      <div v-if="s.titles.length" class="mt">
        <div v-for="t in s.titles" :key="t" class="row" style="justify-content:space-between;padding:8px;border-bottom:1px solid var(--border)">
          <span>{{ t }}</span>
          <span class="row">
            <button class="btn sm ghost" @click="copy(t, '已复制书名')">复制</button>
            <button class="btn sm primary" @click="useTitle(t)">采用</button>
          </span>
        </div>
      </div>
      <p class="muted mt" style="font-size:13px">当前书名：<strong>{{ book.title || '未命名' }}</strong></p>
    </div>

    <!-- 简介 -->
    <div v-show="step === 2">
      <h3>简介生成</h3>
      <button class="btn primary" @click="doSynopsis">按公式生成简介</button>
      <div class="between mt">
        <label style="margin:0">简介（可手动编辑）</label>
        <button v-if="s.synopsis" class="btn sm ghost" @click="copy(s.synopsis, '已复制简介')">复制</button>
      </div>
      <textarea v-model="s.synopsis" @input="autosave" style="min-height:140px"></textarea>
    </div>

    <!-- 总纲 -->
    <div v-show="step === 3">
      <h3>总纲</h3>
      <button class="btn primary" @click="doOutline">生成总纲</button>
      <div class="between mt">
        <label style="margin:0">总纲（可编辑）</label>
        <button v-if="s.outline" class="btn sm ghost" @click="copy(s.outline, '已复制总纲')">复制</button>
      </div>
      <textarea v-model="s.outline" @input="autosave" style="min-height:140px"></textarea>
    </div>

    <!-- 卷纲 -->
    <div v-show="step === 4">
      <h3>卷纲</h3>
      <button class="btn primary" @click="doVolumes">生成卷纲（3卷）</button>
      <div v-if="s.volumes.length" class="mt">
        <div v-for="(v, i) in s.volumes" :key="i" class="card" style="background:var(--panel2);margin-bottom:10px">
          <strong>第{{ v.index }}卷 {{ v.name }}</strong>
          <div class="muted" style="font-size:13px">{{ v.goal }}</div>
          <div class="muted" style="font-size:13px">阶段：{{ v.stages.join(' / ') }}</div>
          <div class="muted" style="font-size:13px">钩子：{{ v.hook }}</div>
        </div>
      </div>
    </div>

    <!-- 章纲 -->
    <div v-show="step === 5">
      <h3>章纲（示例 10 章）</h3>
      <button class="btn primary" @click="doChapters">生成章纲</button>
      <div v-if="s.chapters.length" class="mt">
        <div v-for="(c, i) in s.chapters" :key="i" style="padding:8px 0;border-bottom:1px solid var(--border)">
          <div class="between">
            <strong>{{ c.title }}</strong>
            <button class="btn sm primary" @click="writeFromChapter(c)">续写此章 →</button>
          </div>
          <div class="muted" style="font-size:13px">{{ c.summary }}</div>
          <div class="muted" style="font-size:13px">钩子：{{ c.hook }}</div>
        </div>
      </div>
    </div>

    <!-- 角色 -->
    <div v-show="step === 6">
      <h3>角色卡</h3>
      <div class="row">
        <input v-model="s.newName" placeholder="角色名" style="width:160px" />
        <select v-model="s.newRole" style="width:auto"><option>主角</option><option>女主</option><option>配角</option><option>反派</option></select>
        <button class="btn primary" @click="addChar">+ 生成角色</button>
      </div>
      <div v-if="s.chars.length" class="mt">
        <div v-for="(c, i) in s.chars" :key="c.id" class="card" style="background:var(--panel2);margin-bottom:10px">
          <div class="between">
            <strong>{{ c.name }}（{{ c.role }}）</strong>
            <span class="row">
              <button class="btn sm ghost" @click="copy(JSON.stringify(c, null, 2), '已复制角色卡')">复制</button>
              <button class="btn sm danger" @click="delChar(i)">删除</button>
            </span>
          </div>
          <div class="grid cols-2 mt" style="gap:6px 18px;font-size:13px">
            <div><span class="muted">身份：</span>{{ c.identity }}</div>
            <div><span class="muted">性格：</span>{{ c.personality }}</div>
            <div><span class="muted">能力：</span>{{ c.ability }}</div>
            <div><span class="muted">动机：</span>{{ c.motive }}</div>
            <div><span class="muted">弧光：</span>{{ c.arc }}</div>
            <div><span class="muted">标志：</span>{{ c.mark }}</div>
            <div><span class="muted">弱点：</span>{{ c.flaw }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关系 -->
    <div v-show="step === 7">
      <h3>角色关系</h3>
      <button class="btn primary" @click="doRel">生成关系描述</button>
      <div class="between mt" v-if="s.relText">
        <span></span>
        <button class="btn sm ghost" @click="copy(s.relText, '已复制关系')">复制</button>
      </div>
      <pre v-if="s.relText" class="out mt">{{ s.relText }}</pre>
      <p class="muted mt" style="font-size:13px">提示：在「角色」步骤至少添加 2 个角色后再生成。</p>
    </div>

    <!-- 续写 -->
    <div v-show="step === 8">
      <h3>续写正文</h3>
      <label>本章梗概/目标</label>
      <textarea v-model="s.chapSummary" placeholder="例：主角在雨夜被异兽追击，首次觉醒金手指"></textarea>
      <label>前文（可选，用于接续语气）</label>
      <textarea v-model="s.prevText" placeholder="粘贴上一段正文…"></textarea>
      <button class="btn primary mt" @click="doWrite" :disabled="!!busy">{{ busy === '续写' ? '生成中…' : (aiEnabled() ? '🤖 AI 续写' : '生成续写草稿') }}</button>
      <label>续写结果（可编辑）</label>
      <textarea v-model="s.written" style="min-height:160px"></textarea>
      <div class="word-stats mt">
        <span class="muted" style="font-size:13px">本章 {{ writtenWords }} 字 · 累计 {{ totalWords }} 字</span>
        <div class="progress-wrap">
          <div class="progress-bar"><div class="progress-fill" :style="{ width: progressPct + '%' }"></div></div>
          <span class="muted" style="font-size:12px">{{ progressPct }}% / 目标
            <input type="number" v-model.number="goalWords" @change="setGoal" min="10000" max="5000000" style="width:80px;padding:1px 4px;font-size:12px"> 字
          </span>
        </div>
      </div>
      <div class="row mt">
        <button class="btn primary" @click="saveChapter">{{ s.editId ? '保存修改' : '存为新章节' }}</button>
        <button v-if="s.editId" class="btn" @click="newChapter">取消编辑/新建</button>
        <span class="muted" style="font-size:13px">当前已有 {{ book.chapters?.length || 0 }} 章</span>
      </div>

      <h3 class="mt">章节管理</h3>
      <button class="btn sm" @click="newChapter">+ 新建章节</button>
      <div v-if="book.chapters?.length" class="mt">
        <div v-for="(c, i) in book.chapters" :key="c.id" class="row" style="justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--border)">
          <span class="muted" style="width:32px">{{ i + 1 }}.</span>
          <span style="flex:1">{{ c.title }} <span class="muted" style="font-size:12px">· {{ c.content.length }}字</span></span>
          <span class="row">
            <button class="btn sm ghost" @click="moveChapter(i, -1)" :disabled="i === 0">↑</button>
            <button class="btn sm ghost" @click="moveChapter(i, 1)" :disabled="i === book.chapters.length - 1">↓</button>
            <button class="btn sm" @click="editChapter(c)">编辑</button>
            <button class="btn sm danger" @click="delChapter(i)">删</button>
          </span>
        </div>
      </div>
      <div v-else class="muted mt" style="font-size:13px">还没有章节，写一段后点「存为新章节」。</div>
    </div>

    <!-- 去AI -->
    <div v-show="step === 9">
      <h3>去 AI 痕迹·真人化润色</h3>
      <label>待润色文本</label>
      <textarea v-model="s.aiText" style="min-height:140px" placeholder="粘贴一段文字…"></textarea>
      <div class="row mt">
        <button class="btn" @click="doDiag">诊断 AI 痕迹</button>
        <button class="btn primary" @click="doDeAI">一键真人化</button>
      </div>
      <div v-if="s.aiDiag.length" class="mt">
        <div class="muted" style="font-size:13px;margin-bottom:6px">命中 {{ s.aiDiag.length }} 处 AI 高频词：</div>
        <span v-for="d in s.aiDiag.slice(0,30)" :key="d.word+d.index" class="tag warn">{{ d.word }}</span>
      </div>
      <div class="between mt" v-if="s.aiResult">
        <label style="margin:0">润色结果</label>
        <button class="btn sm ghost" @click="copy(s.aiResult, '已复制润色结果')">复制</button>
      </div>
      <textarea v-if="s.aiResult" v-model="s.aiResult" style="min-height:140px"></textarea>
    </div>

    <!-- 投稿 -->
    <div v-show="step === 10">
      <h3>投稿标准评估</h3>
      <button class="btn primary" @click="doEval">评估当前作品</button>
      <table v-if="s.evalRows.length" class="mt" style="width:100%;border-collapse:collapse;font-size:14px">
        <thead><tr><th align="left">项</th><th align="left">标准</th><th>状态</th><th align="left">建议</th></tr></thead>
        <tbody>
        <tr v-for="r in s.evalRows" :key="r.item" style="border-top:1px solid var(--border)">
          <td>{{ r.item }}</td><td class="muted">{{ r.standard }}</td>
          <td style="text-align:center"><span :class="['tag', r.status==='✅'?'ok':r.status==='⚠️'?'warn':'bad']">{{ r.status }}</span></td>
          <td class="muted">{{ r.tip }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- AI 设置弹窗 -->
  <div v-if="showAiSettings" class="modal-mask" @click.self="showAiSettings = false">
    <div class="modal">
      <div class="modal-head">
        <h3>🤖 AI 生成设置</h3>
        <span class="modal-close" @click="showAiSettings = false">✕</span>
      </div>
      <div class="modal-body">
        <p class="modal-tip">开启 AI 模式后，灵感/书名/简介/总纲/卷纲/章纲/角色/关系/续写将调用真实 AI 生成；未开启或未配置时回退到本地模板。Key 仅存本地浏览器，不上传。</p>
        <label class="field-label">
          <input type="checkbox" v-model="ai.enabled" @change="persistAi"> 启用 AI 模式
        </label>
        <label class="field-label">服务商</label>
        <select v-model="ai.provider" @change="onProviderChange">
          <option v-for="p in providers" :key="p.v" :value="p.v">{{ p.label }}</option>
        </select>
        <label class="field-label">API Base URL</label>
        <input v-model="ai.baseURL" @change="persistAi" placeholder="https://open.bigmodel.cn/api/paas/v4">
        <label class="field-label">API Key</label>
        <input v-model="ai.apiKey" type="password" @change="persistAi" placeholder="sk-...">
        <label class="field-label">模型</label>
        <input v-model="ai.model" @change="persistAi" placeholder="glm-4-flash">
        <label class="field-label">温度 ({{ ai.temperature }})</label>
        <input type="range" min="0" max="1.5" step="0.05" v-model.number="ai.temperature" @change="persistAi">
        <label class="field-label">续写风格</label>
        <select v-model="ai.style" @change="persistAi">
          <option value="番茄">番茄风（快节奏/爽点前置）</option>
          <option value="起点">起点风（体系严谨）</option>
          <option value="严肃">严肃文学风</option>
        </select>
        <p class="modal-hint" v-if="ai.enabled && !isConfigured(ai)">⚠️ 已开启 AI 模式但未配置 Key/地址，将回退本地模板。</p>
        <details class="providers-hint">
          <summary>常见服务商参考</summary>
          <ul>
            <li>智谱 GLM: https://open.bigmodel.cn/api/paas/v4 ，模型 glm-4-flash（免费额度）</li>
            <li>通义千问: https://dashscope.aliyuncs.com/compatible-mode/v1 ，模型 qwen-turbo</li>
            <li>DeepSeek: https://api.deepseek.com/v1 ，模型 deepseek-chat</li>
            <li>OpenAI: https://api.openai.com/v1 ，模型 gpt-4o-mini</li>
          </ul>
        </details>
      </div>
      <div class="modal-foot">
        <button class="btn sm ghost" @click="showAiSettings = false">取消</button>
        <button class="btn sm primary" @click="showAiSettings = false">完成</button>
      </div>
    </div>
  </div>
</template>
