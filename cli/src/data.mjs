// 数据加载：从 web 导出的作品 JSON 读取上下文（角色/总纲/前章）
import { existsSync, readFileSync } from 'node:fs'

// 读取单个作品 JSON 文件，或从导出包里按 id 取
export function loadBook(filePath, bookId) {
  if (!existsSync(filePath)) throw new Error(`文件不存在: ${filePath}`)
  const raw = readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)
  // 单本书对象
  if (data && data.id && data.title !== undefined) return data
  // 导出包 { books: [...] } 或数组
  const arr = Array.isArray(data) ? data : data.books
  if (Array.isArray(arr)) {
    if (bookId) {
      const b = arr.find((x) => x.id === bookId)
      if (b) return b
      throw new Error(`未找到 id=${bookId} 的作品`)
    }
    return arr[0]
  }
  throw new Error('无法识别的 JSON 结构')
}

// 构造续写上下文
export function buildCtx(book) {
  const outline = book.outline && typeof book.outline === 'object' ? (book.outline.main || '') : (book.outline || '')
  const chars = Array.isArray(book.characters) ? book.characters : []
  const chapters = Array.isArray(book.chapters) ? book.chapters : []
  return {
    outline,
    chars,
    prevChapters: chapters.slice(-3),
    prevText: chapters.length ? (chapters[chapters.length - 1].content || '') : '',
  }
}

export function listBooks(filePath) {
  if (!existsSync(filePath)) throw new Error(`文件不存在: ${filePath}`)
  const raw = readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)
  const arr = Array.isArray(data) ? data : (data.books || (data.id ? [data] : []))
  return arr.map((b) => ({
    id: b.id,
    title: b.title,
    genre: b.genre,
    chapters: (b.chapters || []).length,
    words: (b.chapters || []).reduce((s, c) => s + (c.content ? c.content.length : 0), 0),
  updatedAt: b.updatedAt,
  pinned: b.pinned,
  status: b.status,
  }))
}
