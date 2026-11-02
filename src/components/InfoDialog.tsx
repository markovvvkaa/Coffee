import Modal from './Modal'
import type { InfoTopic } from './Footer'

const INFO: Record<InfoTopic, { title: string; text: string[] }> = {
  about: {
    title: 'О компании',
    text: [
      'Coffee – небольшая кофейня, где кофе варят из свежеобжаренной арабики, а десерты пекут каждое утро.',
      'Заказ можно сделать онлайн и забрать без очереди или выпить в зале.',
    ],
  },
  contacts: {
    title: 'Контакты',
    text: ['Новокузнецк, ул. Кирова, 1 (адрес условный).', 'Ежедневно с 8:00 до 22:00.', 'Телефон: +7 999 999 99 99.'],
  },
  help: {
    title: 'Помощь',
    text: [
      'Нажмите «Заказать» на карточке, чтобы добавить позицию в корзину, и «Онлайн заказ», чтобы оформить его.',
      'Время получения выбирается с шагом 15 минут. Оплата – при получении.',
    ],
  },
}

export default function InfoDialog({ topic, onClose }: { topic: InfoTopic | null; onClose: () => void }) {
  const info = topic ? INFO[topic] : null
  return (
    <Modal open={Boolean(info)} onClose={onClose} labelledBy="info-title" className="info">
      {info && (
        <div style={{ padding: '36px 32px 32px', maxWidth: 560 }}>
          <h2 className="modal__title" id="info-title">{info.title}</h2>
          {info.text.map((t) => <p key={t} className="info__text">{t}</p>)}
        </div>
      )}
    </Modal>
  )
}
