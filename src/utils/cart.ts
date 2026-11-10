import type { MenuItem } from '../data/menu'

export type Cart = Readonly<Record<string, number>>

export const MAX_QTY = 20

export interface CartLine {
  item: MenuItem
  qty: number
  sum: number
}

export function setQty(cart: Cart, id: string, qty: number): Cart {
  const value = Math.min(MAX_QTY, Math.max(0, Math.floor(qty) || 0))
  const next = { ...cart }
  if (value === 0) delete next[id]
  else next[id] = value
  return next
}

export function addToCart(cart: Cart, id: string, qty = 1): Cart {
  return setQty(cart, id, (cart[id] ?? 0) + qty)
}

export function cartLines(cart: Cart, menu: readonly MenuItem[]): CartLine[] {
  return menu
    .filter((item) => item.available && cart[item.id] > 0)
    .map((item) => ({ item, qty: cart[item.id], sum: item.price * cart[item.id] }))
}

export function cartCount(lines: readonly CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0)
}

export function cartTotal(lines: readonly CartLine[]): number {
  return lines.reduce((n, l) => n + l.sum, 0)
}

export function pruneCart(cart: Cart, menu: readonly MenuItem[]): Cart {
  return Object.fromEntries(cartLines(cart, menu).map((l) => [l.item.id, l.qty]))
}

/** Разбор сохранённой корзины: только положительные целые количества. */
export function parseCart(raw: string | null): Record<string, number> {
  if (!raw) return {}
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return {}
    return Object.fromEntries(Object.entries(data).filter(([, q]) => typeof q === 'number' && Number.isInteger(q) && q > 0 && q <= MAX_QTY)) as Record<string, number>
  } catch {
    return {}
  }
}
