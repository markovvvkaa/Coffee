import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { CATEGORIES, CATEGORY_LABEL, STUB_IMAGE, type MenuItem } from '../data/menu'
import { hasErrors, validateMenuItem, type MenuItemForm } from '../utils/validation'
import { api, ApiError } from './api'

type Editing = { mode: 'create' } | { mode: 'edit'; item: MenuItem } | null

interface Props {
  editing: Editing
  /** Названия всех позиций – для проверки уникальности. */
  titles: string[]
  onClose: () => void
  onSaved: (item: MenuItem, created: boolean) => void
  onExpired: () => void
}

interface Form extends MenuItemForm {
  composition: string
  available: boolean
}
type FormErrors = Partial<Record<keyof Form | 'image', string>>

const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 3 * 1024 * 1024

function initial(editing: Editing): Form {
  if (editing?.mode === 'edit') {
    const i = editing.item
    return { title: i.title, category: i.category, price: String(i.price), amount: String(i.amount), description: i.description, composition: i.composition, available: i.available }
  }
  return { title: '', category: 'coffee', price: '', amount: '', description: '', composition: '', available: true }
}

function ItemForm({ editing, titles, onClose, onSaved, onExpired }: Props & { editing: NonNullable<Editing> }) {
  const [form, setForm] = useState<Form>(() => initial(editing))
  const [errors, setErrors] = useState<FormErrors>({})
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const isEdit = editing.mode === 'edit'

  // временный адрес выбранного файла для предпросмотра; освобождается при смене файла
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const pickFile = (f: File | undefined) => {
    if (!f) return
    if (!TYPES.includes(f.type)) { setErrors((e) => ({ ...e, image: 'Нужен файл JPG, PNG или WebP' })); return }
    if (f.size > MAX_SIZE) { setErrors((e) => ({ ...e, image: 'Файл больше 3 МБ' })); return }
    setErrors((e) => ({ ...e, image: undefined }))
    setFile(f)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const others = titles.filter((t) => !(isEdit && t === editing.item.title))
    const found: FormErrors = validateMenuItem(form, others)
    if (form.composition.trim().length > 300) found.composition = 'Не более 300 символов'
    if (errors.image) found.image = errors.image
    setErrors(found)
    if (hasErrors(Object.fromEntries(Object.entries(found).filter(([, v]) => v)))) return

    const body = new FormData()
    body.set('title', form.title.trim())
    body.set('category', form.category)
    body.set('price', form.price.trim())
    body.set('amount', form.amount.trim())
    body.set('description', form.description.trim())
    body.set('composition', form.composition.trim())
    body.set('available', String(form.available))
    if (file) body.set('image', file)

    setBusy(true)
    setMessage('')
    try {
      const saved = isEdit ? await api.update(editing.item.id, body) : await api.create(body)
      onSaved(saved, !isEdit)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) { onExpired(); return }
      if (err instanceof ApiError && Object.keys(err.errors).length) setErrors(err.errors as FormErrors)
      setMessage(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setBusy(false)
    }
  }

  const image = preview || (isEdit ? editing.item.image : STUB_IMAGE[form.category])

  return (
    <form className="item-form" onSubmit={submit} noValidate>
      <h2 className="modal__title" id="item-title">{isEdit ? `Изменить «${editing.item.title}»` : 'Новая позиция'}</h2>
      {message && <p className="login__error" role="alert">{message}</p>}
      <div className="item-form__grid">
        <div className="item-form__photo">
          <img src={image} alt="" width="800" height="600" />
          <label className="btn btn--ghost-dark item-form__file">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => pickFile(e.target.files?.[0])} aria-describedby="photo-hint" />
            {file || isEdit ? 'Заменить фото' : 'Выбрать фото'}
          </label>
          {errors.image
            ? <span className="field__error" id="photo-hint">{errors.image}</span>
            : <span className="field__hint" id="photo-hint">JPG, PNG или WebP до 3 МБ{!isEdit && !file ? '. Без фото – картинка по категории' : ''}</span>}
        </div>
        <div className="item-form__fields">
          <Field id="item-name" label="Название" error={errors.title}>
            {(a) => <input {...a} className="input" value={form.title} maxLength={40} onChange={(e) => set('title', e.target.value)} />}
          </Field>
          <div className="item-form__row">
            <Field id="item-category" label="Категория">
              {(a) => (
                <select {...a} className="input" value={form.category} onChange={(e) => set('category', e.target.value as Form['category'])}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
              )}
            </Field>
            <Field id="item-price" label="Цена, ₽" error={errors.price}>
              {(a) => <input {...a} className="input" inputMode="numeric" value={form.price} onChange={(e) => set('price', e.target.value)} />}
            </Field>
            <Field id="item-amount" label={form.category === 'coffee' ? 'Объём, мл' : 'Вес, г'} error={errors.amount}>
              {(a) => <input {...a} className="input" inputMode="numeric" value={form.amount} onChange={(e) => set('amount', e.target.value)} />}
            </Field>
          </div>
          <Field id="item-desc" label="Краткое описание" error={errors.description} hint={`${form.description.trim().length}/120`}>
            {(a) => <textarea {...a} className="input" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />}
          </Field>
          <Field id="item-comp" label="Состав (необязательно)" error={errors.composition}>
            {(a) => <textarea {...a} className="input" rows={2} value={form.composition} onChange={(e) => set('composition', e.target.value)} />}
          </Field>
          <label className="switch acard__switch">
            <input type="checkbox" role="switch" checked={form.available} onChange={(e) => set('available', e.target.checked)} />
            <span>В наличии</span>
          </label>
        </div>
      </div>
      <div className="item-form__actions">
        <button type="button" className="btn btn--ghost-dark" onClick={onClose}>Отмена</button>
        <button type="submit" className="btn btn--l" disabled={busy}>{busy ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить в меню'}</button>
      </div>
    </form>
  )
}

export default function ItemDialog(props: Props) {
  return (
    <Modal open={Boolean(props.editing)} onClose={props.onClose} labelledBy="item-title" className="item-dialog">
      {props.editing && <ItemForm {...props} editing={props.editing} />}
    </Modal>
  )
}
