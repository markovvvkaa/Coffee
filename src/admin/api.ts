import type { MenuItem } from '../data/menu'
import { parseMenuData, type MenuData } from '../utils/menuApi'

const TOKEN_KEY = 'coffee:admin-token'

export const getToken = () => { try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null } }
export const setToken = (t: string | null) => {
  try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY) } catch { /* хранилище недоступно */ }
}

export class ApiError extends Error {
  status: number
  errors: Record<string, string>
  constructor(message: string, status: number, errors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

/** Запрос к API сервера; при ответе 401 токен сбрасывается. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json')
  let res: Response
  try {
    res = await fetch(`api/${path}`, { ...init, headers })
  } catch {
    throw new ApiError('Сервер недоступен. Запустите его командой npm run dev.', 0)
  }
  const data = await res.json().catch(() => null)
  if (!data) throw new ApiError('Сервер недоступен. Запустите его командой npm run dev.', res.status)
  if (res.status === 401) setToken(null)
  if (!res.ok) throw new ApiError(data.error ?? 'Ошибка запроса', res.status, data.errors)
  return data as T
}

export const api = {
  login: (login: string, password: string) =>
    request<{ token: string; login: string }>('login', { method: 'POST', body: JSON.stringify({ login, password }) }),
  logout: () => request('logout', { method: 'POST' }),
  me: () => request<{ login: string }>('me'),
  menu: async (): Promise<MenuData> => parseMenuData(await request<unknown>('menu')) ?? { popularId: '', items: [] },
  create: (form: FormData) => request<MenuItem>('menu', { method: 'POST', body: form }),
  update: (id: string, form: FormData) => request<MenuItem>(`menu/${encodeURIComponent(id)}`, { method: 'PUT', body: form }),
  patch: (id: string, body: Partial<Pick<MenuItem, 'available' | 'price'>>) =>
    request<MenuItem>(`menu/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request(`menu/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  setPopular: (id: string) => request<{ popularId: string }>('popular', { method: 'PUT', body: JSON.stringify({ id }) }),
}
