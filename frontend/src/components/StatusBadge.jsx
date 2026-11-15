const styles = {
  tersedia: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  terbatas: 'bg-amber-100 text-amber-800 ring-amber-600/20',
  habis: 'bg-stone-200 text-stone-600 ring-stone-500/20',
  akan_panen: 'bg-sky-100 text-sky-800 ring-sky-600/20',
}

export default function StatusBadge({ status, className = '' }) {
  const value = status?.value ?? 'tersedia'
  const label = status?.label ?? 'Tersedia'

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[value] ?? styles.tersedia
      } ${className}`}
    >
      {label}
    </span>
  )
}
