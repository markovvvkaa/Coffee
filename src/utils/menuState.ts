import { CATEGORIES, DEFAULT_POPULAR_ID, STUB_IMAGE, type Category, type MenuItem } from '../data/menu'

export interface MenuState {
  overrides: Record<string, { price?: number; available?: boolean }>
  added: Omit<MenuItem, 'image'>[]
  popularId: string
}

export const EMPTY_STATE: MenuState = { overrides: {}, added: [], popularId: DEFAULT_POPULAR_ID }

export function applyMenuState(base: readonly MenuItem[], state: MenuState): MenuItem[] {
  const own = base.map((item) => ({ ...item, ...state.overrides[item.id] }))
  const added = state.added.map((item) => ({ ...item, image: STUB_IMAGE[item.category], custom: true }))
  return [...own, ...added]
}

export function updateItem(state: MenuState, id: string, patch: { price?: number; available?: boolean }): MenuState {
  const added = state.added.find((i) => i.id === id)
  if (added) return { ...state, added: state.added.map((i) => (i.id === id ? { ...i, ...patch } : i)) }
  return { ...state, overrides: { ...state.overrides, [id]: { ...state.overrides[id], ...patch } } }
}

export function nextCustomId(state: MenuState): string {
  const max = state.added.reduce((m, i) => Math.max(m, Number(i.id.replace('custom-', '')) || 0), 0)
  return `custom-${max + 1}`
}

export function addItem(state: MenuState, item: Omit<MenuItem, 'id' | 'image' | 'available'>): MenuState {
  return { ...state, added: [...state.added, { ...item, id: nextCustomId(state), available: true, custom: true }] }
}

export function removeItem(state: MenuState, id: string): MenuState {
  const added = state.added.filter((i) => i.id !== id)
  return { ...state, added, popularId: state.popularId === id ? DEFAULT_POPULAR_ID : state.popularId }
}

export function setPopular(state: MenuState, id: string): MenuState {
  return { ...state, popularId: id }
}

export function popularItem(menu: readonly MenuItem[], popularId: string): MenuItem | undefined {
  return menu.find((i) => i.id === popularId && i.available) ?? menu.find((i) => i.available)
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isPrice = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= 100000

export function parseMenuState(raw: string | null): MenuState {
  if (!raw) return EMPTY_STATE
  let data: unknown
  try { data = JSON.parse(raw) } catch { return EMPTY_STATE }
  if (!isRecord(data)) return EMPTY_STATE
  const overrides: MenuState['overrides'] = {}
  if (isRecord(data.overrides)) {
    for (const [id, o] of Object.entries(data.overrides)) {
      if (!isRecord(o)) continue
      const entry: { price?: number; available?: boolean } = {}
      if (isPrice(o.price)) entry.price = o.price
      if (typeof o.available === 'boolean') entry.available = o.available
      overrides[id] = entry
    }
  }
  const added = Array.isArray(data.added)
    ? data.added.filter((i): i is MenuState['added'][number] =>
      isRecord(i) && typeof i.id === 'string' && i.id.startsWith('custom-') && typeof i.title === 'string' &&
      CATEGORIES.includes(i.category as Category) && isPrice(i.price) && isPrice(i.amount) &&
      typeof i.description === 'string' && typeof i.composition === 'string' && typeof i.available === 'boolean')
    : []
  const popularId = typeof data.popularId === 'string' ? data.popularId : DEFAULT_POPULAR_ID
  return { overrides, added, popularId }
}

export function parseCart(raw: string | null): Record<string, number> {
  if (!raw) return {}
  try {
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data)) return {}
    return Object.fromEntries(Object.entries(data).filter(([, q]) => typeof q === 'number' && Number.isInteger(q) && q > 0 && q <= 20)) as Record<string, number>
  } catch {
    return {}
  }
}
