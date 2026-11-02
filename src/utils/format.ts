import { UNIT, type MenuItem } from '../data/menu'

export function formatPrice(value: number): string {
  return `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}\u00a0₽`
}

export function formatAmount(item: Pick<MenuItem, 'amount' | 'category'>): string {
  return `${item.amount}\u00a0${UNIT[item.category]}`
}

export function plural(n: number, forms: [string, string, string]): string {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return forms[0]
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1]
  return forms[2]
}
