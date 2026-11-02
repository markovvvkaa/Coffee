import { useMemo, useState, type FormEvent } from 'react'
import type { CartLine } from '../utils/cart'
import { formatPrice } from '../utils/format'
import {
  EMPTY_ORDER, hasErrors, timeSlots, validateOrder, type Errors, type OrderForm,
} from '../utils/validation'
import Field from './Field'
import Modal from './Modal'
import './OrderDialog.css'

interface Props {
  open: boolean
  lines: CartLine[]
  total: number
  onSubmit: (form: OrderForm) => string
  onClose: () => void
  onMenu: () => void
}

function OrderContent({ lines, total, onSubmit, onClose, onMenu }: Omit<Props, 'open'>) {
  const [form, setForm] = useState<OrderForm>(EMPTY_ORDER)
  const [errors, setErrors] = useState<Errors<OrderForm>>({})
  const [done, setDone] = useState<string | null>(null)
  const slots = useMemo(() => timeSlots(new Date()), [])

  const set = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validateOrder(form)
    setErrors(found)
    if (hasErrors(found)) {
      const first = (['name', 'phone', 'pickup', 'time', 'comment'] as const).find((k) => found[k])
      document.getElementById(first === 'pickup' ? 'order-pickup-hall' : `order-${first}`)?.focus()
      return
    }
    setDone(onSubmit(form))
  }

  if (done) {
    return (
      <div className="order__done" role="status">
        <h2 className="modal__title" id="order-title">Спасибо, заказ принят!</h2>
        <p>Номер заказа <strong className="order__number">№ {done}</strong>. Мы начнём готовить к выбранному времени, оплата – при получении.</p>
        <button type="button" className="btn btn--l" onClick={onClose}>Хорошо</button>
      </div>
    )
  }
  if (lines.length === 0) {
    return (
      <div className="order__done">
        <h2 className="modal__title" id="order-title">Онлайн заказ</h2>
        <p>Корзина пуста – добавьте напитки и десерты из меню, а затем оформите заказ.</p>
        <button type="button" className="btn btn--l" onClick={onMenu}>Перейти к меню</button>
      </div>
    )
  }
  return (
    <form className="order" onSubmit={submit} noValidate>
      <div className="order__form">
        <h2 className="modal__title" id="order-title">Онлайн заказ</h2>
        <Field id="order-name" label="Имя" error={errors.name}>
          {(a) => <input {...a} className="input" name="name" autoComplete="given-name" value={form.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field id="order-phone" label="Телефон" error={errors.phone} hint="Например, +7 999 123-45-67">
          {(a) => <input {...a} className="input" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />}
        </Field>
        <fieldset className="choice" aria-describedby={errors.pickup ? 'order-pickup-error' : undefined}>
          <legend className="choice-legend">Способ получения</legend>
          <label><input id="order-pickup-hall" type="radio" name="pickup" checked={form.pickup === 'hall'} onChange={() => set('pickup', 'hall')} />В зале</label>
          <label><input type="radio" name="pickup" checked={form.pickup === 'takeaway'} onChange={() => set('pickup', 'takeaway')} />С собой</label>
          {errors.pickup && <span className="field__error order__pickup-error" id="order-pickup-error">{errors.pickup}</span>}
        </fieldset>
        <Field id="order-time" label="Время получения" error={errors.time}>
          {(a) => (
            <select {...a} className="input" name="time" value={form.time} onChange={(e) => set('time', e.target.value)}>
              <option value="asap">Как можно скорее</option>
              {slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <Field id="order-comment" label="Комментарий" error={errors.comment} hint={`${form.comment.length}/200`}>
          {(a) => <textarea {...a} className="input" name="comment" value={form.comment} onChange={(e) => set('comment', e.target.value)} placeholder="Например, без сахара" />}
        </Field>
      </div>
      <aside className="order__summary" aria-label="Состав заказа">
        <h3 className="order__sub">Ваш заказ</h3>
        <ul>
          {lines.map((l) => <li key={l.item.id}><span>{l.item.title} × {l.qty}</span><span>{formatPrice(l.sum)}</span></li>)}
        </ul>
        <p className="order__total"><span>Итого</span><strong>{formatPrice(total)}</strong></p>
        <button type="submit" className="btn btn--l order__submit">Подтвердить заказ</button>
      </aside>
    </form>
  )
}

export default function OrderDialog(props: Props) {
  return (
    <Modal open={props.open} onClose={props.onClose} labelledBy="order-title">
      {props.open && <OrderContent {...props} />}
    </Modal>
  )
}
