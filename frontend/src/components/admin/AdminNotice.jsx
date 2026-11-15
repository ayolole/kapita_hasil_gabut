import { AlertIcon, CheckCircleIcon, CloseIcon, InfoIcon } from '../Icons'

const variants = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
    Icon: CheckCircleIcon,
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-800',
    icon: 'text-red-600',
    Icon: AlertIcon,
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: 'text-sky-600',
    Icon: InfoIcon,
  },
}

export default function AdminNotice({
  variant = 'info',
  children,
  onDismiss = null,
  className = '',
}) {
  const style = variants[variant] ?? variants.info
  const Icon = style.Icon

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${style.wrapper} ${className}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 transition hover:bg-black/5"
          aria-label="Tutup pesan"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
