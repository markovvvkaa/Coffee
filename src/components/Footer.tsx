import Logo from './Logo'
import './Footer.css'

export type InfoTopic = 'about' | 'contacts' | 'help'

interface Props {
  onInfo: (topic: InfoTopic) => void
}

export default function Footer({ onInfo }: Props) {
  return (
    <footer className="footer" id="contacts">
      <div className="footer__inner">
        <Logo className="footer__logo" />
        <nav className="footer__nav" aria-label="Информация">
          <button type="button" className="footer__link" onClick={() => onInfo('about')}>О компании</button>
          <button type="button" className="footer__link" onClick={() => onInfo('contacts')}>Контакты</button>
          <button type="button" className="footer__link" onClick={() => onInfo('help')}>Помощь</button>
          <a className="footer__link" href="tel:+79999999999">+7 999 999 99 99</a>
        </nav>
      </div>
      <div className="footer__bottom">
        <span>© 2026 Coffee. Кофейня в Новокузнецке</span>
        <a className="footer__manage" href="admin.html">Управление меню</a>
      </div>
    </footer>
  )
}
