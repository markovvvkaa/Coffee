import './Logo.css'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`logo ${className}`}>
      <span className="visually-hidden">Coffee</span>
      <span className="logo__word" aria-hidden="true">
        C
        <svg className="logo__bean" viewBox="0 0 40 40" focusable="false">
          <ellipse cx="20" cy="20" rx="17" ry="13" transform="rotate(-35 20 20)" fill="currentColor" />
          <path d="M8 29 C 17 25 15 15 32 11" stroke="var(--logo-slit, var(--cream))" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </svg>
        ffee
      </span>
    </span>
  )
}
