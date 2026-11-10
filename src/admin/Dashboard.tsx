import { useCallback, useEffect, useMemo, useState } from 'react'
import Logo from '../components/Logo'
import { CATEGORY_LABEL, CATEGORIES, type MenuItem } from '../data/menu'
import { filterMenu, type CategoryFilter } from '../utils/catalog'
import { formatAmount, formatPrice } from '../utils/format'
import { api, ApiError } from './api'
import ConfirmDialog from './ConfirmDialog'
import ItemDialog from './ItemDialog'

interface Props {
  login: string
  onLogout: () => void
  onExpired: () => void
}

type Editing = { mode: 'create' } | { mode: 'edit'; item: MenuItem } | null

export default function Dashboard({ login, onLogout, onExpired }: Props) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [popularId, setPopularId] = useState('')
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Editing>(null)
  const [deleting, setDeleting] = useState<MenuItem | null>(null)
  const [toast, setToast] = useState('')

  /** Обработка ошибок запросов: истёкшая сессия возвращает на форму входа. */
  const fail = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) onExpired()
    else setToast(err instanceof Error ? err.message : 'Ошибка')
  }, [onExpired])

  // загрузка меню с сервера; reload() запрашивает его заново
  useEffect(() => {
    let alive = true
    api.menu()
      .then((data) => { if (alive) { setItems(data.items); setPopularId(data.popularId); setLoadError('') } })
      .catch((err: unknown) => { if (alive) setLoadError(err instanceof Error ? err.message : 'Не удалось загрузить меню') })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [reloadKey])
  const reload = () => setReloadKey((k) => k + 1)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const shown = useMemo(() => filterMenu(items, { category, search }), [items, category, search])
  const offCount = items.filter((i) => !i.available).length

  const toggleAvailable = async (item: MenuItem) => {
    try {
      const saved = await api.patch(item.id, { available: !item.available })
      setItems((list) => list.map((i) => (i.id === saved.id ? saved : i)))
      setToast(saved.available ? `«${saved.title}» снова в наличии` : `«${saved.title}» добавлено в стоп-лист`)
    } catch (err) { fail(err) }
  }

  const makePopular = async (item: MenuItem) => {
    try {
      const res = await api.setPopular(item.id)
      setPopularId(res.popularId)
      setToast(`«${item.title}» теперь в баннере «Сейчас популярно»`)
    } catch (err) { fail(err) }
  }

  const remove = async (item: MenuItem) => {
    try {
      await api.remove(item.id)
      setDeleting(null)
      setToast(`«${item.title}» удалено`)
      reload()
    } catch (err) { setDeleting(null); fail(err) }
  }

  const onSaved = (saved: MenuItem, created: boolean) => {
    setItems((list) => (created ? [...list, saved] : list.map((i) => (i.id === saved.id ? saved : i))))
    setEditing(null)
    setToast(created ? `«${saved.title}» добавлено в меню` : `Изменения в «${saved.title}» сохранены`)
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header__inner">
          <a href="./" className="admin-header__logo" aria-label="Coffee – на сайт"><Logo /></a>
          <span className="admin-header__tag">Админ-панель</span>
          <div className="admin-header__right">
            <span className="admin-header__user">Вы вошли как <b>{login}</b></span>
            <a className="btn btn--ghost-dark" href="./">На сайт</a>
            <button type="button" className="btn" onClick={onLogout}>Выйти</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-main__head">
          <div>
            <h1 className="admin-main__title">Управление меню</h1>
            <p className="admin-main__stats">
              Позиций: {items.length} · в наличии: {items.length - offCount} · в стоп-листе: {offCount}
            </p>
          </div>
          <button type="button" className="btn btn--l" onClick={() => setEditing({ mode: 'create' })}>+ Добавить позицию</button>
        </div>

        <div className="menu__toolbar">
          <div className="chips" role="group" aria-label="Категория">
            {([['all', 'Всё меню'], ...CATEGORIES.map((c) => [c, CATEGORY_LABEL[c]])] as [CategoryFilter, string][]).map(([id, label]) => (
              <button key={id} type="button" className="chip" aria-pressed={category === id} onClick={() => setCategory(id)}>{label}</button>
            ))}
          </div>
          <label className="field-search">
            <span className="visually-hidden">Поиск по позициям</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
            <input type="search" value={search} placeholder="Поиск по позициям" onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        {loading ? (
          <p className="admin-empty">Загрузка меню…</p>
        ) : loadError ? (
          <div className="admin-empty" role="alert">
            <p>{loadError}</p>
            <button type="button" className="btn" onClick={() => { setLoading(true); reload() }}>Повторить</button>
          </div>
        ) : shown.length === 0 ? (
          <p className="admin-empty">Позиции не найдены.</p>
        ) : (
          <ul className="acards">
            {shown.map((item) => {
              const isPopular = item.id === popularId
              return (
                <li key={item.id}>
                  <article className={`acard ${item.available ? '' : 'acard--off'}`} aria-labelledby={`acard-${item.id}`}>
                    <div className="acard__media">
                      <img src={item.image} alt="" loading="lazy" width="800" height="600" />
                      <div className="acard__badges">
                        {isPopular && <span className="acard__badge acard__badge--star">★ В баннере</span>}
                        {!item.available && <span className="acard__badge">Нет в наличии</span>}
                      </div>
                    </div>
                    <div className="acard__body">
                      <div className="card__head">
                        <h2 className="card__title" id={`acard-${item.id}`}>{item.title}</h2>
                        <span className="card__amount">{formatAmount(item)}</span>
                      </div>
                      <p className="acard__meta">{CATEGORY_LABEL[item.category]} · <b>{formatPrice(item.price)}</b></p>
                      <p className="card__desc">{item.description}</p>
                      <div className="acard__controls">
                        <label className="switch acard__switch">
                          <input type="checkbox" role="switch" checked={item.available} onChange={() => toggleAvailable(item)} />
                          <span>В наличии</span>
                        </label>
                        <button
                          type="button" className="acard__star" onClick={() => makePopular(item)}
                          disabled={isPopular || !item.available} aria-pressed={isPopular}
                          title={item.available ? 'Показывать в баннере «Сейчас популярно»' : 'Позиция не в наличии'}
                        >★ В баннер</button>
                      </div>
                      <div className="acard__actions">
                        <button type="button" className="btn btn--ghost-dark" onClick={() => setEditing({ mode: 'edit', item })} aria-label={`Изменить «${item.title}»`}>Изменить</button>
                        <button type="button" className="btn btn--danger" onClick={() => setDeleting(item)} aria-label={`Удалить «${item.title}»`}>Удалить</button>
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <ItemDialog
        editing={editing} titles={items.map((i) => i.title)}
        onClose={() => setEditing(null)} onSaved={onSaved} onExpired={onExpired}
      />
      <ConfirmDialog
        item={deleting} onCancel={() => setDeleting(null)} onConfirm={(item) => remove(item)}
      />
      <p className={`admin-toast ${toast ? 'admin-toast--show' : ''}`} role="status" aria-live="polite">{toast}</p>
    </div>
  )
}
