<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { notify } from '../toast.js'
import { loadSettings, useAiSettings, persistAiSettings, isConfigured, smartGenerate } from '../lib/ai.js'
import { upsertBook, newBook, uid } from '../store.js'

const router = useRouter()
const ai = useAiSettings()
const input = ref('')
const report = ref(null)
const busy = ref(false)
const aiMode = ref(ai.enabled && isConfigured(ai))

async function doTeardown() {
  if (!input.value.trim()) { notify('请粘贴小说正文'); return }
  busy.value = true
  notify(aiMode.value ? 'AI 拆书中…' : '本地拆书中…')
  try {
    const r = await smartGenerate({ ...ai, enabled: aiMode.value }, 'teardown', input.value)
    report.value = r
    notify('拆书完成')
  } catch (e) {
    notify('拆书失败：' + (e.message || e))
  } finally {
    busy.value = false
  }
}

function loadSample() {
  input.value = `第一章 雨夜

雨还没停。林深推开门，浑身湿透。他低头看了一眼手里攥紧的平安扣，那是母亲留给他的最后一样东西。

"你回来了。"屋里传来一个声音。他抬头，看见一个从未见过的老人坐在沙发上，笑眯眯地看着他。

"我是你外公。"老人说，"你母亲临走前，让我在你十八岁这天来找你。"老人从怀里掏出一个旧怀表："它能让你听见别人心里对你的真实评价。但每次使用，都会头痛欲裂。"

林深接过怀表，指尖发凉。门外传来脚步声。三下，停一停，又三下。老人脸色一变："他们找来了。"

第二章 觉醒

林深还没反应过来，老人已经把他推进了卧室的暗门。"无论听到什么，都别出声。"然后关上了暗门。

暗门后是一条窄窄的通道。他能听见外面传来打斗声，然后是一声闷响，再之后是死一般的寂静。他攥紧怀表，心跳得很快。

通道尽头透出一点光。他推开门，站在一条陌生的巷子里。一个路人经过，心里想："这小伙子看着挺普通，怎么浑身是水。"

林深愣住了——他听见了。怀表在发烫。头痛随之而来，像有人用锤子敲他的太阳穴。他咬着牙没出声。

第三章 第一个真相

林深在巷子尽头找到一家便利店。店员抬头看了他一眼，心里想："又是个淋雨的穷小子，别弄脏地板。"

他发现，只要不主动去听，那些声音就模模糊糊；一旦盯着一个人看，那个人的心声就会清晰起来。他想起外公的话：母亲临走前。临走去哪了？为什么那些人要找他？

他掏出怀表，背面刻着一行小字：真话有代价。雨还在下。`
  notify('已载入示例正文')
}

function onUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    input.value = String(reader.result || '').slice(0, 20000)
    notify(`已载入 ${file.name}（${input.value.length} 字）`)
  }
  reader.onerror = () => notify('读取失败')
  reader.readAsText(file, 'utf-8')
  e.target.value = ''
}

function clearAll() {
  if (!confirm('清空正文和报告？')) return
  input.value = ''
  report.value = null
}

function copyReport() {
  if (!report.value) return
  navigator.clipboard?.writeText(JSON.stringify(report.value, null, 2)).then(() => notify('已复制报告'))
}

// 拆书报告 → 新建作品（作为创作模板）
function reportToBook() {
  if (!report.value) { notify('请先拆书'); return }
  const r = report.value
  const b = newBook()
  b.title = `拆书模板·${r.genre || '未分类'}`
  b.genre = r.genre || ''
  b.synopsis = r.summary || ''
  b.inspiration = `【拆书来源】${r.summary || ''}\n金手指：${r.finger || '无'}\n卖点：${(r.selling || []).join('；')}\n可借鉴：${(r.takeaways || []).join('；')}`
  b.outline = {
    main: r.opening ? `【开篇结构】${r.opening}\n【节奏】${r.pace || ''}\n【套路】${(r.tropes||[]).join('；')}` : '',
    volumes: [],
    chapters: [],
  }
  b.characters = []
  if (r.protagonist && (r.protagonist.identity || r.protagonist.personality)) {
    b.characters.push({
      id: uid(),
      name: '主角',
      role: '主角',
      identity: r.protagonist.identity || '',
      personality: r.protagonist.personality || '',
      ability: r.finger || '',
      motive: r.protagonist.motive || '',
      arc: '',
      mark: r.protagonist.mark || '',
      flaw: (r.flaws || []).join('；'),
    })
  }
  b.relationships = ''
  upsertBook(b)
  notify('已创建新作品，跳转创作页')
  router.push(`/writer/${b.id}`)
}
</script>

<template>
  <div class="between mb">
    <h2>拆书分析</h2>
    <div class="row">
      <label class="ai-toggle">
        <input type="checkbox" v-model="aiMode"> AI 模式
      </label>
      <label class="btn sm" style="cursor:pointer">📂 上传 txt<input type="file" accept=".txt,text/plain" @change="onUpload" style="display:none" /></label>
      <button class="btn sm" @click="loadSample">载入示例</button>
      <button class="btn sm ghost" @click="clearAll">清空</button>
    </div>
  </div>

  <div class="card">
    <p class="muted" style="font-size:13px;margin:0 0 10px">
      粘贴一段小说正文（建议 500 字以上，开篇黄金三章效果最佳），AI 模式输出深度拆解报告，未开启时本地做关键词与节奏粗分析。
    </p>
    <label>小说正文</label>
    <textarea v-model="input" style="min-height:200px" placeholder="粘贴小说正文…"></textarea>
    <div class="row mt">
      <button class="btn primary" @click="doTeardown" :disabled="busy">{{ busy ? '拆书中…' : '🔍 开始拆书' }}</button>
      <span class="muted" style="font-size:13px">{{ input.length }} 字</span>
    </div>
  </div>

  <div v-if="report" class="card mt">
    <div class="between">
      <h3 style="margin:0">拆书报告</h3>
      <div class="row">
        <button class="btn sm primary" @click="reportToBook">转为新作品 →</button>
        <button class="btn sm ghost" @click="copyReport">复制 JSON</button>
      </div>
    </div>

    <div class="grid cols-2 mt" style="gap:10px 18px">
      <div><span class="muted">题材：</span><strong>{{ report.genre }}</strong></div>
      <div><span class="muted">细分：</span>{{ report.subgenre || '—' }}</div>
      <div><span class="muted">金手指：</span>{{ report.finger }}</div>
      <div><span class="muted">总评：</span>{{ report.summary }}</div>
    </div>

    <h4 class="mt">卖点</h4>
    <ul v-if="report.selling?.length">
      <li v-for="(s, i) in report.selling" :key="i">{{ s }}</li>
    </ul>
    <p v-else class="muted" style="font-size:13px">—</p>

    <h4 class="mt">主角人设</h4>
    <div v-if="report.protagonist" class="grid cols-2" style="gap:6px 18px;font-size:14px">
      <div><span class="muted">身份：</span>{{ report.protagonist.identity || '—' }}</div>
      <div><span class="muted">性格：</span>{{ report.protagonist.personality || '—' }}</div>
      <div><span class="muted">动机：</span>{{ report.protagonist.motive || '—' }}</div>
      <div><span class="muted">标志：</span>{{ report.protagonist.mark || '—' }}</div>
    </div>

    <h4 class="mt">开篇结构</h4>
    <p style="font-size:14px;line-height:1.7">{{ report.opening || '—' }}</p>

    <h4 class="mt">节奏分析</h4>
    <p style="font-size:14px;line-height:1.7">{{ report.pace || '—' }}</p>

    <h4 class="mt">章末钩子</h4>
    <ul v-if="report.hooks?.length">
      <li v-for="(h, i) in report.hooks" :key="i" class="muted" style="font-size:13px">「{{ h }}」</li>
    </ul>
    <p v-else class="muted" style="font-size:13px">—</p>

    <h4 class="mt">套路归类</h4>
    <div v-if="report.tropes?.length">
      <span v-for="(t, i) in report.tropes" :key="i" class="tag" style="margin:0 6px 6px 0">{{ t }}</span>
    </div>
    <p v-else class="muted" style="font-size:13px">—</p>

    <h4 class="mt">可借鉴点</h4>
    <ul v-if="report.takeaways?.length">
      <li v-for="(t, i) in report.takeaways" :key="i">{{ t }}</li>
    </ul>
    <p v-else class="muted" style="font-size:13px">—</p>

    <h4 class="mt">硬伤 / 风险</h4>
    <ul v-if="report.flaws?.length">
      <li v-for="(f, i) in report.flaws" :key="i" style="color:var(--bad,#e55)">{{ f }}</li>
    </ul>
    <p v-else class="muted" style="font-size:13px">无明显硬伤</p>
  </div>
</template>

<style scoped>
.ai-toggle { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
.ai-toggle input { width: auto; }
</style>
