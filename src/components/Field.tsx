import type { ReactNode } from 'react'
import './Field.css'

interface Props {
  id: string
  label: string
  error?: string
  hint?: string
  children: (aria: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode
}

export default function Field({ id, label, error, hint, children }: Props) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? <span className="field__error" id={`${id}-error`}>{error}</span>
        : hint ? <span className="field__hint" id={`${id}-hint`}>{hint}</span> : null}
    </div>
  )
}
