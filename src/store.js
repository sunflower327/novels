// localStorage 存储层
const KEY = 'novel-site:books'

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadBooks() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveBooks(books) {
  localStorage.setItem(KEY, JSON.stringify(books))
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
