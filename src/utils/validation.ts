import type { Category } from '../data/menu'

export type Errors<T> = Partial<Record<keyof T, string>>

export interface OrderForm {
  name: string
  phone: string
  pickup: 'hall' | 'takeaway' | ''
  time: string
  comment: string
}

export const EMPTY_ORDER: OrderForm = { name: '', phone: '', pickup: '', time: 'asap', comment: '' }

const NAME_RE = /^[A-Za-zА-Яа-яЁё]+(?:[ -][A-Za-zА-Яа-яЁё]+)*$/

export function normalizePhone(phone: string): string | null {
  if (/[^\d\s()+-]/.test(phone)) return null
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10) digits = '7' + digits
  if (digits.length === 11 && digits[0] === '8') digits = '7' + digits.slice(1)
  return /^7\d{10}$/.test(digits) ? digits : null
}

export function formatPhone(digits: string): string {
  return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
}

export function validateOrder(form: OrderForm): Errors<OrderForm> {
  const errors: Errors<OrderForm> = {}
  const name = form.name.trim()
  if (!name) errors.name = 'Укажите имя'
  else if (name.length < 2) errors.name = 'Имя слишком короткое'
  else if (!NAME_RE.test(name)) errors.name = 'Имя может содержать только буквы'
  if (!form.phone.trim()) errors.phone = 'Укажите телефон'
  else if (!normalizePhone(form.phone)) errors.phone = 'Номер в формате +7 999 123-45-67'
  if (!form.pickup) errors.pickup = 'Выберите способ получения'
  if (form.time !== 'asap' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)) errors.time = 'Выберите время'
  if (form.comment.length > 200) errors.comment = 'Не более 200 символов'
  return errors
}

export const OPEN_HOUR = 8
export const CLOSE_HOUR = 22

export function timeSlots(now: Date, step = 15): string[] {
  const minutes = now.getHours() * 60 + now.getMinutes() + 15
  const first = Math.max(OPEN_HOUR * 60, Math.ceil(minutes / step) * step)
  const slots: string[] = []
  for (let m = first; m <= CLOSE_HOUR * 60 - step; m += step) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return slots
}

export interface MenuItemForm {
  title: string
  category: Category
  price: string
  amount: string
  description: string
}

export const EMPTY_ITEM: MenuItemForm = { title: '', category: 'coffee', price: '', amount: '', description: '' }

const isInt = (s: string) => /^\d+$/.test(s.trim())

export function validateMenuItem(form: MenuItemForm, existing: readonly string[]): Errors<MenuItemForm> {
  const errors: Errors<MenuItemForm> = {}
  const title = form.title.trim()
  if (!title) errors.title = 'Укажите название'
  else if (title.length < 2 || title.length > 40) errors.title = 'От 2 до 40 символов'
  else if (existing.some((t) => t.toLowerCase() === title.toLowerCase())) errors.title = 'Такая позиция уже есть'
  if (!isInt(form.price)) errors.price = 'Цена – целое число'
  else if (Number(form.price) < 50 || Number(form.price) > 5000) errors.price = 'От 50 до 5000 ₽'
  if (!isInt(form.amount)) errors.amount = 'Укажите целое число'
  else if (Number(form.amount) < 20 || Number(form.amount) > 1000) errors.amount = 'От 20 до 1000'
  const description = form.description.trim()
  if (description.length < 10) errors.description = 'Не менее 10 символов'
  else if (description.length > 120) errors.description = 'Не более 120 символов'
  return errors
}

export function validatePrice(value: string): string | undefined {
  if (!isInt(value)) return 'Целое число'
  const n = Number(value)
  return n < 50 || n > 5000 ? 'От 50 до 5000' : undefined
}

export const hasErrors = (errors: object) => Object.keys(errors).length > 0
