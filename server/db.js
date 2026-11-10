// «База данных» – обычный JSON-файл server/data/db.json.
// Его можно открыть в любом редакторе; при первом запуске он создаётся из seed.json.
import { copyFile, readFile, rename, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
export const DB_FILE = path.join(DATA_DIR, 'db.json')
export const SEED_FILE = path.join(DATA_DIR, 'seed.json')

/** Создать db.json из seed.json, если файла ещё нет (или сбросить reset = true). */
export async function ensureDb(reset = false) {
  if (!reset) {
    try { await access(DB_FILE); return } catch { /* файла нет – создаём */ }
  }
  await copyFile(SEED_FILE, DB_FILE)
}

export async function readDb() {
  await ensureDb()
  return JSON.parse(await readFile(DB_FILE, 'utf8'))
}

async function writeDb(db) {
  // запись во временный файл и переименование: при сбое db.json не окажется «наполовину записанным»
  const tmp = DB_FILE + '.tmp'
  await writeFile(tmp, JSON.stringify(db, null, 2) + '\n', 'utf8')
  await rename(tmp, DB_FILE)
}

let queue = Promise.resolve()

/**
 * Изменить базу: fn получает объект базы, меняет его и возвращает результат.
 * Изменения выполняются строго по очереди, чтобы два запроса не перезаписали друг друга.
 */
export function updateDb(fn) {
  const run = queue.then(async () => {
    const db = await readDb()
    const result = await fn(db)
    await writeDb(db)
    return result
  })
  queue = run.catch(() => {})
  return run
}
