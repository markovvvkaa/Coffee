import { CATEGORY_LABEL, CATEGORIES, type MenuItem } from '../data/menu'
import { SORT_LABEL, type CategoryFilter, type Page, type SortOrder } from '../utils/catalog'
import type { Cart } from '../utils/cart'
import MenuCard from './MenuCard'
import Pagination from './Pagination'
import './MenuSection.css'

interface Props {
  page: Page<MenuItem>
  category: CategoryFilter
  search: string
  sort: SortOrder
  cart: Cart
  onCategory: (c: CategoryFilter) => void
  onSearch: (s: string) => void
  onSort: (s: SortOrder) => void
  onPage: (n: number) => void
  onOpen: (id: string) => void
  onQty: (id: string, qty: number) => void
}

const FILTERS: [CategoryFilter, string][] = [['all', 'Всё меню'], ...CATEGORIES.map((c): [CategoryFilter, string] => [c, CATEGORY_LABEL[c]])]

export default function MenuSection(p: Props) {
  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="menu__inner">
        <div className="menu__head">
          <h2 className="menu__title" id="menu-title">Меню</h2>
          <p className="menu__found" aria-live="polite">
            {p.page.total ? `Показано ${p.page.from}–${p.page.to} из ${p.page.total}` : 'Ничего не найдено'}
          </p>
        </div>
        <div className="menu__toolbar">
          <div className="chips" role="group" aria-label="Категория">
            {FILTERS.map(([id, label]) => (
              <button key={id} type="button" className="chip" aria-pressed={p.category === id} onClick={() => p.onCategory(id)}>{label}</button>
            ))}
          </div>
          <div className="menu__controls">
            <label className="field-search">
              <span className="visually-hidden">Поиск по меню</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
              <input type="search" value={p.search} placeholder="Поиск по меню" onChange={(e) => p.onSearch(e.target.value)} />
            </label>
            <label className="field-sort">
              <span className="visually-hidden">Сортировка</span>
              <select value={p.sort} onChange={(e) => p.onSort(e.target.value as SortOrder)}>
                {(Object.keys(SORT_LABEL) as SortOrder[]).map((s) => <option key={s} value={s}>{SORT_LABEL[s]}</option>)}
              </select>
            </label>
          </div>
        </div>
        {p.page.total ? (
          <ul className="menu__grid">
            {p.page.items.map((item) => (
              <li key={item.id}><MenuCard item={item} qty={p.cart[item.id] ?? 0} onOpen={p.onOpen} onQty={p.onQty} /></li>
            ))}
          </ul>
        ) : (
          <div className="menu__empty">
            <p>По запросу «{p.search.trim()}» ничего не нашлось.</p>
            <button type="button" className="btn" onClick={() => { p.onSearch(''); p.onCategory('all') }}>Показать всё меню</button>
          </div>
        )}
        <Pagination page={p.page.page} pages={p.page.pages} onPage={p.onPage} />
      </div>
    </section>
  )
}
