import type { MenuItem } from '../data/menu'
import { formatAmount, formatPrice } from '../utils/format'
import QtyStepper from './QtyStepper'
import './MenuCard.css'

interface Props {
  item: MenuItem
  qty: number
  onOpen: (id: string) => void
  onQty: (id: string, qty: number) => void
}

export default function MenuCard({ item, qty, onOpen, onQty }: Props) {
  const titleId = `card-${item.id}`
  return (
    <article className={`card ${item.available ? '' : 'card--off'}`} aria-labelledby={titleId}>
      <button type="button" className="card__media" onClick={() => onOpen(item.id)} aria-label={`Подробнее: ${item.title}`}>
        <img src={item.image} alt="" loading="lazy" width="800" height="600" />
        {!item.available && <span className="card__flag">Нет в наличии</span>}
      </button>
      <div className="card__body">
        <div className="card__head">
          <h3 className="card__title" id={titleId}>{item.title}</h3>
          <span className="card__amount">{formatAmount(item)}</span>
        </div>
        <p className="card__desc">{item.description}</p>
        <div className="card__foot">
          <span className="card__price">{formatPrice(item.price)}</span>
          {!item.available ? (
            <button type="button" className="btn" disabled>Заказать</button>
          ) : qty > 0 ? (
            <QtyStepper qty={qty} title={item.title} onChange={(q) => onQty(item.id, q)} />
          ) : (
            <button type="button" className="btn card__order" onClick={() => onQty(item.id, 1)} aria-label={`Заказать: ${item.title}`}>Заказать</button>
          )}
        </div>
      </div>
    </article>
  )
}
