import { useEffect, useId } from 'react'
import { CloseIcon } from '../Icons'

const sizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
}

export default function Modal({
  open,
  onClose,
  title,
  description = null,
  children,
  footer = null,
  size = 'md',
  closeOnBackdrop = true,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={closeOnBackdrop ? onClose : undefined}
        className={`absolute inset-0 h-full w-full bg-stone-950/50 backdrop-blur-[2px] ${
          closeOnBackdrop ? 'cursor-default' : 'cursor-not-allowed'
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${
          sizes[size] ?? sizes.md
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-semibold text-stone-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-stone-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            aria-label="Tutup"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">{children}</div>

        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-stone-200 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
