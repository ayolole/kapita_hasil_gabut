import { getErrorMessage } from '../lib/api'
import { AlertIcon, PackageIcon, RefreshIcon, SearchIcon } from './Icons'

export function LoadingState({ label = 'Memuat data...' }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16">
      <span
        className="h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700"
        aria-hidden="true"
      />
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
        >
          <div className="skeleton aspect-4/3 rounded-none" />
          <div className="space-y-3 p-4">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-3 w-1/2" />
            <div className="skeleton h-5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FarmerGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="mt-4 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({
  error,
  onRetry,
  title = 'Gagal memuat data',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertIcon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-stone-600">{getErrorMessage(error)}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-secondary mt-5">
          <RefreshIcon className="h-4 w-4" />
          Coba lagi
        </button>
      ) : null}
    </div>
  )
}

export function EmptyState({
  title = 'Belum ada data',
  description = 'Data akan tampil di sini setelah tersedia.',
  action = null,
  icon = 'package',
  className = '',
}) {
  const Icon = icon === 'search' ? SearchIcon : PackageIcon

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center ${className}`}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-semibold text-stone-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-stone-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
