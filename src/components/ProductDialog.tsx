import { CATEGORY_LABEL, type MenuItem } from '../data/menu'
import { formatAmount, formatPrice } from '../utils/format'
import Modal from './Modal'
import QtyStepper from './QtyStepper'
import './ProductDialog.css'

interface Props {
  item: MenuItem | undefined
  qty: number
  onQty: (id: string, qty: number) => void
  onCart: () => void
  onClose: () => void
}

export default function ProductDialog({ item, qty, onQty, onCart, onClose }: Props) {
  return (
    <Modal open={Boolean(item)} onClose={onClose} labelledBy="product-title" className="product">
      {item && (
        <div className="product__grid">
          <img className="product__img" src={item.image} alt={item.title} width="800" height="600" />
          <div className="product__info">
            <p className="product__cat">{CATEGORY_LABEL[item.category]} · {formatAmount(item)}</p>
            <h2 className="modal__title" id="product-title">{item.title}</h2>
            <p className="product__desc">{item.description}</p>
            {item.composition && (
              <>
                <h3 className="product__sub">Состав</h3>
                <p className="product__comp">{item.composition}</p>
              </>
            )}
            <p className="product__price">{formatPrice(item.price)}</p>
            {!item.available ? (
              <p className="product__off">Сейчас нет в наличии</p>
            ) : qty > 0 ? (
              <div className="product__actions">
                <QtyStepper qty={qty} title={item.title} onChange={(q) => onQty(item.id, q)} size="l" />
                <button type="button" className="btn btn--l btn--ghost-dark" onClick={onCart}>В корзину</button>
              </div>
            ) : (
              <button type="button" className="btn btn--l" onClick={() => onQty(item.id, 1)}>Добавить в заказ</button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
