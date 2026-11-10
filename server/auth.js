// Вход в админ-панель: логин и пароль берутся из переменных окружения (файл .env),
// по умолчанию admin / coffee2026. После входа выдаётся токен, который админ-панель
// передаёт в заголовке Authorization: Bearer <токен>.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const LOGIN = process.env.ADMIN_LOGIN || 'admin'
const PASSWORD = process.env.ADMIN_PASSWORD || 'coffee2026'
const SESSION_MS = 8 * 60 * 60 * 1000 // сессия живёт 8 часов
const sessions = new Map() // токен -> время окончания

const hash = (s) => createHash('sha256').update(String(s)).digest()
const same = (a, b) => timingSafeEqual(hash(a), hash(b)) // сравнение без утечки по времени

// не более 10 неудачных попыток входа за 15 минут с одного адреса
const failures = new Map()
const LIMIT = 10, WINDOW_MS = 15 * 60 * 1000

export function login(req, res) {
  const ip = req.ip
  const f = failures.get(ip)
  if (f && f.count >= LIMIT && Date.now() - f.since < WINDOW_MS) {
    return res.status(429).json({ error: 'Слишком много попыток. Попробуйте через 15 минут.' })
  }
  const { login: user = '', password = '' } = req.body ?? {}
  if (!same(user, LOGIN) || !same(password, PASSWORD)) {
    const cur = f && Date.now() - f.since < WINDOW_MS ? f : { count: 0, since: Date.now() }
    failures.set(ip, { ...cur, count: cur.count + 1 })
    return res.status(401).json({ error: 'Неверный логин или пароль' })
  }
  failures.delete(ip)
  const token = randomBytes(24).toString('hex')
  sessions.set(token, Date.now() + SESSION_MS)
  res.json({ token, login: LOGIN })
}

function tokenOf(req) {
  const h = req.get('authorization') || ''
  return h.startsWith('Bearer ') ? h.slice(7) : ''
}

export function logout(req, res) {
  sessions.delete(tokenOf(req))
  res.json({ ok: true })
}

/** Пропускает запрос только с действующим токеном. */
export function requireAuth(req, res, next) {
  const token = tokenOf(req)
  const until = sessions.get(token)
  if (!until || until < Date.now()) {
    sessions.delete(token)
    return res.status(401).json({ error: 'Требуется вход в админ-панель' })
  }
  next()
}

export const adminLogin = LOGIN
