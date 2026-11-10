import { useEffect, useState } from 'react'
import { BASE_MENU, DEFAULT_POPULAR_ID } from '../data/menu'
import { fetchMenu, type MenuData } from '../utils/menuApi'

export type MenuSource = 'loading' | 'server' | 'local'

/**
 * Меню с сервера (база server/data/db.json). Если сервер недоступен –
 * например, сайт опубликован как статический на Vercel, – используется встроенное меню.
 */
export function useMenu(): MenuData & { source: MenuSource } {
  const [state, setState] = useState<MenuData & { source: MenuSource }>({ popularId: DEFAULT_POPULAR_ID, items: [], source: 'loading' })
  useEffect(() => {
    let alive = true
    fetchMenu()
      .then((data) => { if (alive) setState({ ...data, source: 'server' }) })
      .catch(() => { if (alive) setState({ popularId: DEFAULT_POPULAR_ID, items: [...BASE_MENU], source: 'local' }) })
    return () => { alive = false }
  }, [])
  return state
}
