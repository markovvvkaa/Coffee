import { useEffect, useRef, type ReactNode } from 'react'
import './Modal.css'

interface Props {
  open: boolean
  onClose: () => void
  labelledBy: string
  className?: string
  children: ReactNode
}

export default function Modal({ open, onClose, labelledBy, className = '', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      const opener = document.activeElement as HTMLElement | null
      dialog.showModal()
      document.body.classList.add('no-scroll')
      return () => {
        document.body.classList.remove('no-scroll')
        if (dialog.open) dialog.close()
        opener?.focus?.()
      }
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      {open && (
        <div className="modal__box">
          <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {children}
        </div>
      )}
    </dialog>
  )
}
