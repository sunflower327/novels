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
