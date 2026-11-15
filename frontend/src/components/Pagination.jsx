import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

function buildPages(currentPage, lastPage) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  const pages = [1]

  if (currentPage > 4) {
    pages.push('awal')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(lastPage - 1, currentPage + 1)

  for (let page = start; page <= end; page++) {
    pages.push(page)
  }

  if (currentPage < lastPage - 3) {
    pages.push('akhir')
  }

  pages.push(lastPage)

  return pages
}

export default function Pagination({ meta, onPageChange, disabled = false }) {
  if (!meta || meta.last_page <= 1) {
    return null
  }

  const currentPage = meta.current_page
  const pages = buildPages(currentPage, meta.last_page)

  const goTo = (page) => {
    if (disabled || page === currentPage || page < 1 || page > meta.last_page) {
      return
    }

    onPageChange(page)
  }

  return (
    <nav aria-label="Navigasi halaman hasil tani" className="mt-8 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {pages.map((page) =>
          typeof page === 'number' ? (
            <button
              key={page}
              type="button"
              onClick={() => goTo(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              disabled={disabled}
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-semibold transition ${
                page === currentPage
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span
              key={page}
              className="inline-flex h-10 w-8 items-center justify-center text-sm text-stone-400"
              aria-hidden="true"
            >
              &hellip;
            </span>
          ),
        )}

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={disabled || currentPage === meta.last_page}
          className="inline-flex h-10 items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>

      {typeof meta.total === 'number' ? (
        <p className="text-xs text-stone-500">
          Menampilkan {meta.from ?? 0}&ndash;{meta.to ?? 0} dari {meta.total} produk
        </p>
      ) : null}
    </nav>
  )
}
