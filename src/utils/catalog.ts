import type { Category, MenuItem } from '../data/menu'

export type CategoryFilter = Category | 'all'
export type SortOrder = 'default' | 'price-asc' | 'price-desc' | 'title'

export const SORT_LABEL: Record<SortOrder, string> = {
  default: 'По умолчанию',
  'price-asc': 'Сначала дешевле',
  'price-desc': 'Сначала дороже',
  title: 'По названию',
}

export interface CatalogQuery {
  category: CategoryFilter
  search: string
}

export function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim()
}

export function filterMenu(items: readonly MenuItem[], query: CatalogQuery): MenuItem[] {
  const needle = normalize(query.search)
  return items.filter((item) =>
    (query.category === 'all' || item.category === query.category) &&
    (!needle || normalize(`${item.title} ${item.description}`).includes(needle)))
}

export function sortMenu(items: readonly MenuItem[], order: SortOrder): MenuItem[] {
  const indexed = items.map((item, index) => ({ item, index }))
  indexed.sort((a, b) => {
    if (a.item.available !== b.item.available) return a.item.available ? -1 : 1
    if (order === 'price-asc') return a.item.price - b.item.price || a.index - b.index
    if (order === 'price-desc') return b.item.price - a.item.price || a.index - b.index
    if (order === 'title') return a.item.title.localeCompare(b.item.title, 'ru')
    return a.index - b.index
  })
  return indexed.map(({ item }) => item)
}

export interface Page<T> {
  items: T[]
  page: number
  pages: number
  from: number
  to: number
  total: number
}

export function paginate<T>(items: readonly T[], page: number, perPage: number): Page<T> {
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages)
  const start = (current - 1) * perPage
  const slice = items.slice(start, start + perPage)
  return { items: slice, page: current, pages, total, from: total ? start + 1 : 0, to: start + slice.length }
}

/** Позиция для баннера: выбранная, если она есть и в наличии, иначе первая доступная. */
export function popularItem(menu: readonly MenuItem[], popularId: string): MenuItem | undefined {
  return menu.find((i) => i.id === popularId && i.available) ?? menu.find((i) => i.available)
}
