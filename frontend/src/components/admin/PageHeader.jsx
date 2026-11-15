import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '../Icons'

export default function PageHeader({
  title,
  description = null,
  actions = null,
  backTo = null,
  backLabel = 'Kembali',
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backTo ? (
          <Link
            to={backTo}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-emerald-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-stone-500">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
