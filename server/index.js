// Сервер кофейни «Coffee»: API меню, вход в админ-панель, загрузка фото.
// Данные хранятся в JSON-файле server/data/db.json (см. db.js).
import './env.js'
import express from 'express'
import multer from 'multer'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { adminLogin, login, logout, requireAuth } from './auth.js'
import { DB_FILE, ensureDb, readDb, updateDb } from './db.js'
import { validateItem } from './validate.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS = path.join(ROOT, 'uploads')
const DIST = path.join(ROOT, '..', 'dist')
const PORT = Number(process.env.PORT) || 3001

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

// ---------- загрузка фото ----------
const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}.${TYPES[file.mimetype]}`),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => (TYPES[file.mimetype] ? cb(null, true) : cb(new BadRequest({ image: 'Нужен файл JPG, PNG или WebP' }))),
})

class BadRequest extends Error {
  constructor(errors) { super('Проверьте поля формы'); this.errors = errors }
}

/** Удалить загруженное фото (фото исходного меню в public/menu не трогаются). */
async function removeUpload(image) {
  if (image?.startsWith('uploads/')) await unlink(path.join(UPLOADS, path.basename(image))).catch(() => {})
}

const newId = () => 'item-' + Date.now().toString(36) + randomBytes(2).toString('hex')

// ---------- публичное API ----------
app.get('/api/menu', async (_req, res) => {
  const db = await readDb()
  res.json({ popularId: db.popularId, items: db.items })
})

app.post('/api/login', login)

// ---------- API админ-панели (нужен вход) ----------
app.post('/api/logout', requireAuth, logout)
app.get('/api/me', requireAuth, (_req, res) => res.json({ login: adminLogin }))

// добавить позицию (multipart/form-data: поля формы и необязательное фото image)
app.post('/api/menu', requireAuth, upload.single('image'), async (req, res) => {
  const image = req.file ? `uploads/${req.file.filename}` : null
  try {
    const item = await updateDb((db) => {
      const { errors, value } = validateItem(req.body, db.items.map((i) => i.title))
      if (Object.keys(errors).length) throw new BadRequest(errors)
      const created = {
        id: newId(), ...value,
        image: image ?? (value.category === 'coffee' ? 'menu/drink.jpg' : 'menu/dessert.jpg'),
        updatedAt: new Date().toISOString(),
      }
      db.items.push(created)
      return created
    })
    res.status(201).json(item)
  } catch (e) {
    await removeUpload(image)
    throw e
  }
})

// изменить позицию: PUT – форма целиком (с фото), PATCH – отдельные поля в JSON (например, наличие)
async function update(req, res) {
  const image = req.file ? `uploads/${req.file.filename}` : null
  let oldImage = null
  try {
    const item = await updateDb((db) => {
      const cur = db.items.find((i) => i.id === req.params.id)
      if (!cur) throw new NotFound()
      const { errors, value } = validateItem({ ...cur, ...req.body }, db.items.filter((i) => i !== cur).map((i) => i.title))
      if (Object.keys(errors).length) throw new BadRequest(errors)
      if (image) oldImage = cur.image
      Object.assign(cur, value, image ? { image } : {}, { updatedAt: new Date().toISOString() })
      return cur
    })
    await removeUpload(oldImage)
    res.json(item)
  } catch (e) {
    await removeUpload(image)
    throw e
  }
}
class NotFound extends Error {}
app.put('/api/menu/:id', requireAuth, upload.single('image'), update)
app.patch('/api/menu/:id', requireAuth, update)

app.delete('/api/menu/:id', requireAuth, async (req, res) => {
  const removed = await updateDb((db) => {
    const idx = db.items.findIndex((i) => i.id === req.params.id)
    if (idx < 0) throw new NotFound()
    const [item] = db.items.splice(idx, 1)
    if (db.popularId === item.id) db.popularId = db.items.find((i) => i.available)?.id ?? ''
    return item
  })
  await removeUpload(removed.image)
  res.json({ ok: true })
})

// позиция для баннера «Сейчас популярно»
app.put('/api/popular', requireAuth, async (req, res) => {
  const popularId = await updateDb((db) => {
    const item = db.items.find((i) => i.id === req.body?.id)
    if (!item) throw new NotFound()
    if (!item.available) throw new BadRequest({ popular: 'Позиция не в наличии' })
    db.popularId = item.id
    return item.id
  })
  res.json({ popularId })
})

// ---------- файлы ----------
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }))
app.use('/api', (_req, res) => res.status(404).json({ error: 'Нет такого адреса API' }))
// собранный сайт (npm run build): главная страница и админ-панель admin.html
if (existsSync(DIST)) app.use(express.static(DIST))

// ---------- ошибки ----------
app.use((err, _req, res, _next) => { // eslint-disable-line no-unused-vars
  if (err instanceof BadRequest) return res.status(400).json({ error: err.message, errors: err.errors })
  if (err instanceof NotFound) return res.status(404).json({ error: 'Позиция не найдена' })
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Файл больше 3 МБ' : 'Не удалось загрузить файл'
    return res.status(400).json({ error: msg, errors: { image: msg } })
  }
  console.error(err)
  res.status(500).json({ error: 'Ошибка сервера' })
})

await ensureDb()
app.listen(PORT, () => {
  console.log(`Сервер: http://localhost:${PORT}`)
  console.log(`API меню: http://localhost:${PORT}/api/menu`)
  console.log(`База данных: ${DB_FILE}`)
  if (existsSync(DIST)) console.log(`Сайт: http://localhost:${PORT}/  Админ-панель: http://localhost:${PORT}/admin.html`)
})
