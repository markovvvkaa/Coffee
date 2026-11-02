import './Pagination.css'

interface Props {
  page: number
  pages: number
  onPage: (page: number) => void
}

export default function Pagination({ page, pages, onPage }: Props) {
  if (pages < 2) return null
  return (
    <nav className="pagination" aria-label="Страницы меню">
      <button type="button" className="pagination__btn" onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Предыдущая страница">‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n} type="button" className="pagination__btn"
          aria-current={n === page ? 'page' : undefined} aria-label={`Страница ${n}`}
          onClick={() => onPage(n)}
        >{n}</button>
      ))}
      <button type="button" className="pagination__btn" onClick={() => onPage(page + 1)} disabled={page === pages} aria-label="Следующая страница">›</button>
    </nav>
  )
}
