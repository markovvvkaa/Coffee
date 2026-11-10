import { CATEGORIES, STUB_IMAGE, type Category, type MenuItem } from '../data/menu'

export interface MenuData {
  popularId: string
  items: MenuItem[]
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Проверка ответа GET /api/menu: позиции с неверными полями отбрасываются. */
export function parseMenuData(data: unknown): MenuData | null {
  if (!isRecord(data) || !Array.isArray(data.items)) return null
  const items = data.items.filter((i): i is MenuItem =>
    isRecord(i) && typeof i.id === 'string' && typeof i.title === 'string' &&
    CATEGORIES.includes(i.category as Category) && typeof i.price === 'number' && typeof i.amount === 'number' &&
    typeof i.description === 'string' && typeof i.available === 'boolean')
    .map((i) => ({ ...i, composition: typeof i.composition === 'string' ? i.composition : '', image: typeof i.image === 'string' && i.image ? i.image : STUB_IMAGE[i.category] }))
  return { popularId: typeof data.popularId === 'string' ? data.popularId : '', items }
}

/** Загрузить меню с сервера (адрес относительный – работает и в подкаталоге). */
export async function fetchMenu(timeoutMs = 5000): Promise<MenuData> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch('api/menu', { signal: ctrl.signal, headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = parseMenuData(await res.json())
    if (!data) throw new Error('Неверный ответ сервера')
    return data
  } finally {
    clearTimeout(timer)
  }
}
