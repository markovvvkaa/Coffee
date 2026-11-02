import type { CartLine } from './cart'
import { normalizePhone, type OrderForm } from './validation'

export interface SavedOrder {
  number: string
  createdAt: string
  name: string
  phone: string
  pickup: 'hall' | 'takeaway'
  time: string
  comment: string
  items: { id: string; title: string; qty: number; price: number }[]
  total: number
}

export function orderNumber(count: number): string {
  return String(count + 1).padStart(4, '0')
}

export function buildOrder(form: OrderForm, lines: readonly CartLine[], count: number, now: Date): SavedOrder {
  return {
    number: orderNumber(count),
    createdAt: now.toISOString(),
    name: form.name.trim(),
    phone: normalizePhone(form.phone) ?? form.phone,
    pickup: form.pickup === 'hall' ? 'hall' : 'takeaway',
    time: form.time,
    comment: form.comment.trim(),
    items: lines.map((l) => ({ id: l.item.id, title: l.item.title, qty: l.qty, price: l.item.price })),
    total: lines.reduce((n, l) => n + l.sum, 0),
  }
}

export function parseOrders(raw: string | null): SavedOrder[] {
  try {
    const data: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? (data as SavedOrder[]) : []
  } catch {
    return []
  }
}
