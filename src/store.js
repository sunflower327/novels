// 存储层：IndexedDB 持久化 + 内存缓存，保留同步 API
// 首次运行自动从旧 localStorage 迁移，容量从 5MB 提升到数百 MB+
const LEGACY_KEY = 'novel-site:books'
const DB_NAME = 'novel-site-db'
const STORE = 'kv'
const ALL_KEY = 'books'

let _db = null
let _cache = null
let _ready = false

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE) }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
function idbGet(key) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
function idbSet(key, val) {
  return new Promise((resolve, reject) => {
    const tx = _db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(val, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// 启动初始化：加载 IDB → 无则从 localStorage 迁移
export const storeReady = (async () => {
  try {
    _db = await openDB()
    _cache = await idbGet(ALL_KEY)
    if (!Array.isArray(_cache)) {
      // 从旧 localStorage 迁移
      let old = []
      try { old = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]') } catch {}
      _cache = Array.isArray(old) ? old : []
      if (_cache.length) await idbSet(ALL_KEY, _cache)
      localStorage.removeItem(LEGACY_KEY)
    }
  } catch (e) {
    // IDB 不可用（隐私模式/Node 等），回退内存 + localStorage
    _cache = (typeof localStorage !== 'undefined') ? JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]') : []
    if (!Array.isArray(_cache)) _cache = []
  } finally {
    _ready = true
  }
})()

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// 同步读：返回深拷贝，避免外部修改污染缓存
export function loadBooks() {
  if (!_ready) return []
  return JSON.parse(JSON.stringify(_cache || []))
}
// 同步写：更新缓存 + 异步落盘 IDB（失败回退 localStorage）
export function saveBooks(books) {
  _cache = books
  idbSet(ALL_KEY, books).catch(() => {
    if (typeof localStorage === 'undefined') return
    try { localStorage.setItem(LEGACY_KEY, JSON.stringify(books)) } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
        throw new Error('存储空间已满，请导出备份后删除部分作品或章节')
      }
      throw e
    }
  })
}

export function getBook(id) {
  return loadBooks().find((b) => b.id === id) || null
}

export function upsertBook(book) {
  const books = loadBooks()
  const idx = books.findIndex((b) => b.id === book.id)
  book.updatedAt = Date.now()
  if (idx >= 0) books[idx] = book
  else {
    book.createdAt = Date.now()
    books.push(book)
  }
  saveBooks(books)
  return book
}

export function deleteBook(id) {
  saveBooks(loadBooks().filter((b) => b.id !== id))
}

// 计算单本书总字数（所有章节内容字数之和）
export function bookWordCount(book) {
  if (!book || !Array.isArray(book.chapters)) return 0
  return book.chapters.reduce((sum, c) => sum + (c.content ? c.content.length : 0), 0)
}

// 切换置顶
export function togglePin(id) {
  const books = loadBooks()
  const b = books.find((x) => x.id === id)
  if (b) { b.pinned = !b.pinned; b.updatedAt = Date.now(); saveBooks(books) }
  return b?.pinned
}

// 导出单本书为纯文本
export function exportBookTxt(book) {
  const lines = []
  lines.push(`《${book.title || '未命名'}》`)
  lines.push(`题材：${book.genre || ''}　平台：${book.platform || ''}　状态：${book.status || ''}`)
  if (book.synopsis) lines.push('', '【简介】', book.synopsis)
  if (Array.isArray(book.chapters) && book.chapters.length) {
    lines.push('', '【正文】')
    for (const c of book.chapters) {
      lines.push('', `${c.title || ''}`, '', c.content || '')
    }
  }
  return lines.join('\n')
}

// 导出单本书为 JSON 字符串
export function exportBookJson(book) {
  return JSON.stringify(book, null, 2)
}
// 从 JSON 字符串导入单本书（合并：同 id 覆盖，无 id 新建）
export function importBookJson(text) {
  let b
  try { b = JSON.parse(text) } catch { throw new Error('JSON 格式错误') }
  if (!b || typeof b !== 'object') throw new Error('不是有效作品对象')
  if (!b.id) b.id = uid()
  const books = loadBooks()
  const idx = books.findIndex((x) => x.id === b.id)
  if (idx >= 0) books[idx] = b; else books.push(b)
  saveBooks(books)
  return b
}

export function newBook() {
  return {
    id: uid(),
    title: '',
    synopsis: '',
    genre: '',
    platform: '番茄',
    status: '构思中',
    inspiration: '',
    characters: [],
    relationships: '',
    outline: { main: '', volumes: [], chapters: [] },
    chapters: [],
    evaluation: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// 主题
const THEME_KEY = 'novel-site:theme'
export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark'
}
export function setTheme(t) {
  localStorage.setItem(THEME_KEY, t)
  document.documentElement.setAttribute('data-theme', t)
}

// 通用下载：把文本/JSON 作为文件下载
export function downloadBlob(content, filename, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 存储用量估算（IndexedDB + 总配额）
export async function storageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    return { usage, quota }
  }
  return { usage: 0, quota: 0 }
}

// 导出全部数据为 JSON 字符串
export function exportAll() {
  return JSON.stringify(loadBooks(), null, 2)
}

// 从 JSON 字符串导入（合并：按 id 去重，新的覆盖旧的）
export function importAll(jsonText) {
  let incoming
  try { incoming = JSON.parse(jsonText) } catch { throw new Error('JSON 格式错误') }
  if (!Array.isArray(incoming)) throw new Error('JSON 不是作品数组')
  const current = loadBooks()
  const map = new Map(current.map((b) => [b.id, b]))
  for (const b of incoming) {
    if (!b.id) b.id = uid()
    map.set(b.id, b)
  }
  saveBooks([...map.values()])
  return incoming.length
}
