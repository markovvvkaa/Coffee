import { MAX_QTY } from '../utils/cart'
import './QtyStepper.css'

interface Props {
  qty: number
  title: string
  onChange: (qty: number) => void
  size?: 'm' | 'l'
}

export default function QtyStepper({ qty, title, onChange, size = 'm' }: Props) {
  return (
    <div className={`qty qty--${size}`} role="group" aria-label={`Количество: ${title}`}>
      <button type="button" className="qty__btn" onClick={() => onChange(qty - 1)} aria-label={`Убрать одну позицию «${title}»`}>−</button>
      <output className="qty__value" aria-live="polite">{qty}</output>
      <button type="button" className="qty__btn" onClick={() => onChange(qty + 1)} disabled={qty >= MAX_QTY} aria-label={`Добавить ещё «${title}»`}>+</button>
    </div>
  )
}
