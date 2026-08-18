// 小说内容 AI 生成服务
// 支持 OpenAI 兼容接口（OpenAI / 智谱 GLM / 通义 / DeepSeek / 自定义）
// 当用户开启 AI 模式并配置 Key 后，各生成函数走真实 AI；否则回退到本地模板

import {
  genInspiration, genTitles, genSynopsis, genOutline,
  genVolumeOutline, genChapterOutline, genCharacter, genRelationships, continueWriting,
} from './generators.js'

export const providers = [
  { v: 'openai', label: 'OpenAI', baseURL: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { v: 'glm', label: '智谱 GLM', baseURL: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { v: 'dashscope', label: '通义千问', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo' },
  { v: 'deepseek', label: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { v: 'custom', label: '自定义', baseURL: '', model: '' },
]

const SETTINGS_KEY = 'novel:ai-settings:v1'

export function defaultSettings() {
  return {
    enabled: false,
    provider: 'glm',
    baseURL: '',
    apiKey: '',
    model: '',
    temperature: 0.85,
    style: '番茄', // 番茄/起点/严肃文学
  }
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings()
    return { ...defaultSettings(), ...JSON.parse(raw) }
  } catch (e) { return defaultSettings() }
}

export function saveSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch (e) {}
}

export function isConfigured(s) {
  return !!(s.apiKey && (s.baseURL || providers.find(p => p.v === s.provider)?.baseURL))
}

function resolve(s) {
  const p = providers.find(x => x.v === s.provider) || providers[0]
  return {
    baseURL: (s.baseURL || p.baseURL).replace(/\/$/, ''),
    apiKey: s.apiKey,
    model: s.model || p.model,
    temperature: s.temperature ?? 0.85,
  }
}

async function callChat(s, messages, { json = false } = {}) {
  const { baseURL, apiKey, model, temperature } = resolve(s)
  if (!baseURL) throw new Error('未配置 API 地址')
  if (!apiKey) throw new Error('未配置 API Key')
  const body = { model, messages, temperature }
  if (json) body.response_format = { type: 'json_object' }
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

function extractJson(content) {
  if (!content) return null
  try {
    const obj = JSON.parse(content)
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) return obj
      for (const k of ['data', 'list', 'items', 'result', 'titles', 'volumes', 'chapters', 'characters']) {
        if (Array.isArray(obj[k])) return obj[k]
      }
      return obj
    }
  } catch (e) {}
  const m = content.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = m ? m[1] : content
  const s = raw.indexOf('['), e = raw.lastIndexOf(']')
  if (s >= 0 && e > s) { try { return JSON.parse(raw.slice(s, e + 1)) } catch (x) {} }
  const s2 = raw.indexOf('{'), e2 = raw.lastIndexOf('}')
  if (s2 >= 0 && e2 > s2) { try { return JSON.parse(raw.slice(s2, e2 + 1)) } catch (x) {} }
  return null
}

const platformHint = (p) => p === '起点' ? '起点风：体系严谨、世界观扎实、爽点密集' : (p === '番茄' ? '番茄风：节奏快、钩子强、爽点前置、口语化' : '通用网文风')

// 1. 灵感卡
export async function genInspirationAI(s, idea, genre, platform) {
  const prompt = `你是网文策划。根据输入生成一张灵感卡，输出 JSON：
{
  "core": "核心创意一句话",
  "genre": "${genre || '都市'}",
  "platform": "${platform || '番茄'}",
  "finger": "金手指名称（4-8字）",
  "cost": "使用代价",
  "skeleton": ["起：开篇钩子", "承：升级试炼", "转：真相/挫折", "合：决战收束"],
  "selling": ["卖点1", "卖点2", "卖点3"],
  "risk": ["风险1", "风险2"],
  "directions": ["A 方向", "B 方向", "C 方向"]
}
题材：${genre || '都市'}；平台：${platform || '番茄'}（${platformHint(platform)}）；灵感：${idea || '一个普通人获得特殊能力'}。只输出 JSON。`
  const content = await callChat(s, [{ role: 'user', content: prompt }], { json: true })
  const obj = extractJson(content)
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj
  throw new Error('AI 返回无法解析')
}

// 2. 书名
export async function genTitlesAI(s, idea, genre, platform) {
  const prompt = `你是网文取名专家。生成 6 个${platform || '番茄'}平台${genre || '都市'}题材的书名备选。
要求：4-12字，含卖点词/钩子，符合平台调性（${platformHint(platform)}）。
灵感：${idea || '（自由发挥）'}。
只输出一个 JSON 对象：{"titles":["书名1","书名2",...]}，不要书名号。`
  const content = await callChat(s, [{ role: 'user', content: prompt }], { json: true })
  const obj = extractJson(content)
  const arr = obj?.titles || (Array.isArray(obj) ? obj : null)
  if (Array.isArray(arr) && arr.length) return arr.map(t => String(t).replace(/[《》]/g, ''))
  throw new Error('AI 返回无法解析')
}

// 3. 简介
export async function genSynopsisAI(s, title, genre, platform, idea) {
  const prompt = `你是网文简介写手。为《${title || '未命名'}》写一段${platform || '番茄'}平台简介。
${platformHint(platform)}。${platform === '起点' ? '200-400字，含背景/金手指/主线/卖点/钩子。' : '50-150字，钩子开头+处境+金手指+爽点承诺+留白收尾。'}
题材：${genre || '都市'}；灵感：${idea || '一个被低估的普通人'}。
只输出简介正文，不要解释。`
  return await callChat(s, [{ role: 'user', content: prompt }])
}

// 4. 总纲
export async function genOutlineAI(s, genre, selling) {
  const prompt = `你是网文大纲编辑。生成一份总纲，包含：题材、核心卖点、主线、结构（每10章一爽点，卷末留钩子）、主题。
题材：${genre || '都市'}；核心卖点：${selling || '差异化金手指+反差打脸+情感代入'}。
只输出总纲文本，分点清晰，200-400字。`
  return await callChat(s, [{ role: 'user', content: prompt }])
}

// 5. 卷纲
export async function genVolumesAI(s, genre, volCount) {
  const n = Math.max(1, Math.min(5, volCount || 3))
  const prompt = `你是网文大纲编辑。生成 ${n} 卷的卷纲，输出 JSON 数组：
[{"index":1,"name":"卷名","goal":"本卷目标","stages":["阶段1","阶段2","阶段3","阶段4","阶段5"],"hook":"卷末钩子"}]
题材：${genre || '都市'}。每卷有目标、5个阶段、卷末钩子。只输出 JSON。`
  const content = await callChat(s, [{ role: 'user', content: prompt }], { json: true })
  const arr = extractJson(content)
  if (Array.isArray(arr)) return arr
  throw new Error('AI 返回无法解析')
}

// 6. 章纲
export async function genChaptersAI(s, volume) {
  const prompt = `你是网文章纲编辑。生成 10 章的章纲，输出 JSON 数组：
[{"index":1,"title":"章节标题","summary":"本章梗概","hook":"章末钩子"}]
${volume ? `当前卷：${JSON.stringify(volume)}。` : ''}要求节奏：每3章一个小高潮/打脸，其余铺垫，章末必留钩子。只输出 JSON。`
  const content = await callChat(s, [{ role: 'user', content: prompt }], { json: true })
  const arr = extractJson(content)
  if (Array.isArray(arr)) return arr
  throw new Error('AI 返回无法解析')
}

// 7. 角色卡
export async function genCharacterAI(s, name, role, genre) {
  const prompt = `你是网文角色设计师。生成一张角色卡，输出 JSON：
{"name":"${name || '主角'}","role":"${role || '主角'}","identity":"身份","personality":"性格","ability":"能力(含代价)","motive":"外在动机；内在动机","arc":"起点→终点的弧光","mark":"标志动作/口头禅","flaw":"弱点"}
题材：${genre || '都市'}。只输出 JSON。`
  const content = await callChat(s, [{ role: 'user', content: prompt }], { json: true })
  const obj = extractJson(content)
  if (obj && typeof obj === 'object' && obj.name) return obj
  throw new Error('AI 返回无法解析')
}

// 8. 关系
export async function genRelationshipsAI(s, chars) {
  const prompt = `你是网文角色关系编辑。根据以下角色生成他们之间的关系网络，每行一条：
角色：${JSON.stringify(chars.map(c => ({ name: c.name, role: c.role })))}
格式：A --关系类型--> B（可加一句说明）。输出 6-10 条，只输出文本。`
  return await callChat(s, [{ role: 'user', content: prompt }])
}

// 9. 续写正文
export async function continueWritingAI(s, prevText, chapterSummary) {
  const prompt = `你是网文续写助手。根据本章梗概和前文，续写 400-800 字正文。
要求：${platformHint(s.style)}；口语化、画面感、节奏明快；接续前文语气；章末留钩子。
${prevText ? `前文末尾：...${prevText.slice(-200)}` : '（无前文，开篇）'}
本章梗概：${chapterSummary || '推进本章目标'}
只输出正文，不要标题和解释。`
  return await callChat(s, [{ role: 'user', content: prompt }])
}

// 统一入口：根据是否启用 AI 选择实现
export async function smartGenerate(s, kind, ...args) {
  if (s.enabled && isConfigured(s)) {
    const map = {
      inspiration: genInspirationAI,
      titles: genTitlesAI,
      synopsis: genSynopsisAI,
      outline: genOutlineAI,
      volumes: genVolumesAI,
      chapters: genChaptersAI,
      character: genCharacterAI,
      relationships: genRelationshipsAI,
      writing: continueWritingAI,
    }
    const fn = map[kind]
    if (fn) return await fn(s, ...args)
  }
  // 回退本地模板
  const local = {
    inspiration: () => genInspiration(...args),
    titles: () => genTitles(...args),
    synopsis: () => genSynopsis(...args),
    outline: () => genOutline(...args),
    volumes: () => genVolumeOutline(...args),
    chapters: () => genChapterOutline(...args),
    character: () => genCharacter(...args),
    relationships: () => genRelationships(...args),
    writing: () => continueWriting(...args),
  }
  return local[kind](...args)
}
