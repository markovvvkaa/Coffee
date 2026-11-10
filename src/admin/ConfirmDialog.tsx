import { useState } from 'react'
import Modal from '../components/Modal'
import type { MenuItem } from '../data/menu'

interface Props {
  item: MenuItem | null
  onCancel: () => void
  onConfirm: (item: MenuItem) => Promise<void>
}

export default function ConfirmDialog({ item, onCancel, onConfirm }: Props) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal open={Boolean(item)} onClose={onCancel} labelledBy="confirm-title" className="confirm">
      {item && (
        <div className="confirm__box">
          <h2 className="modal__title" id="confirm-title">Удалить «{item.title}»?</h2>
          <p className="confirm__text">Позиция исчезнет из меню на сайте. Это действие нельзя отменить.</p>
          <div className="confirm__actions">
            <button type="button" className="btn btn--ghost-dark" onClick={onCancel}>Отмена</button>
            <button
              type="button" className="btn btn--danger-fill" disabled={busy}
              onClick={async () => { setBusy(true); await onConfirm(item); setBusy(false) }}
            >{busy ? 'Удаление…' : 'Удалить'}</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
