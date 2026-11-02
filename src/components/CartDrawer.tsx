import type { CartLine } from '../utils/cart'
import { formatAmount, formatPrice, plural } from '../utils/format'
import Modal from './Modal'
import QtyStepper from './QtyStepper'
import './CartDrawer.css'

interface Props {
  open: boolean
  lines: CartLine[]
  count: number
  total: number
  onQty: (id: string, qty: number) => void
  onClose: () => void
  onCheckout: () => void
  onMenu: () => void
}

export default function CartDrawer({ open, lines, count, total, onQty, onClose, onCheckout, onMenu }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="cart-title" className="drawer">
      <div className="drawer__box">
        <h2 className="modal__title" id="cart-title">Корзина</h2>
        {lines.length === 0 ? (
          <div className="drawer__empty">
            <p>В корзине пока пусто. Выберите напиток или десерт в меню.</p>
            <button type="button" className="btn btn--l" onClick={onMenu}>Перейти к меню</button>
          </div>
        ) : (
          <>
            <p className="drawer__count">{count} {plural(count, ['позиция', 'позиции', 'позиций'])}</p>
            <ul className="drawer__list">
              {lines.map(({ item, qty, sum }) => (
                <li key={item.id} className="line">
                  <img src={item.image} alt="" width="72" height="54" />
                  <div className="line__info">
                    <span className="line__title">{item.title}</span>
                    <span className="line__meta">{formatAmount(item)} · {formatPrice(item.price)}</span>
                  </div>
                  <QtyStepper qty={qty} title={item.title} onChange={(q) => onQty(item.id, q)} />
                  <span className="line__sum">{formatPrice(sum)}</span>
                  <button type="button" className="line__remove" onClick={() => onQty(item.id, 0)} aria-label={`Удалить «${item.title}» из корзины`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer__total"><span>Итого</span><strong>{formatPrice(total)}</strong></div>
            <button type="button" className="btn btn--l drawer__checkout" onClick={onCheckout}>Оформить заказ</button>
          </>
        )}
      </div>
    </Modal>
  )
}
