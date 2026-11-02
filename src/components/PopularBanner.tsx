import type { MenuItem } from '../data/menu'
import { formatAmount, formatPrice } from '../utils/format'
import QtyStepper from './QtyStepper'
import './PopularBanner.css'

interface Props {
  item: MenuItem
  qty: number
  onQty: (id: string, qty: number) => void
  onOpen: (id: string) => void
}

export default function PopularBanner({ item, qty, onQty, onOpen }: Props) {
  return (
    <section className="popular" aria-labelledby="popular-title">
      <div className="popular__inner">
        <div className="popular__text">
          <p className="popular__label">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5-4.9-4.6 6.6-.8z" /></svg>
            Сейчас популярно
          </p>
          <h2 className="popular__title" id="popular-title">{item.title}</h2>
          <p className="popular__desc">{item.description}</p>
          <div className="popular__meta">
            <span className="popular__price">{formatPrice(item.price)}</span>
            <span className="popular__amount">{formatAmount(item)}</span>
          </div>
          <div className="popular__actions">
            {qty > 0
              ? <QtyStepper qty={qty} title={item.title} onChange={(q) => onQty(item.id, q)} size="l" />
              : <button type="button" className="btn btn--l" onClick={() => onQty(item.id, 1)} aria-label={`Заказать: ${item.title}`}>Заказать</button>}
            <button type="button" className="btn btn--ghost btn--l" onClick={() => onOpen(item.id)}>Подробнее</button>
          </div>
        </div>
        <div className="popular__media">
          <img src={item.image} alt={item.title} width="800" height="600" />
        </div>
      </div>
    </section>
  )
}
