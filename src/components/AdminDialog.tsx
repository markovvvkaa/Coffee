import { useState, type FormEvent } from 'react'
import { CATEGORIES, CATEGORY_LABEL, UNIT, type MenuItem } from '../data/menu'
import { formatAmount } from '../utils/format'
import {
  EMPTY_ITEM, hasErrors, validateMenuItem, validatePrice, type Errors, type MenuItemForm,
} from '../utils/validation'
import Field from './Field'
import Modal from './Modal'
import './AdminDialog.css'

export interface AdminActions {
  onPrice: (id: string, price: number) => void
  onAvailable: (id: string, available: boolean) => void
  onPopular: (id: string) => void
  onRemove: (id: string) => void
  onAdd: (item: Omit<MenuItem, 'id' | 'image' | 'available'>) => void
  onReset: () => void
}

interface Props extends AdminActions {
  open: boolean
  menu: MenuItem[]
  popularId: string
  onClose: () => void
}

function PriceInput({ item, onPrice }: { item: MenuItem; onPrice: (id: string, price: number) => void }) {
  const [value, setValue] = useState(String(item.price))
  const error = validatePrice(value)
  const commit = () => { if (!error && Number(value) !== item.price) onPrice(item.id, Number(value)) }
  return (
    <div className="admin__price">
      <input
        className={`input input--s ${error ? 'input--error' : ''}`} inputMode="numeric" value={value}
        aria-label={`Цена: ${item.title}`} aria-invalid={Boolean(error)}
        onChange={(e) => setValue(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
      />
      <span aria-hidden="true">₽</span>
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  )
}

function AddItemForm({ menu, onAdd }: { menu: MenuItem[]; onAdd: AdminActions['onAdd'] }) {
  const [form, setForm] = useState<MenuItemForm>(EMPTY_ITEM)
  const [errors, setErrors] = useState<Errors<MenuItemForm>>({})
  const [added, setAdded] = useState('')
  const set = <K extends keyof MenuItemForm>(k: K, v: MenuItemForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validateMenuItem(form, menu.map((i) => i.title))
    setErrors(found)
    if (hasErrors(found)) { setAdded(''); return }
    onAdd({
      title: form.title.trim(), category: form.category, price: Number(form.price), amount: Number(form.amount),
      description: form.description.trim(), composition: '',
    })
    setAdded(form.title.trim())
    setForm(EMPTY_ITEM)
  }
  return (
    <form className="admin__add" onSubmit={submit} noValidate aria-labelledby="add-title">
      <h3 className="admin__sub" id="add-title">Добавить позицию</h3>
      <div className="admin__add-grid">
        <Field id="add-name" label="Название" error={errors.title}>
          {(a) => <input {...a} className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <Field id="add-category" label="Категория">
          {(a) => (
            <select {...a} className="input" value={form.category} onChange={(e) => set('category', e.target.value as MenuItemForm['category'])}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
          )}
        </Field>
        <Field id="add-price" label="Цена, ₽" error={errors.price}>
          {(a) => <input {...a} className="input" inputMode="numeric" value={form.price} onChange={(e) => set('price', e.target.value)} />}
        </Field>
        <Field id="add-amount" label={form.category === 'coffee' ? 'Объём, мл' : 'Вес, г'} error={errors.amount}>
          {(a) => <input {...a} className="input" inputMode="numeric" value={form.amount} onChange={(e) => set('amount', e.target.value)} />}
        </Field>
        <div className="admin__wide">
          <Field id="add-desc" label="Краткое описание" error={errors.description} hint={`${form.description.trim().length}/120`}>
            {(a) => <textarea {...a} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />}
          </Field>
        </div>
      </div>
      <div className="admin__add-foot">
        <button type="submit" className="btn btn--l">Добавить в меню</button>
        <p className="admin__ok" role="status">{added && `Позиция «${added}» добавлена в меню`}</p>
      </div>
    </form>
  )
}

export default function AdminDialog({ open, menu, popularId, onClose, ...actions }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const offCount = menu.filter((i) => !i.available).length
  return (
    <Modal open={open} onClose={onClose} labelledBy="admin-title" className="admin">
      <div className="admin__box">
        <h2 className="modal__title" id="admin-title">Управление меню</h2>
        <p className="admin__lead">
          Позиций в меню: {menu.length}, в стоп-листе: {offCount}. Изменения сохраняются в браузере и сразу видны на странице.
        </p>
        <div className="admin__scroll">
          <table className="admin__table">
            <thead>
              <tr><th scope="col">Позиция</th><th scope="col">Цена</th><th scope="col">В наличии</th><th scope="col">В баннере</th><th scope="col"><span className="visually-hidden">Действия</span></th></tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id} className={item.available ? '' : 'admin__row--off'}>
                  <th scope="row">
                    <span className="admin__item">
                      <img src={item.image} alt="" width="56" height="42" />
                      <span><span className="admin__title">{item.title}</span>
                        <span className="admin__meta">{CATEGORY_LABEL[item.category]}, {formatAmount(item)}{item.custom ? ', новая' : ''}</span></span>
                    </span>
                  </th>
                  <td><PriceInput key={`${item.id}-${item.price}`} item={item} onPrice={actions.onPrice} /></td>
                  <td>
                    <label className="switch">
                      <input type="checkbox" role="switch" checked={item.available} onChange={(e) => actions.onAvailable(item.id, e.target.checked)} />
                      <span className="visually-hidden">{item.title} в наличии</span>
                    </label>
                  </td>
                  <td>
                    <input
                      type="radio" name="popular" className="admin__radio" checked={popularId === item.id} disabled={!item.available}
                      onChange={() => actions.onPopular(item.id)} aria-label={`Показывать «${item.title}» в баннере`}
                    />
                  </td>
                  <td>
                    {item.custom && (
                      <button type="button" className="admin__remove" onClick={() => actions.onRemove(item.id)} aria-label={`Удалить «${item.title}»`}>Удалить</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin__note">Единица порции: напитки – {UNIT.coffee}, десерты – {UNIT.dessert}. Исходные позиции не удаляются, а снимаются с продажи.</p>
        <AddItemForm menu={menu} onAdd={actions.onAdd} />
        <div className="admin__reset">
          <button
            type="button" className="btn btn--ghost-dark"
            onClick={() => { if (confirmReset) { actions.onReset(); setConfirmReset(false) } else setConfirmReset(true) }}
            onBlur={() => setConfirmReset(false)}
          >{confirmReset ? 'Нажмите ещё раз, чтобы сбросить' : 'Вернуть исходное меню'}</button>
        </div>
      </div>
    </Modal>
  )
}
