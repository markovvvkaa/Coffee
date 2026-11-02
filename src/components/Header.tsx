import { useEffect, useState } from 'react'
import Logo from './Logo'
import './Header.css'

interface Props {
  cartCount: number
  onCart: () => void
  onOrder: () => void
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="header__icon">
      <path d="M3 4h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.1" />
      <circle cx="10" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" />
    </svg>
  )
}

export default function Header({ cartCount, onCart, onOrder }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const badge = cartCount > 0 && <span className="header__badge" aria-hidden="true">{cartCount}</span>
  const cartLabel = cartCount > 0 ? `Корзина, позиций: ${cartCount}` : 'Корзина, пусто'
  const run = (fn: () => void) => () => { setMenuOpen(false); fn() }

  return (
    <header className="header" id="top">
      <div className="header__inner">
        <a href="#top" className="header__logo" aria-label="Coffee – в начало страницы"><Logo /></a>
        <nav className="header__nav" aria-label="Основное меню">
          <button type="button" className="header__link" onClick={onCart} aria-label={cartLabel}>Корзина{badge}</button>
          <a className="header__link" href="#contacts">Контакты</a>
          <button type="button" className="header__cta" onClick={onOrder}>Онлайн заказ</button>
        </nav>
        <div className="header__mobile">
          <button type="button" className="header__round" onClick={onCart} aria-label={cartLabel}><CartIcon />{badge}</button>
          <button
            type="button" className={`burger ${menuOpen ? 'burger--open' : ''}`}
            aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label="Меню"
            onClick={() => setMenuOpen((v) => !v)}
          ><span /><span /><span /></button>
        </div>
      </div>
      <div className="mobile-menu" id="mobile-menu" hidden={!menuOpen}>
        <button type="button" className="mobile-menu__link" onClick={run(onCart)}>Корзина {cartCount > 0 && `(${cartCount})`}</button>
        <a className="mobile-menu__link" href="#menu" onClick={() => setMenuOpen(false)}>Меню</a>
        <a className="mobile-menu__link" href="#contacts" onClick={() => setMenuOpen(false)}>Контакты</a>
        <button type="button" className="header__cta mobile-menu__cta" onClick={run(onOrder)}>Онлайн заказ</button>
      </div>
    </header>
  )
}
